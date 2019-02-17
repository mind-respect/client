/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Vertex from '@/vertex/Vertex'
import Edge from '@/edge/Edge'
import GroupRelation from '@/group-relation/GroupRelation'
const api = {};
api.setUiTreeInfoToVertices = function (serverGraph, centralVertexUri) {
    return new UiTreeInfoBuilder(
        serverGraph, centralVertexUri
    ).doIt();
};

function UiTreeInfoBuilder(serverGraph, centralVertexUri) {
    this.serverGraph = serverGraph;
    this.vertices = serverGraph.vertices;
    this.originalEdges = serverGraph.edges;
    this.centralBubble = this._vertexWithId(centralVertexUri);
    this.edgesFacade = this._arrayOfEdgesHavingThoseRelatedToCenterVertexOnTop();
    this.nonEnhancedEdges = {};
    this.allIdentifiers = {};
}

UiTreeInfoBuilder.prototype.doIt = function () {
    this.centralBubble.isInvolved = true;
    this._initVertex(
        this.centralBubble
    );
    this._setTreeInfoToVertices();
    this._buildRelationsOfVertices();
    this.serverGraph.edges = this.edgesFacade;
};

UiTreeInfoBuilder.prototype._setTreeInfoToVertices = function () {
    this.edgesFacade.forEach(function (edge) {
            this._updateTripleTreeInfoUsingEdge(
                edge
            );
        }.bind(this)
    );
};

UiTreeInfoBuilder.prototype._buildRelationsOfVertices = function () {
    $.each(this.serverGraph.vertices, function (key, sourceVertex) {
        sourceVertex.groupRelationRoots = [];
        if (!sourceVertex.childrenGroupedByIdentifiers) {
            return;
        }
        $.each(sortIdentifiersByNumberOfRelationsDesc(sourceVertex.childrenGroupedByIdentifiers), function (identifierKey, tuplesHavingSameIdentifier) {
            var groupRelation = GroupRelation.forTuplesAndIdentifier(
                tuplesHavingSameIdentifier,
                this.allIdentifiers[identifierKey]
            );
            var isTupleUnderAnotherRelation = false;
            sourceVertex.groupRelationRoots.forEach(function (existingGroupRelationRoot) {
                if (existingGroupRelationRoot.integrateGroupRelationToTreeIfApplicable(groupRelation)) {
                    isTupleUnderAnotherRelation = true;
                }
            });
            if (!isTupleUnderAnotherRelation) {
                sourceVertex.groupRelationRoots.push(
                    groupRelation
                );
            }
        }.bind(this));
    }.bind(this));
};

UiTreeInfoBuilder.prototype._updateTripleTreeInfoUsingEdge = function (edge) {
    this._initVertex(
        this._vertexWithId(
            edge.getSourceVertex().getUri()
        )
    );
    this._initVertex(
        this._vertexWithId(
            edge.getDestinationVertex().getUri()
        )
    );
    this._updateRelationsIdentification(edge);
};

UiTreeInfoBuilder.prototype._arrayOfEdgesHavingThoseRelatedToCenterVertexOnTop = function () {
    var edges = [];
    $.each(this.originalEdges, function () {
        edges.push(
            isGraphElementFacadeBuilt(this) ? this : Edge.fromServerFormat(
                this
            )
        );
    });
    edges.sort(function (edge1, edge2) {
        var edge1IsRelated = this._isEdgeRelatedToCenterVertex(edge1),
            edge2IsRelated = this._isEdgeRelatedToCenterVertex(edge2);
        if (edge1IsRelated === edge2IsRelated) {
            return 0;
        }
        if (edge1IsRelated) {
            return -1;
        }
        return 1;
    }.bind(this));
    return edges;
};

UiTreeInfoBuilder.prototype._isEdgeRelatedToCenterVertex = function (edge) {
    return edge.getSourceVertex().getUri() === this.centralVertexUri ||
        edge.getDestinationVertex().getUri() === this.centralVertexUri;
};

UiTreeInfoBuilder.prototype._initVertex = function (vertex) {
    if (undefined === vertex.childrenGroupedByIdentifiers) {
        vertex.childrenGroupedByIdentifiers = [];
    }
};

UiTreeInfoBuilder.prototype._updateRelationsIdentification = function (edge) {
    var sourceVertex = this._vertexWithId(
        edge.getSourceVertex().getUri()
        ),
        destinationVertex = this._vertexWithId(
            edge.getDestinationVertex().getUri()
        );
    if (!sourceVertex.isInvolved && !destinationVertex.isInvolved) {
        this.nonEnhancedEdges[edge.getUri()] = edge;
        return;
    }
    if (destinationVertex.isInvolved && !sourceVertex.isInvolved) {
        sourceVertex = this._vertexWithId(
            edge.getDestinationVertex().getUri()
        );
        destinationVertex = this._vertexWithId(
            edge.getSourceVertex().getUri()
        );
    }
    sourceVertex.isInvolved = true;
    destinationVertex.isInvolved = true;
    var edgeIdentifications = edge.getIdentifiersIncludingSelf();
    var identifiers = sourceVertex.childrenGroupedByIdentifiers;
    edgeIdentifications.forEach(function (identifier) {
        if (!this.allIdentifiers[identifier.getExternalResourceUri()]) {
            this.allIdentifiers[identifier.getExternalResourceUri()] = identifier;
        }
        if (undefined === identifiers[identifier.getExternalResourceUri()]) {
            identifiers[identifier.getExternalResourceUri()] = [];
        }
        identifiers[identifier.getExternalResourceUri()].push(
            {
                vertex: destinationVertex,
                edge: edge
            }
        );
    }.bind(this));
    delete this.nonEnhancedEdges[edge.getUri()];
    this._revisitNonEnhancedEdges();
};

UiTreeInfoBuilder.prototype._revisitNonEnhancedEdges = function () {
    $.each(this.nonEnhancedEdges, function (key, edge) {
        this._updateRelationsIdentification(edge);
    }.bind(this));
};

UiTreeInfoBuilder.prototype._vertexWithId = function (vertexId) {
    var serverFormat = this.vertices[vertexId];
    if (isGraphElementFacadeBuilt(serverFormat)) {
        return serverFormat;
    }
    return this.vertices[vertexId] = Vertex.fromServerFormat(
        this.vertices[vertexId]
    );
};

function isGraphElementFacadeBuilt(graphElementServerFormat) {
    return graphElementServerFormat["getLabel"] !== undefined;
}

function sortIdentifiersByNumberOfRelationsDesc(identifiers) {
    var sortedKeys = Object.keys(identifiers).sort(
        function (identifierAUri, identifierBUri) {
            var relationsA = identifiers[identifierAUri];
            var relationsB = identifiers[identifierBUri];
            var numberOfRelationsInA = relationsA.length;
            var numberOfRelationsInB = relationsB.length;
            if (numberOfRelationsInA === numberOfRelationsInB) {
                return 0;
            }
            if (numberOfRelationsInA > numberOfRelationsInB) {
                return -1;
            }
            return 1;
        });
    var sortedIdentifiers = {};
    $.each(sortedKeys, function () {
        sortedIdentifiers[this] = identifiers[this];
    });
    return sortedIdentifiers;
}

export default api;
