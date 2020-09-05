/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElement from '@/graph-element/GraphElement'
import ShareLevel from '@/vertex/ShareLevel'
import GraphElementType from '@/graph-element/GraphElementType'
import I18n from '@/I18n'
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import NbNeighbors from './NbNeighbors'
import Fork from '@/fork/Fork'
import IdUri from "../IdUri";

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new Vertex().init(
        serverFormat
    );
};

api.fromGraphElementServerFormat = function (graphElementServerFormat) {
    return new Vertex().init({
        graphElement: graphElementServerFormat,
        shareLevel: ShareLevel.PRIVATE,
        nbNeighbors: NbNeighbors.withZeros().toJsonObject()
    });
};

api.withUri = function (uri) {
    return new Vertex().init(
        api.buildServerFormatFromUri(
            uri
        )
    )
};
api.buildServerFormatFromUri = function (uri) {
    return {
        graphElement: GraphElement.buildObjectWithUri(uri),
        shareLevel: ShareLevel.PRIVATE,
        nbNeighbors: NbNeighbors.withZeros().toJsonObject()
    };
};
api.buildServerFormatFromUi = function (vertexUi) {
    return {
        graphElement: GraphElement.buildServerFormatFromUi(
            vertexUi
        ),
        nbNeighbors: vertexUi.buildNbNeighbors().toJsonObject()
    };
};

function Vertex() {
}

Vertex.prototype = new Fork.Fork();

Vertex.prototype.init = function (vertexServerFormat) {
    this._vertexServerFormat = vertexServerFormat;
    this.leftBubbles = [];
    this.leftBubblesCollapsed = null;
    this.rightBubbles = [];
    this.rightBubblesCollapsed = null;
    Fork.Fork.apply(
        this
    );
    Fork.Fork.prototype.init.call(
        this,
        vertexServerFormat
    );
    return this;
};


Vertex.prototype.clone = function () {
    let vertex = new Vertex();
    vertex.init(
        JSON.parse(JSON.stringify(this._vertexServerFormat))
    );
    vertex.uiId = IdUri.uuid();
    return vertex;
};

Vertex.prototype.getNumberOfChild = function (isLeft) {
    let children = this.getNextChildren(isLeft);
    return children.length ? children.length : this.nbNeighbors.getTotalChildren();
};

Vertex.prototype.resetChildren = function () {
    let subGraph = CurrentSubGraph.get();
    this.getDescendants(undefined, undefined, true).forEach((child) => {
        subGraph.remove(child);
    });
    this.isCollapsed = false;
    this.leftBubbles = [];
    this.rightBubbles = [];
    this.leftBubblesCollapsed = null;
    this.rightBubblesCollapsed = null;
};

Vertex.prototype.getGraphElementType = function () {
    return GraphElementType.Vertex;
};

Vertex.prototype.makeCenter = function () {
    this.isCenter = true;
    this.parentBubble = this;
    this.isExpanded = true;
    this.direction = "center";
    CurrentSubGraph.get().center = this;
};

Vertex.prototype.getDuplicates = function () {
    return CurrentSubGraph.get().getVerticesWithUri(
        this.getUri()
    ).filter((vertex) => {
        return vertex.getId() !== this.getId();
    });
};

Vertex.prototype.getNbDuplicates = function () {
    return CurrentSubGraph.get().getVerticesWithUri(
        this.getUri()
    ).length - 1;
};

Vertex.prototype.addChild = async function (child, isToTheLeft, index) {
    if (this.isCollapsed) {
        this.expand(true, true);
    }
    let children;
    child.parentBubble = child.parentVertex = this;
    if (this.isCenter) {
        if (this._shouldAddLeft(isToTheLeft)) {
            children = this.leftBubbles;
            child.makeLeft()
        } else {
            children = this.rightBubbles;
            child.makeRight();
        }
    } else {
        children = this.rightBubbles;
        child.direction = this.direction;
    }
    if (index === undefined) {
        index = this.areTagsShown ? children.filter((child) => {
            return !child.isMetaRelation();
        }).length : children.length;
    } else {
        index = Math.min(index, children.length);
    }
    children.splice(index, 0, child);
};

Vertex.prototype.getRightBubble = function (bottom) {
    let index = bottom ? this.rightBubbles.length - 1 : 0;
    let rightBubble;
    if (this.isCenter) {
        rightBubble = this.rightBubbles[index];
    }
    if (this.isToTheLeft()) {
        return this.getShownParentBubble();
    } else {
        rightBubble = this.rightBubbles[index];
    }
    if (rightBubble) {
        return rightBubble.getShownBubble()
    }
};

Vertex.prototype.getLeftBubble = function (bottom) {
    let leftBubble;
    if (this.isCenter) {
        let index = bottom ? this.leftBubbles.length - 1 : 0;
        leftBubble = this.leftBubbles[index];
    } else if (this.isToTheLeft()) {
        let index = bottom ? this.rightBubbles.length - 1 : 0;
        leftBubble = this.rightBubbles[index];
    } else {
        return this.getShownParentBubble();
    }
    if (leftBubble) {
        return leftBubble.getShownBubble();
    }
};

Vertex.prototype.isPattern = function () {
    return this._vertexServerFormat.isPattern;
};

Vertex.prototype.makePattern = function () {
    this._vertexServerFormat.isPattern = true;
};

Vertex.prototype.undoPattern = function () {
    this._vertexServerFormat.isPattern = false;
};

Vertex.prototype.collapse = function (preventScroll, preventApplyToDescendants) {
    if (this.isCenter) {
        FriendlyResource.FriendlyResource.prototype.collapseDescendants.call(
            this,
            preventScroll,
            preventApplyToDescendants
        );
        this.refreshChildren();
        return;
    }
    if (!this.isExpanded) {
        return;
    }
    this.nbNeighbors = this.buildNbNeighbors();
    this.rightBubblesCollapsed = this.rightBubbles;
    this.leftBubblesCollapsed = this.leftBubbles;
    this.rightBubbles = [];
    this.leftBubbles = [];
    FriendlyResource.FriendlyResource.prototype.collapse.call(
        this,
        preventScroll,
        preventApplyToDescendants
    );
};

Vertex.prototype.expand = function (avoidCenter, isFirstExpand) {
    FriendlyResource.FriendlyResource.prototype.expand.call(
        this,
        avoidCenter,
        isFirstExpand
    );
    if (this.rightBubblesCollapsed !== null) {
        this.rightBubbles = this.rightBubblesCollapsed;
        this.rightBubblesCollapsed = null;
    }
    if (this.leftBubblesCollapsed !== null) {
        this.leftBubbles = this.leftBubblesCollapsed;
        this.leftBubblesCollapsed = null;
    }
};

Vertex.prototype.getNextChildrenEvenIfCollapsed = function (isToTheLeft) {
    if (this.isCollapsed) {
        return this.leftBubblesCollapsed.concat(this.rightBubblesCollapsed);
    } else {
        return this.getNextChildren(isToTheLeft);
    }
};


Vertex.prototype.getNextChildren = function (toTheLeft) {
    if (this.isCollapsed) {
        return [];
    }
    if (this.isCenter) {
        if (toTheLeft === undefined) {
            let nbLeft = this.leftBubbles.length;
            let nbRight = this.rightBubbles.length;
            let nbChild = nbLeft + nbRight;
            let index = 0;
            let rightIndex = 0;
            let leftIndex = 0;
            return [...Array(nbChild).keys()].map(() => {
                let isRightTurn = index % 2 === 0;
                index++;
                if (isRightTurn && nbRight > rightIndex) {
                    rightIndex++;
                    return this.rightBubbles[rightIndex - 1];
                } else if (nbLeft > leftIndex) {
                    leftIndex++;
                    return this.leftBubbles[leftIndex - 1];
                } else {
                    rightIndex++;
                    return this.rightBubbles[rightIndex - 1];
                }
            });
        } else {
            return toTheLeft ? this.leftBubbles : this.rightBubbles;
        }
    } else {
        return this.rightBubbles;
    }
};

Vertex.prototype.remove = function (preventRemoveDescendants) {
    if (!preventRemoveDescendants) {
        this.getDescendantsEvenIfCollapsed().forEach((bubble) => {
            CurrentSubGraph.get().remove(bubble);
        });
        this.getDuplicates().forEach((duplicate) => {
            duplicate.remove(true);
        });
    }
    CurrentSubGraph.get().remove(this);
    this.getParentBubble().remove(true);
};

Vertex.prototype.removeChild = function (child, isTemporary, avoidRedraw) {
    let childrenArray = this.isCenter && child.isToTheLeft() ? this.leftBubbles : this.rightBubbles;
    let removedChild;
    let l = childrenArray.length;
    while (l--) {
        if (childrenArray[l].getId() === child.getId()) {
            removedChild = childrenArray.splice(l, 1);
        }
    }
    if (!isTemporary) {
        this.refreshChildren(avoidRedraw);
    }
};

api.getWhenEmptyLabel = function () {
    return I18n.i18next.t("vertex:default");
};

Vertex.prototype.getWhenEmptyLabel = function () {
    return api.getWhenEmptyLabel();
};

Vertex.prototype._shouldAddLeft = function (isToTheLeft) {
    if (!this.isCenter) {
        return false;
    }
    if (isToTheLeft === undefined || isToTheLeft === null) {
        return this.leftBubbles.length <
            this.rightBubbles.length;
    }
    return isToTheLeft;
};


Vertex.prototype.isMeta = function () {
    return this.getGraphElementType() === GraphElementType.Meta;
};


Vertex.prototype.getShownParentBubble = function () {
    const parentBubble = this.getParentBubble();
    if (!parentBubble.shouldShow()) {
        return parentBubble.getParentBubble();
    }
    return parentBubble;
};

Vertex.prototype.isParentRelationLess = function () {
    return !this.getShownParentBubble().isEdgeType();
};

api.Vertex = Vertex;

export default api;
