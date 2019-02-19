/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphDisplayer from '@/graph/GraphDisplayer'
import Suggestion from '@/suggestion/Suggestion'
import Triple from '@/triple/Triple'
import DiffMatchPatch from "diff_match_patch"

const api = {};
api.withOtherGraph = function (otherGraph) {
    return new GraphCompare(
        otherGraph
    );
};

function GraphCompare(otherGraph) {
    this.otherGraph = otherGraph;
}

GraphCompare.prototype.show = function () {
    this._showForVertices();
    this._showForEdges();
};

GraphCompare.prototype._showForVertices = function () {
    var self = this;
    GraphDisplayer.getVertexSelector().visitAllVertices(function (vertexUi) {
        var identification = vertexUi.getModel().getFirstIdentificationToAGraphElement();
        if (!identification) {
            vertexUi.setAsComparisonSuggestionToRemove();
            return;
        }
        var related = self.otherGraph.getVertexRelatedToIdentification(
            identification
        );
        if (!related) {
            vertexUi.setAsComparisonSuggestionToRemove();
            return;
        }
        self.compareLabel(vertexUi, related);
        self.otherGraph.visitEdgesRelatedToVertex(related, function (edge) {
            var isConnectedToEdge = false;
            vertexUi.visitConnectedEdges(function (edgeUi) {
                var edgeIdentification = edgeUi.getModel().getFirstIdentificationToAGraphElement();
                if (!edgeIdentification) {
                    return;
                }
                if (edge.isRelatedToIdentifier(edgeIdentification)) {
                    isConnectedToEdge = true;
                    edgeIdentification.makeGeneric();
                    edge.addIdentification(
                        edgeIdentification
                    );
                    return false;
                }
            });
            if (!isConnectedToEdge) {
                var vertexToAdd = self.otherGraph.getVertexWithUri(
                    edge.getOtherVertex(related).getUri()
                );
                identification.makeGeneric();
                vertexToAdd.addIdentification(
                    identification
                );
                var tripleUi = GraphDisplayer.addSuggestionToSourceVertex(
                    Suggestion.fromTriple(
                        Triple.fromEdgeAndSourceAndDestinationVertex(
                            edge,
                            vertexUi.getModel(),
                            vertexToAdd
                        )
                    ),
                    vertexUi
                );
                var newEdge = tripleUi.edge();
                self.compareLabel(newEdge, edge);
                var newVertex = tripleUi.destinationVertex();
                newEdge.setAsComparisonSuggestionToAdd();
                newVertex.setAsComparisonSuggestionToAdd();
                newVertex.getModel().setLabel(
                    vertexToAdd.getLabel()
                );
                newVertex.setText(
                    vertexToAdd.getLabel()
                );
                self.compareLabel(newVertex, vertexToAdd);
                if (vertexToAdd.getNumberOfConnectedEdges() > 1) {
                    newVertex.buildHiddenNeighborPropertiesIndicator();
                }
            }
        });
    });
};

GraphCompare.prototype._showForEdges = function () {
    var self = this;
    GraphDisplayer.getEdgeSelector().visitAllEdges(function (edgeUi) {
        var identification = edgeUi.getModel().getFirstIdentificationToAGraphElement();
        if (!identification) {
            edgeUi.setAsComparisonSuggestionToRemove();
            return;
        }
        var related = self.otherGraph.getEdgeRelatedToIdentification(
            identification
        );
        if (!related) {
            edgeUi.setAsComparisonSuggestionToRemove();
            return;
        }
        self.compareLabel(edgeUi, related);
    });
};
GraphCompare.prototype.compareLabel = function (originalUi, compared) {
    originalUi.setComparedWith(
        compared
    );
    originalUi.refreshComparison();
};

export default api;
