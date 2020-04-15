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
    return new api.Edge().init(serverFormat);
};
api.withLabelSelfSourceAndDestinationUri = function (label, uri, sourceUri, destinationUri) {
    let edge = new api.Edge().init(
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
    return new api.Edge().init(
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
api.Edge = function () {
};

api.Edge.prototype = new GraphElement.GraphElement();

api.Edge.prototype.init = function (edgeServerFormat, source, destination) {
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


api.Edge.prototype.clone = function () {
    let edge = new api.Edge();
    edge.init(
        JSON.parse(JSON.stringify(this._edgeServerFormat)),
        this.getSourceVertex(),
        this.getDestinationVertex()
    );
    return edge;
};

api.Edge.prototype.getDuplicates = function () {
    return CurrentSubGraph.get().getEdgesWithUri(
        this.getUri()
    ).filter((edge) => {
        return edge.getId() !== this.getId();
    });
};


api.Edge.prototype.getNbDuplicates = function () {
    return CurrentSubGraph.get().getEdgesWithUri(
        this.getUri()
    ).length - 1;
};

api.Edge.prototype.getGraphElementType = function () {
    return GraphElementType.Relation;
};

api.Edge.prototype.updateSourceOrDestination = function (vertex) {
    if (this.getSourceVertex().isSameUri(vertex)) {
        this.setSourceVertex(vertex);
    } else if (this.getDestinationVertex().isSameUri(vertex)) {
        this.setDestinationVertex(vertex);
    } else {
        console.warn("trying to update non related source or destination vertex to " + this.getLabel())
    }
};

api.Edge.prototype.getWhenEmptyLabel = function () {
    return I18n.i18next.t("edge:default");
};

api.Edge.prototype.replaceChild = api.Edge.prototype.replaceRelatedVertex = function (relatedVertex, newVertex) {
    if (this.getSourceVertex().isSameUri(relatedVertex)) {
        this.setSourceVertex(newVertex);
    } else if (this.getDestinationVertex().isSameUri(relatedVertex)) {
        this.setDestinationVertex(newVertex);
    } else {
        console.warn("trying to update non related source or destination vertex to " + this.getLabel())
    }
};

api.Edge.prototype.setSourceVertex = function (sourceVertex) {
    this._sourceVertex = sourceVertex;
};

api.Edge.prototype.setParentFork = function (newEndFork) {
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

api.Edge.prototype.setDestinationVertex = function (destinationVertex) {
    this._destinationVertex = destinationVertex;
};

api.Edge.prototype.getSourceVertex = function () {
    return this._sourceVertex;
};
api.Edge.prototype.getDestinationVertex = function () {
    return this._destinationVertex;
};

api.Edge.prototype.isPublic = function () {
    return this.getSourceVertex().isPublic() &&
        this.getDestinationVertex().isPublic();
};
api.Edge.prototype.isPrivate = function () {
    return this.getSourceVertex().isPrivate() ||
        this.getDestinationVertex().isPrivate();
};

api.Edge.prototype.isFriendsOnly = function () {
    return this.getSourceVertex().isFriendsOnly() &&
        this.getDestinationVertex().isFriendsOnly();
};

api.Edge.prototype.getShareLevel = function () {
    let sourceShareLevel = this.getSourceVertex().getShareLevel();
    let destinationShareLevel = this.getDestinationVertex().getShareLevel();
    if (sourceShareLevel === destinationShareLevel) {
        return sourceShareLevel;
    }
    return ShareLevel.getIndex(sourceShareLevel) < ShareLevel.getIndex(destinationShareLevel) ? sourceShareLevel : destinationShareLevel;
};

api.Edge.prototype.getOtherVertex = function (vertex) {
    return this.getSourceVertex().getUri() === vertex.getUri() ?
        this.getDestinationVertex() : this.getSourceVertex();
};

api.Edge.prototype.getNextBubble = function () {
    return this.isInverse() ?
        this.getSourceVertex() :
        this.getDestinationVertex();
};

api.Edge.prototype.getRightBubble = function () {
    if (this.isToTheLeft()) {
        return this.getParentBubble()
    } else {
        return this.getNextBubble()
    }
};

api.Edge.prototype.inverse = function () {
    let sourceVertex = this.getSourceVertex();
    let destinationVertex = this.getDestinationVertex();
    this.setSourceVertex(destinationVertex);
    this.setDestinationVertex(sourceVertex);
    Store.dispatch("redraw");
};

api.Edge.prototype.isInverse = function () {
    return this.getDestinationVertex().isGroupRelation() || this.getSourceVertex().getUri() !== this.getParentFork().getUri();
};

api.Edge.prototype.getLeftBubble = function () {
    if (this.isToTheLeft()) {
        return this.getNextBubble();
    } else {
        return this.getParentBubble();
    }
};

api.Edge.prototype.getNextChildrenEvenIfCollapsed = api.Edge.prototype.getNextChildren = function () {
    return [
        this.getOtherVertex(this.getParentFork())
    ].concat(this.children);
};

api.Edge.prototype.addChild = function (child) {
    child.parentBubble = this;
    child.parentVertex = this.parentVertex;
    this.children.push(child);
};

api.Edge.prototype.removeChild = function (child, isTemporary, avoidRedraw) {
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

api.Edge.prototype.getNumberOfChild = function () {
    return 1 + this.children.length;
};

api.Edge.prototype.isLeaf = function () {
    return false;
};

api.Edge.prototype.isShrinked = function (shouldBeWhenNotSelected) {
    if (!shouldBeWhenNotSelected && Selection.isSelected(this)) {
        return false;
    }
    if (this.isLabelEmpty()) {
        return true;
    }
    return this.isLabelSameAsParentGroupRelation();
};

api.Edge.prototype.remove = function () {
    CurrentSubGraph.get().remove(this);
    this.getParentBubble().removeChild(this);
};

api.Edge.prototype.getChip = function () {
    let html = this.getHtml();
    if (html) {
        return html.querySelectorAll('.v-chip')[0];
    }
};

api.Edge.prototype.canExpand = function () {
    return false;
};

api.Edge.prototype.getTagsNotIncludedInSerialParentGroupRelations = function () {
    let parentBubble = this.getParentBubble();
    if (!parentBubble.isGroupRelation()) {
        return this.getIdentifiers();
    }
    let groupRelationTags = parentBubble.getParentSerialTags();
    return this.getIdentifiers().filter((edgeTag) => {
        return groupRelationTags.every((groupRelationTag) => {
            return groupRelationTag.getExternalResourceUri() !== edgeTag.getExternalResourceUri();
        });
    });
};

export default api;
