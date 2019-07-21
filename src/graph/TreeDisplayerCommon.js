/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

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
    this.centralBubble = this._vertexWithId(centralVertexUri);
    this.edgesFacade = this._edgesFacadeArray(serverGraph.edges);
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
    this.edgesFacade.forEach((edge) => {
        this._updateTripleTreeInfoUsingEdge(
            edge
        );
    });
};

UiTreeInfoBuilder.prototype._buildRelationsOfVertices = function () {
    Object.values(this.serverGraph.vertices).forEach((sourceVertex) => {
            sourceVertex.groupRelationRoots = [];
            if (!sourceVertex.childrenGroupedByIdentifiers) {
                return;
            }
            Object.entries(sortIdentifiersByNumberOfRelationsDesc(sourceVertex.childrenGroupedByIdentifiers)).forEach((entry) => {
                    let identifierKey = entry[0];
                    let tuplesHavingSameIdentifier = entry[1];
                    let groupRelation = GroupRelation.forTuplesAndIdentifier(
                        tuplesHavingSameIdentifier,
                        this.allIdentifiers[identifierKey]
                    );
                    let isTupleUnderAnotherRelation = false;
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
                }
            );

        }
    );
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

UiTreeInfoBuilder.prototype._edgesFacadeArray = function (originalEdges) {
    let edges = [];
    Object.values(originalEdges).forEach((edge) => {
            edges.push(
                isGraphElementFacadeBuilt(edge) ? edge : Edge.fromServerFormat(
                    edge
                )
            );
        }
    );
    return edges;
};

UiTreeInfoBuilder.prototype._initVertex = function (vertex) {
    if (undefined === vertex.childrenGroupedByIdentifiers) {
        vertex.childrenGroupedByIdentifiers = [];
    }
};

UiTreeInfoBuilder.prototype._updateRelationsIdentification = function (edge) {
    let sourceVertex = this._vertexWithId(
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
    Object.values(this.nonEnhancedEdges).forEach((edge) => {
        this._updateRelationsIdentification(edge);
    });
};

UiTreeInfoBuilder.prototype._vertexWithId = function (vertexId) {
    let serverFormat = this.vertices[vertexId];
    if (isGraphElementFacadeBuilt(serverFormat)) {
        return serverFormat;
    }
    return this.vertices[vertexId] = Vertex.fromServerFormat(
        serverFormat
    );
};

function isGraphElementFacadeBuilt(graphElementServerFormat) {
    return graphElementServerFormat["getLabel"] !== undefined;
}

function sortIdentifiersByNumberOfRelationsDesc(identifiers) {
    let sortedKeys = Object.keys(identifiers).sort(
        function (identifierAUri, identifierBUri) {
            let relationsA = identifiers[identifierAUri];
            let relationsB = identifiers[identifierBUri];
            let numberOfRelationsInA = relationsA.length;
            let numberOfRelationsInB = relationsB.length;
            if (numberOfRelationsInA === numberOfRelationsInB) {
                return 0;
            }
            if (numberOfRelationsInA > numberOfRelationsInB) {
                return -1;
            }
            return 1;
        });
    let sortedIdentifiers = {};

    sortedKeys.forEach((key) => {
        sortedIdentifiers[key] = identifiers[key];
    });
    return sortedIdentifiers;
}

export default api;
