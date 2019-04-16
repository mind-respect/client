/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import GraphElement from '@/graph-element/GraphElement'
import Edge from '@/edge/Edge'
import Suggestion from '@/suggestion/Suggestion'
import ShareLevel from '@/vertex/ShareLevel'
import GraphElementType from '@/graph-element/GraphElementType'
import I18n from '@/I18n'
import Store from '@/store'
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import Vue from 'vue'

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new Vertex(
        serverFormat
    );
};
api.withUri = function (uri) {
    return new Vertex(
        api.buildServerFormatFromUri(
            uri
        )
    );
};
api.buildServerFormatFromUri = function (uri) {
    return {
        vertex: {
            graphElement: GraphElement.buildObjectWithUri(uri),
            includedEdges: {},
            includedVertices: {},
            shareLevel: ShareLevel.PRIVATE,
            suggestions: {}
        }
    };
};
api.buildServerFormatFromUi = function (vertexUi) {
    return {
        vertex: {
            graphElement: GraphElement.buildServerFormatFromUi(
                vertexUi
            ),
            includedEdges: {},
            includedVertices: {},
            isPublic: vertexUi.getModel().isPublic(),
            numberOfConnectedEdges: vertexUi.connectedEdges().length,
            suggestions: {}
        }
    };
};

function Vertex(vertexServerFormat) {
    this.vertexServerFormat = vertexServerFormat;
    this.vertexServerFormat.vertex.numberOfConnectedEdges = this.vertexServerFormat.vertex.numberOfConnectedEdges || 0;
    this._includedVertices = this._buildIncludedVertices();
    this._includedEdges = this._buildIncludedEdges();
    this._suggestions = this._buildSuggestions();
    this.leftBubbles = [];
    this.leftBubblesCollapsed = null;
    this.rightBubbles = [];
    this.rightBubblesCollapsed = null;
    GraphElement.GraphElement.apply(
        this
    );
    this.init(vertexServerFormat.vertex.graphElement);
    if(this.getNumberOfChild() === 0){
        this.isExpanded = true;
    }
}

Vertex.prototype = new GraphElement.GraphElement();

Vertex.prototype.hasIncludedGraphElements = function () {
    return Object.keys(this.getIncludedVertices()).length > 0;
};

Vertex.prototype.getIncludedVertices = function () {
    return this._includedVertices;
};
Vertex.prototype.getIncludedEdges = function () {
    return this._includedEdges;
};
Vertex.prototype.setSuggestions = function (suggestions) {
    return this._suggestions = suggestions;
};
Vertex.prototype.getSuggestions = function () {
    return this._suggestions;
};
Vertex.prototype.getNumberOfConnectedEdges = function () {
    return this.vertexServerFormat.vertex.numberOfConnectedEdges;
};

Vertex.prototype.getNumberOfChild = function () {
    let children = this.getImmediateChild();
    return children.length ? children.length : this.getNumberOfConnectedEdges() - 1;
};


Vertex.prototype.decrementNumberOfConnectedEdges = function () {
    this.vertexServerFormat.vertex.numberOfConnectedEdges--;
};

Vertex.prototype.incrementNbPublicNeighbors = function () {
    this.vertexServerFormat.vertex.nbPublicNeighbors++;
};

Vertex.prototype.decrementNbPublicNeighbors = function () {
    this.vertexServerFormat.vertex.nbPublicNeighbors--;
};

Vertex.prototype.getNbPublicNeighbors = function () {
    return this.vertexServerFormat.vertex.nbPublicNeighbors;
};

Vertex.prototype.getNbFriendNeighbors = function () {
    return this.vertexServerFormat.vertex.nbFriendNeighbors;
};

Vertex.prototype.incrementNbFriendNeighbors = function () {
    this.vertexServerFormat.vertex.nbFriendNeighbors++;
};

Vertex.prototype.decrementNbFriendNeigbors = function () {
    this.vertexServerFormat.vertex.nbFriendNeighbors--;
};

Vertex.prototype.hasOnlyOneHiddenChild = function () {
    return 2 === this.getNumberOfConnectedEdges();
};

Vertex.prototype.isPublic = function () {
    return this.getShareLevel() === ShareLevel.PUBLIC ||
        this.getShareLevel() === ShareLevel.PUBLIC_WITH_LINK;
};

Vertex.prototype.isPrivate = function () {
    return this.getShareLevel() === ShareLevel.PRIVATE;
};

Vertex.prototype.isFriendsOnly = function () {
    return this.getShareLevel() === ShareLevel.FRIENDS;
};

Vertex.prototype.getShareLevel = function () {
    return this.vertexServerFormat.vertex.shareLevel;
};

Vertex.prototype.makePrivate = function () {
    this.setShareLevel(ShareLevel.PRIVATE);
};

Vertex.prototype.makePublic = function () {
    this.setShareLevel(ShareLevel.PUBLIC);
};

Vertex.prototype.setShareLevel = function (shareLevel) {
    this.vertexServerFormat.vertex.shareLevel = shareLevel;
};

Vertex.prototype.getGraphElementType = function () {
    return GraphElementType.Vertex;
};

Vertex.prototype.makeCenter = function () {
    this.isCenter = true;
    this.parentBubble = this;
    this.isExpanded = true;
    this.orientation = "center"
};

Vertex.prototype.getParentVertex = function () {
    return this.parentBubble.getOtherVertex(this);
};

Vertex.prototype.getRelationWithUiParent = function () {
    return this.parentBubble;
};

Vertex.prototype.addChild = function (child, isToTheLeft, index) {
    let children;
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
        child.orientation = this.orientation;
    }
    if (index === undefined) {
        children.push(child)
    } else {
        children.splice(index, 0, child);
    }
};

Vertex.prototype.getRightBubble = function (bottom) {
    let index = bottom ? this.rightBubbles.length - 1 : 0;
    if (this.isCenter) {
        return this.rightBubbles[index];
    }
    if (this.isToTheLeft()) {
        return this.parentBubble;
    }
    return this.rightBubbles[index];
};

Vertex.prototype.getLeftBubble = function (bottom) {
    if (this.isCenter) {
        let index = bottom ? this.leftBubbles.length - 1 : 0;
        return this.leftBubbles[index];
    }
    if (this.isToTheLeft()) {
        let index = bottom ? this.rightBubbles.length - 1 : 0;
        return this.rightBubbles[index];
    }
    return this.parentBubble;
};

Vertex.prototype.collapse = function () {
    this.vertexServerFormat.vertex.numberOfConnectedEdges = this.getImmediateChild().length + 1;
    this.rightBubblesCollapsed = this.rightBubbles;
    this.leftBubblesCollapsed = this.leftBubbles;
    this.rightBubbles = [];
    this.leftBubbles = [];
    Vue.nextTick(function () {
        FriendlyResource.FriendlyResource.prototype.collapse.call(
            this
        );
    }.bind(this));
};

Vertex.prototype.expand = function () {
    FriendlyResource.FriendlyResource.prototype.expand.call(
        this
    );
    this.isExpanded = false; // to make the expand animation work in next tick
    Vue.nextTick(function () {
        if (this.rightBubblesCollapsed !== null) {
            this.rightBubbles = this.rightBubblesCollapsed;
            this.rightBubblesCollapsed = null;
        }
        if (this.leftBubblesCollapsed !== null) {
            this.leftBubbles = this.leftBubblesCollapsed;
            this.leftBubblesCollapsed = null;
        }
        this.isExpanded = true;
    }.bind(this))
};

Vertex.prototype.getImmediateChild = function (isToTheLeft) {
    if (this.isCollapsed) {
        return [];
    }
    if (this.isCenter) {
        if (isToTheLeft === undefined) {
            return this.leftBubbles.concat(this.rightBubbles);
        } else {
            return isToTheLeft ? this.leftBubbles : this.rightBubbles;
        }
    } else {
        return this.rightBubbles;
    }
};

Vertex.prototype.remove = function () {
    this.getParentBubble().remove();
};

Vertex.prototype.replaceChild = function (existingChild, newChild) {
    let index = this.getChildIndex(existingChild);
    this.removeChild(existingChild);
    this.addChild(
        newChild,
        existingChild.isToTheLeft(),
        index
    );
};

Vertex.prototype.removeChild = function (child) {
    let childrenArray = this.isCenter && child.isToTheLeft() ? this.leftBubbles : this.rightBubbles;
    let l = childrenArray.length;
    while (l--) {
        if (childrenArray[l].getId() === child.getId()) {
            childrenArray.splice(l, 1);
        }
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

Vertex.prototype.buildChildrenIndex = function () {
    let childrenIndex = {};
    let index = 0;
    this.visitAllImmediateChild(function (child) {
        if (child.isRelation()) {
            let otherVertex = child.getOtherVertex(
                this
            );
            setChildVertexIndex.bind(this)(
                otherVertex.getUri(),
                child.isToTheLeft(),
                otherVertex
            );
        } else if (child.isGroupRelation()) {
            var grandChildIndex = child.buildChildrenIndex();
            Object.keys(grandChildIndex).sort(function (a, b) {
                return grandChildIndex[a].index - grandChildIndex[b].index;
            }).forEach(function (vertexUri) {
                setChildVertexIndex.bind(this)(vertexUri, child.isToTheLeft(), child);
            }.bind(this));
        }
    }.bind(this));
    return childrenIndex;

    function setChildVertexIndex(childVertexUri, isToTheLeft, child) {
        let previousValue = this.getModel().getChildrenIndex()[childVertexUri];
        if (!this.isCenterBubble() && previousValue) {
            isToTheLeft = previousValue.toTheLeft;
        }
        childrenIndex[childVertexUri] = {
            index: index,
            toTheLeft: isToTheLeft,
            label: child.getLabel(),
            type: child.getGraphElementType()
        };
        index++;
    }
};

Vertex.prototype._buildIncludedEdges = function () {
    var includedEdges = {};
    if (this.vertexServerFormat.vertex.includedEdges === undefined) {
        return includedEdges;
    }
    $.each(this.vertexServerFormat.vertex.includedEdges, function (key, value) {
        includedEdges[key] = Edge.fromServerFormat(
            value
        );
    });
    return includedEdges;
};

Vertex.prototype._buildIncludedVertices = function () {
    var includedVertices = {};
    if (this.vertexServerFormat.vertex.includedVertices === undefined) {
        return includedVertices;
    }
    $.each(this.vertexServerFormat.vertex.includedVertices, function (key, value) {
        includedVertices[key] = api.fromServerFormat(
            value
        );
    });
    return includedVertices;
};

Vertex.prototype.hasSuggestions = function () {
    let suggestions = this.getSuggestions();
    return suggestions !== undefined && suggestions.length > 0;
};

Vertex.prototype._buildSuggestions = function () {
    var suggestions = [];
    if (this.vertexServerFormat.vertex.suggestions === undefined) {
        return suggestions;
    }
    return Suggestion.fromServerArray(
        this.vertexServerFormat.vertex.suggestions
    );
};
Vertex.prototype.addSuggestions = function (suggestions) {
    this._suggestions = this._suggestions.concat(
        suggestions
    );
};

Vertex.prototype.isMeta = function () {
    return this.getGraphElementType() === GraphElementType.Meta;
};

Vertex.prototype.isImmediateChildOfGroupRelation = function () {
    return this.parentBubble.parentBubble.isGroupRelation();
};

export default api;
