/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Edge from '@/edge/Edge'
import Vertex from '@/vertex/Vertex'
import GraphElement from '@/graph-element/GraphElement'
import GraphElementType from "../graph-element/GraphElementType";

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new api.SubGraph(
        serverFormat,
        undefined,
        true
    );
};
api.fromServerFormatAndCenterUri = function (serverFormat, centerUri) {
    return new api.SubGraph(
        serverFormat,
        centerUri,
        true
    );
};
api.empty = function () {
    return new api.SubGraph(
        {
            edges: {},
            vertices: {},
            groupRelations: {},
            tags: []
        },
        undefined,
        false
    )
};
api.withFacadeAndCenterUri = function (serverFacade, centerUri) {
    return new api.SubGraph(
        serverFacade,
        centerUri,
        false
    );
};

api.SubGraph = function (graph, centerUri, buildFacade) {
    this.otherGraphElements = {};
    if (buildFacade) {
        this.serverFormat = graph;
        this._buildVertices();
        this._buildEdges();
        this.groupRelations = {};
        this.tagVertices = [];
    } else {
        this.edges = graph.edges;
        this.vertices = graph.vertices;
        this.groupRelations = graph.groupRelations || {};
        this.tagVertices = graph.tags || [];
    }
    if (centerUri) {
        this.centerUri = centerUri;
    }
};

api.SubGraph.prototype.add = function (graphElement) {
    if (graphElement.isCenter) {
        graphElement.parentBubble = graphElement.parentVertex = graphElement;
    }
    if (graphElement.isMeta()) {
        this.tagVertices.push(graphElement);
    } else if (graphElement.isEdge()) {
        if (this._isEdgeAlreadyAdded(graphElement)) {
            return;
        }
        this.addEdge(graphElement);
        let endVertex = graphElement.isInverse() ? graphElement.getSourceVertex() : graphElement.getDestinationVertex();
        endVertex.parentBubble = graphElement;
        endVertex.parentVertex = graphElement.parentVertex;
        endVertex.direction = graphElement.direction;
        if (endVertex.getNumberOfChild() === 0) {
            endVertex.isExpanded = true;
        }
        this.add(endVertex);
    } else if (graphElement.isVertex()) {
        this.addVertex(graphElement);
    } else if (graphElement.isGroupRelation()) {
        this.groupRelations[graphElement.getUri()] = graphElement;
        graphElement.getNextChildren().forEach((child) => {
            child.direction = graphElement.direction;
            child.parentVertex = graphElement.parentVertex;
            child.parentBubble = graphElement;
            this.add(child);
        })
    } else {
        this.otherGraphElements[graphElement.getId()] = graphElement;
    }
};
api.SubGraph.prototype._isEdgeAlreadyAdded = function (edge) {
    let edgesWithUri = this.edges[edge.getUri()];
    if (!edgesWithUri) {
        return false;
    }
    return edgesWithUri.some((edgeWithUri) => {
        return edgeWithUri.parentBubble.getUri() === edge.parentBubble.getUri();
    });
};

api.SubGraph.prototype._buildEdges = function () {
    this.edges = {};
    Object.values(this.serverFormat.edges).forEach((edge) => {
        let facade = Edge.fromServerFormat(edge);
        facade.setSourceVertex(
            this.getVertexWithUri(facade.getSourceVertex().getUri())
        );
        facade.setDestinationVertex(
            this.getVertexWithUri(facade.getDestinationVertex().getUri())
        );
        this.addEdge(facade);
    })
};

api.SubGraph.prototype.addVertex = function (vertex) {
    if (this.vertices[vertex.getUri()] === undefined) {
        this.vertices[vertex.getUri()] = [];
    }
    let isAlreadyThere = this.vertices[vertex.getUri()].some((_vertex) => {
        return _vertex.getId() === vertex.getId();
    });
    if (isAlreadyThere) {
        return;
    }
    this.vertices[vertex.getUri()].push(vertex);
};

api.SubGraph.prototype.addEdge = function (edge) {
    if (this.edges[edge.getUri()] === undefined) {
        this.edges[edge.getUri()] = [];
    }
    let isAlreadyThere = this.edges[edge.getUri()].some((_edge) => {
        return _edge.getId() === edge.getId();
    });
    if (isAlreadyThere) {
        return;
    }
    this.edges[edge.getUri()].push(edge);
};

api.SubGraph.prototype.remove = function (graphElement) {
    if (graphElement.isEdge()) {
        this.removeEdge(graphElement);
    } else if (graphElement.isVertex()) {
        this.removeVertex(graphElement);
    } else if (graphElement.isGroupRelation()) {
        this.removeGroupRelation(graphElement);
    } else if (graphElement.isMeta()) {
        this.removeTag(graphElement);
    }
};

api.SubGraph.prototype.removeTag = function (tag) {
    let l = this.tagVertices.length;
    while (l--) {
        if (this.tagVertices[l].getId() === tag.getId()) {
            this.tagVertices.splice(l, 1);
            tag.getNextChildren().forEach((child) => {
                this.remove(child)
            });
        }
    }
};

api.SubGraph.prototype.removeGroupRelation = function (groupRelation) {
    delete this.groupRelations[groupRelation.getUri()];
};

api.SubGraph.prototype.removeEdge = function (edge) {
    this.remove(edge.getNextBubble());
    let edges = this.getEdgesWithUri(edge.getUri());
    let l = edges.length;
    while (l--) {
        if (edges[l].getId() === edge.getId()) {
            edges.splice(l, 1);
        }
    }
    if (edges.length === 0) {
        delete this.vertices[edge.getUri()];
    }
};

api.SubGraph.prototype.removeVertex = function (vertex) {
    let vertices = this.getVerticesWithUri(vertex.getUri());
    let l = vertices.length;
    while (l--) {
        if (vertices[l].getId() === vertex.getId()) {
            vertices.splice(l, 1);
        }
    }
    if (vertices.length === 0) {
        delete this.vertices[vertex.getUri()];
    }
};

api.SubGraph.prototype.getEdges = function () {
    let edges = Object.values(this.edges);
    //use array flat() when node ^11 LTS gets out
    return [].concat.apply([], edges)
};

api.SubGraph.prototype.sortedEdges = function () {
    let centerVertex = this.getCenter();
    let childrenIndex = centerVertex.getChildrenIndex();
    return this.getEdges().sort((a, b) => {
        let vertexA = a.getOtherVertex(centerVertex);
        let vertexB = b.getOtherVertex(centerVertex);
        return GraphElement.sortCompare(
            vertexA,
            vertexB,
            childrenIndex
        );
    });
};

api.SubGraph.prototype.getVertices = function () {
    let vertices = Object.values(this.vertices);
    //use array flat() when node ^11 LTS gets out
    return [].concat.apply([], vertices)
};

api.SubGraph.prototype.getGroupRelations = function () {
    return Object.values(this.groupRelations);
};

api.SubGraph.prototype.getGraphElements = function () {
    return this.getGroupRelations().concat(this.getEdges()).concat(this.getVertices()).concat(this.tagVertices);
};

api.SubGraph.prototype.getVertexWithUri = function (uri) {
    return this.vertices[uri][0];
};

api.SubGraph.prototype.getGroupRelationWithUri = function (uri) {
    return this.groupRelations[uri];
};

api.SubGraph.prototype.hasUri = function (uri) {
    return this.edges[uri] !== undefined || this.vertices[uri] !== undefined || this.tagVertices.some((tagVertex) => {
        return tagVertex.getUri() === uri;
    });
};

api.SubGraph.prototype.getHavingUri = function (uri) {
    if (this.vertices[uri] !== undefined) {
        return this.vertices[uri][0];
    }
    if (this.edges[uri] !== undefined) {
        return this.edges[uri][0];
    }
    if (this.groupRelations[uri] !== undefined) {
        return this.groupRelations[uri];
    }
    let tagVertex = this.tagVertices.filter((tagVertex) => {
        return tagVertex.getUri() === uri;
    });
    if (tagVertex.length) {
        return tagVertex[0];
    }
};

api.SubGraph.prototype.replaceGraphElement = function (existingGraphElement, newGraphElement) {
    let container = this.getContainerForGraphElementType(existingGraphElement.getGraphElementType());
    if (!Array.isArray(container)) {
        container = container[existingGraphElement.getUri()];
    }
    container.forEach((element, index) => {
        if (element.getId() === existingGraphElement.getId()) {
            container[index] = newGraphElement;
        }
    });
};

api.SubGraph.prototype.getContainerForGraphElementType = function (graphElementType) {
    switch (graphElementType) {
        case GraphElementType.Vertex:
            return this.vertices;
        case GraphElementType.Edge:
            this.edges;
        case GraphElementType.GroupRelation:
            return this.groupRelations;
        case GraphElementType.Meta:
            return this.tagVertices;
    }
};

api.SubGraph.prototype.getHavingId = function (id) {

};

api.SubGraph.prototype.getVertexWithUriAndId = function (uri, id) {
    return this.getVerticesWithUri(uri).filter((vertex) => {
        return vertex.getId() === id;
    })[0];
};

api.SubGraph.prototype.getVerticesWithUri = function (uri) {
    return this.vertices[uri] || [];
};

api.SubGraph.prototype.getEdgeWithUri = function (uri) {
    return this.edges[uri][0];
};

api.SubGraph.prototype.getEdgeWithUriAndId = function (uri, id) {
    return this.getEdgesWithUri(uri).filter((edge) => {
        return edge.getId() === id;
    })[0];
};

api.SubGraph.prototype.getEdgesWithUri = function (uri) {
    return this.edges[uri] || [];
};

api.SubGraph.prototype.getGroupRelationWithUiId = function (uiId) {
    return this.getGroupRelations().filter((groupRelation) => {
        return groupRelation.uiId === uiId;
    })[0];
};

api.SubGraph.prototype.getTagBubbleWithUiId = function (uiId) {
    return this.tagVertices.filter((tag) => {
        return tag.uiId === uiId;
    })[0];
};

api.SubGraph.prototype.getCenter = function () {
    return this.getVertexWithUri(this.centerUri);
};

api.SubGraph.prototype.getCenterTagIndex = function () {
    return this.serverFormat.childrenIndexesCenterTag;
};

api.SubGraph.prototype.getCenterTagColors = function () {
    return this.serverFormat.colorsCenterTag;
};

api.SubGraph.prototype.getFontCenterTag = function () {
    return this.serverFormat.fontCenterTag;
};

api.SubGraph.prototype._buildVertices = function () {
    this.vertices = {};
    Object.values(this.serverFormat.vertices).forEach((vertex) => {
        let facade = Vertex.fromServerFormat(vertex);
        this.addVertex(facade);
    });
};

export default api;
