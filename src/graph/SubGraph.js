/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Edge from '@/edge/Edge'
import Vertex from '@/vertex/Vertex'

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new api.SubGraph(
        serverFormat,
        undefined,
        true
    );
};
api.empty = function () {
    return new api.SubGraph(
        {
            edges: {},
            vertices: {},
            groupRelations: [],
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
    if (buildFacade) {
        this.serverFormat = graph;
        this._buildVertices();
        this._buildEdges();
        this.groupRelations = [];
        this.tags = [];
    } else {
        this.edges = graph.edges;
        this.vertices = graph.vertices;
        this.groupRelations = graph.groupRelations || [];
        this.tags = graph.tags || [];
    }
    if (centerUri) {
        this.center = this.getVertexWithUri(centerUri)
    }
};

api.SubGraph.prototype.add = function (graphElement) {
    if (graphElement.isCenter) {
        graphElement.parentBubble = graphElement.parentVertex = graphElement;
    }
    if (graphElement.isMeta()) {
        this.tags.push(graphElement);
    } else if (graphElement.isEdge()) {
        this.addEdge(graphElement);
        let endVertex = graphElement.isInverse() ? graphElement.getSourceVertex() : graphElement.getDestinationVertex();
        endVertex.parentBubble = graphElement;
        endVertex.parentVertex = graphElement.parentVertex;
        endVertex.direction = graphElement.direction;
        this.add(
            endVertex
        );
    } else if (graphElement.isVertex()) {
        this.addVertex(graphElement);
    } else if (graphElement.isGroupRelation()) {
        this.groupRelations.push(
            graphElement
        );
        graphElement.sortedImmediateChild(graphElement.getParentVertex().getChildrenIndex()).forEach((child) => {
            if (child.isGroupRelation) {
                child.direction = graphElement.direction;
                child.parentVertex = graphElement.parentVertex;
                child.parentBubble = graphElement;
                return this.add(child);
            }
            Object.values(child).forEach((triple) => {
                triple.vertex.direction = graphElement.direction;
                this.addVertex(triple.vertex);
                triple.edge.direction = graphElement.direction;
                triple.edge.parentBubble = graphElement;
                triple.edge.parentVertex = graphElement.parentVertex;
                triple.edge.updateSourceOrDestination(graphElement.parentVertex);
                triple.edge.updateSourceOrDestination(triple.vertex);
                return this.add(triple.edge);
            })
        })
    }
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

api.SubGraph.prototype.getEdges = function () {
    let edges = Object.values(this.edges);
    //use array flat() when node ^11 LTS gets out
    return [].concat.apply([], edges)
};

api.SubGraph.prototype.getVertices = function () {
    let vertices = Object.values(this.vertices);
    //use array flat() when node ^11 LTS gets out
    return [].concat.apply([], vertices)
};

api.SubGraph.prototype.getGraphElements = function () {
    return this.getEdges().concat(this.getVertices());
};

api.SubGraph.prototype.getVertexWithUri = function (uri) {
    return this.vertices[uri][0];
};

api.SubGraph.prototype.getVerticesWithUri = function (uri) {
    return this.vertices[uri] || [];
};

api.SubGraph.prototype.getEdgeWithUri = function (uri) {
    return this.edges[uri][0];
};

api.SubGraph.prototype.getEdgesWithUri = function (uri) {
    return this.edges[uri] || [];
};

api.SubGraph.prototype.getGroupRelationWithUiId = function (uiId) {
    return this.groupRelations.filter((groupRelation) => {
        return groupRelation.uiId === uiId;
    })[0];
};

api.SubGraph.prototype.getCenter = function () {
    return this.getVertexWithUri(this.centerUri)
};

api.SubGraph.prototype._buildVertices = function () {
    this.vertices = {};
    Object.values(this.serverFormat.vertices).forEach((vertex) => {
        let facade = Vertex.fromServerFormat(vertex);
        this.addVertex(facade);
    });
};

export default api;
