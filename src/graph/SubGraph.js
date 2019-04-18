/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Edge from '@/edge/Edge'
import Vertex from '@/vertex/Vertex'

const api = {};
api.graph = null;
api.fromServerFormat = function (serverFormat) {
    return new api.SubGraph(
        serverFormat,
        undefined,
        true
    );
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
        this._buildEdges();
        this._buildVertices();
    } else {
        this.edges = graph.edges;
        this.vertices = graph.vertices;
    }
    if (centerUri) {
        this.center = this.getVertexWithUri(centerUri)
    }
};

api.SubGraph.prototype.getEdgeRelatedToIdentification = function (identification) {
    return this._relatedToIdentificationForGraphElements(
        identification,
        this.edges
    );
};

api.SubGraph.prototype.getVertexRelatedToIdentification = function (identification) {
    return this._relatedToIdentificationForGraphElements(
        identification,
        this.vertices
    );
};

api.SubGraph.prototype.visitEdgesRelatedToVertex = function (vertex, visitor) {
    $.each(this.edges, function () {
        if (this.isRelatedToVertex(vertex)) {
            visitor(this);
        }
    });
};

api.SubGraph.prototype.getAnyUri = function () {
    return Object.keys(
        this.vertices
    )[0];
};

api.SubGraph.prototype._buildEdges = function () {
    this.edges = {};
    var self = this;
    $.each(this.serverFormat.edges, function () {
        var facade = Edge.fromServerFormat(this);
        self.edges[facade.getUri()] = facade;
    });
};

api.SubGraph.prototype.visitEdges = function (visitor) {
    Object.keys(this.edges).forEach(function (key) {
        visitor(this.edges[key]);
    }.bind(this));
};

api.SubGraph.prototype.visitVertices = function (visitor) {
    Object.keys(this.vertices).forEach(function (key) {
        visitor(this.vertices[key]);
    }.bind(this));
};

api.SubGraph.prototype.visitGraphElements = function (visitor) {
    this.visitEdges(visitor);
    this.visitVertices(visitor);
};

api.SubGraph.prototype.getVertexWithUri = function (uri) {
    return this.vertices[uri];
};

api.SubGraph.prototype.getCenter = function () {
    return this.getVertexWithUri(this.centerUri)
};

api.SubGraph.prototype._buildVertices = function () {
    this.vertices = {};
    var self = this;
    $.each(this.serverFormat.vertices, function () {
        var facade = Vertex.fromServerFormat(this);
        self.vertices[facade.getUri()] = facade;
    });
};
api.SubGraph.prototype._relatedToIdentificationForGraphElements = function (identification, graphElements) {
    var related = false;
    $.each(graphElements, function () {
        var graphElement = this;
        if (graphElement.isRelatedToIdentifier(identification)) {
            related = graphElement;
            return false;
        }
    });
    return related;
};

export default api;
