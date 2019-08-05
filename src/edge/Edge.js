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

api.Edge.prototype.init = function (edgeServerFormat, sourceVertex, destinationVertex) {
    this.sourceVertex = sourceVertex ? sourceVertex : FriendlyResource.fromServerFormat(
        VertexServerFormatBuilder.getFriendlyResourceServerObject(
            edgeServerFormat.sourceVertex
        )
    );
    this.destinationVertex = destinationVertex ? destinationVertex : FriendlyResource.fromServerFormat(
        VertexServerFormatBuilder.getFriendlyResourceServerObject(
            edgeServerFormat.destinationVertex
        )
    );
    GraphElement.GraphElement.apply(
        this
    );
    GraphElement.GraphElement.prototype.init.call(
        this,
        edgeServerFormat.graphElement
    );
    this.edgeServerFormat = edgeServerFormat;
    this.isExpanded = true;
    return this;
};


api.Edge.prototype.clone = function () {
    let edge = new api.Edge();
    edge.init(
        JSON.parse(JSON.stringify(this.edgeServerFormat)),
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

api.Edge.prototype.replaceRelatedVertex = function (relatedVertex, newVertex) {
    if (this.getSourceVertex().isSameUri(relatedVertex)) {
        this.setSourceVertex(newVertex);
    } else if (this.getDestinationVertex().isSameUri(relatedVertex)) {
        this.setDestinationVertex(newVertex);
    } else {
        console.warn("trying to update non related source or destination vertex to " + this.getLabel())
    }
};

api.Edge.prototype.setSourceVertex = function (sourceVertex) {
    this.sourceVertex = sourceVertex;
};

api.Edge.prototype.setParentVertex = function (vertex) {
    if (this.isInverse()) {
        this.setDestinationVertex(vertex);
        this.getSourceVertex().parentVertex = vertex;
    } else {
        this.setSourceVertex(vertex);
        this.getDestinationVertex().parentVertex = vertex;
    }
    this.parentVertex = vertex;
};

api.Edge.prototype.setDestinationVertex = function (destinationVertex) {
    this.destinationVertex = destinationVertex;
};

api.Edge.prototype.getSourceVertex = function () {
    return this.sourceVertex;
};
api.Edge.prototype.getDestinationVertex = function () {
    return this.destinationVertex;
};

api.Edge.prototype.deselect = function () {
    FriendlyResource.FriendlyResource.prototype.deselect.call(
        this
    );
    this._selectRedraw();
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
    return this.getSourceVertex().getUri() !== this.getParentVertex().getUri();
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
        this.getOtherVertex(this.getParentVertex())
    ];
};

api.Edge.prototype.getNumberOfChild = function () {
    return 1;
};

api.Edge.prototype.isLeaf = function () {
    return false;
};

api.Edge.prototype.isShrinked = function () {
    if (Selection.isSelected(this)) {
        return false;
    }
    if (this.isLabelEmpty()) {
        return true;
    }
    let parentBubble = this.getParentBubble();
    return parentBubble.isGroupRelation() && [parentBubble.getLabel(), ""].includes(
        this.getLabel().trim()
    );
};

api.Edge.prototype.remove = function () {
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

export default api;
