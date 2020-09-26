/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElement from '@/graph-element/GraphElement'
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import VertexServerFormatBuilder from '@/vertex/VertexServerFormatBuilder'
import GraphElementType from '@/graph-element/GraphElementType'
import Store from '@/store'
import I18n from '@/I18n'
import Selection from '@/Selection'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import ShareLevel from "../vertex/ShareLevel";

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new api.Relation().init(serverFormat);
};
api.withLabelSelfSourceAndDestinationUri = function (label, uri, sourceUri, destinationUri) {
    let edge = new api.Relation().init(
        api.buildObjectWithUriOfSelfSourceAndDestinationVertex(
            uri,
            sourceUri,
            destinationUri
        )
    );
    edge.setLabel(label);
    return edge;
};
api.withUriAndSourceAndDestinationVertex = function (uri, sourceVertex, destinationVertex) {
    return new api.Relation().init(
        {
            graphElement: GraphElement.buildObjectWithUri(
                uri
            )
        },
        sourceVertex,
        destinationVertex
    );
};
api.buildObjectWithUriOfSelfSourceAndDestinationVertex = function (uri, sourceVertexUri, destinationVertexUri) {
    return {
        graphElement: GraphElement.buildObjectWithUri(
            uri
        ),
        sourceVertex: VertexServerFormatBuilder.buildWithUri(
            sourceVertexUri
        ),
        destinationVertex: VertexServerFormatBuilder.buildWithUri(
            destinationVertexUri
        )
    };
};
api.buildServerFormatFromUi = function (edgeUi) {
    return {
        graphElement: GraphElement.buildServerFormatFromUi(
            edgeUi
        ),
        sourceVertex: VertexServerFormatBuilder.buildWithUri(
            edgeUi.getSourceVertex().getUri()
        ),
        destinationVertex: VertexServerFormatBuilder.buildWithUri(
            edgeUi.getDestinationVertex().getUri()
        )
    };
};
api.Relation = function () {
};

api.Relation.prototype = new GraphElement.GraphElement();

api.Relation.prototype.init = function (edgeServerFormat, source, destination) {
    this._sourceVertex = source ? source : FriendlyResource.fromServerFormat(
        VertexServerFormatBuilder.getFriendlyResourceServerObject(
            edgeServerFormat.sourceVertex || edgeServerFormat.sourceGroupRelation
        )
    );
    this._destinationVertex = destination ? destination : FriendlyResource.fromServerFormat(
        VertexServerFormatBuilder.getFriendlyResourceServerObject(
            edgeServerFormat.destinationVertex || edgeServerFormat.destinationGroupRelation
        )
    );
    GraphElement.GraphElement.apply(
        this
    );
    GraphElement.GraphElement.prototype.init.call(
        this,
        edgeServerFormat.graphElement
    );
    this._edgeServerFormat = edgeServerFormat;
    this.isExpanded = true;
    this.children = [];
    return this;
};


api.Relation.prototype.clone = function () {
    let edge = new api.Relation();
    edge.init(
        JSON.parse(JSON.stringify(this._edgeServerFormat)),
        this.getSourceVertex(),
        this.getDestinationVertex()
    );
    return edge;
};

api.Relation.prototype.getDuplicates = function () {
    return CurrentSubGraph.get().getEdgesWithUri(
        this.getUri()
    ).filter((edge) => {
        return edge.getId() !== this.getId();
    });
};


api.Relation.prototype.getNbDuplicates = function () {
    return CurrentSubGraph.get().getEdgesWithUri(
        this.getUri()
    ).length - 1;
};

api.Relation.prototype.getGraphElementType = function () {
    return GraphElementType.Relation;
};

api.Relation.prototype.updateSourceOrDestination = function (vertex) {
    if (this.getSourceVertex().isSameUri(vertex)) {
        this.setSourceVertex(vertex);
    } else if (this.getDestinationVertex().isSameUri(vertex)) {
        this.setDestinationVertex(vertex);
    } else {
        console.warn("trying to update non related source or destination vertex to " + this.getLabel())
    }
};

api.Relation.prototype.getWhenEmptyLabel = function () {
    return I18n.i18next.t("edge:default");
};

api.Relation.prototype.replaceChild = api.Relation.prototype.replaceRelatedVertex = function (relatedVertex, newVertex) {
    if (relatedVertex.isToTheLeft()) {
        newVertex.makeLeft();
    } else {
        newVertex.makeRight();
    }
    if (this.getSourceVertex().isSameUri(relatedVertex)) {
        this.setSourceVertex(newVertex);
    } else if (this.getDestinationVertex().isSameUri(relatedVertex)) {
        this.setDestinationVertex(newVertex);
    } else {
        console.warn("trying to update non related source or destination vertex to " + this.getLabel())
    }
};

api.Relation.prototype.setSourceVertex = function (sourceVertex) {
    this._sourceVertex = sourceVertex;
};

api.Relation.prototype.setParentFork = function (newEndFork) {
    let parentVertex = newEndFork.isGroupRelation() ? newEndFork.getParentVertex() : newEndFork;
    if (this.isInverse()) {
        this.setDestinationVertex(newEndFork);
        this.getSourceVertex().parentVertex = parentVertex;
    } else {
        this.setSourceVertex(newEndFork);
        this.getDestinationVertex().parentVertex = parentVertex;
    }
    this.parentVertex = parentVertex;
};

api.Relation.prototype.setDestinationVertex = function (destinationVertex) {
    this._destinationVertex = destinationVertex;
};

api.Relation.prototype.getSourceVertex = function () {
    return this._sourceVertex;
};
api.Relation.prototype.getDestinationVertex = function () {
    return this._destinationVertex;
};

api.Relation.prototype.isPublic = function () {
    return this.getSourceVertex().isPublic() &&
        this.getDestinationVertex().isPublic();
};
api.Relation.prototype.isPrivate = function () {
    return this.getSourceVertex().isPrivate() ||
        this.getDestinationVertex().isPrivate();
};

api.Relation.prototype.isFriendsOnly = function () {
    return this.getSourceVertex().isFriendsOnly() &&
        this.getDestinationVertex().isFriendsOnly();
};

api.Relation.prototype.getShareLevel = function () {
    let sourceShareLevel = this.getSourceVertex().getShareLevel();
    let destinationShareLevel = this.getDestinationVertex().getShareLevel();
    if (sourceShareLevel === destinationShareLevel) {
        return sourceShareLevel;
    }
    return ShareLevel.getIndex(sourceShareLevel) < ShareLevel.getIndex(destinationShareLevel) ? sourceShareLevel : destinationShareLevel;
};

api.Relation.prototype.getOtherVertex = function (vertex) {
    return this.getSourceVertex().getUri() === vertex.getUri() ?
        this.getDestinationVertex() : this.getSourceVertex();
};

api.Relation.prototype.getNextBubble = function () {
    return this.isInverse() ?
        this.getSourceVertex() :
        this.getDestinationVertex();
};

api.Relation.prototype.getRightBubble = function () {
    if (this.isToTheLeft()) {
        return this.getParentBubble()
    } else {
        return this.getNextBubble()
    }
};

api.Relation.prototype.inverse = function () {
    let sourceVertex = this.getSourceVertex();
    let destinationVertex = this.getDestinationVertex();
    this.setSourceVertex(destinationVertex);
    this.setDestinationVertex(sourceVertex);
    Store.dispatch("redraw");
};

api.Relation.prototype.isInverse = function () {
    return this.getDestinationVertex().isGroupRelation() || this.getSourceVertex().getUri() !== this.getParentFork().getUri();
};

api.Relation.prototype.getLeftBubble = function () {
    if (this.isToTheLeft()) {
        return this.getNextBubble();
    } else {
        return this.getParentBubble();
    }
};

api.Relation.prototype.getNextChildrenEvenIfCollapsed = api.Relation.prototype.getNextChildren = function () {
    return [
        this.getOtherVertex(this.getParentFork())
    ].concat(this.children);
};

api.Relation.prototype.addChild = function (child) {
    child.parentBubble = this;
    child.parentVertex = this.parentVertex;
    this.children.push(child);
};

api.Relation.prototype.removeChild = function (child, isTemporary, avoidRedraw) {
    let l = this.children.length;
    while (l--) {
        if (this.children[l].getId() === child.getId()) {
            this.children.splice(l, 1);
        }
    }
    if (!isTemporary) {
        this.refreshChildren(avoidRedraw);
    }
};

api.Relation.prototype.getNumberOfChild = function () {
    return 1 + this.children.length;
};

api.Relation.prototype.isLeaf = function () {
    return false;
};

api.Relation.prototype.isShrinked = function (shouldBeWhenNotSelected) {
    if (!shouldBeWhenNotSelected && Selection.isSelected(this)) {
        return false;
    }
    if (this.isLabelEmpty()) {
        return true;
    }
    return this.isLabelSameAsParentGroupRelation();
};

api.Relation.prototype.remove = function (preventRemoveDuplicates) {
    CurrentSubGraph.get().remove(this);
    if (!preventRemoveDuplicates) {
        this.getDuplicates().forEach((duplicate) => {
            duplicate.remove(true);
        });
    }
    this.getParentBubble().removeChild(this);
};

api.Relation.prototype.getChip = function () {
    let html = this.getHtml();
    if (html) {
        return html.querySelectorAll('.v-chip')[0];
    }
};

api.Relation.prototype.canExpand = function () {
    return false;
};

api.Relation.prototype.getShownBubble = function () {
    return this.shouldShow() ? this : this.getNextBubble();
};

api.Relation.prototype.shouldShow = function () {
    return Store.state.isShowRelations || ((!this.isPristine() && !this.isLabelSameAsParentGroupRelation()) || this.focusRelation);
}

api.Relation.prototype.isPristine = function () {
    return GraphElement.GraphElement.prototype.isPristine.call(
        this,
    ) && !this.isInverse();
};

api.Relation.prototype.deselect = function () {
    FriendlyResource.FriendlyResource.prototype.deselect.call(this);
    this.focusRelation = false;
    if (!this.shouldShow()) {
        this.refreshContent();
        this.refreshChildren();
    }
}

export default api;
