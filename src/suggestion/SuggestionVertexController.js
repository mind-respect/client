/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import GraphElementController from '@/graph-element/GraphElementController'
import SuggestionService from '@/suggestion/SuggestionService'

const api = {};

function SuggestionVertexController(suggestionsUi) {
    this.suggestionsUi = suggestionsUi;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.suggestionsUi
    );
}

SuggestionVertexController.prototype = new GraphElementController.GraphElementController();

SuggestionVertexController.prototype.acceptCanDo = function () {
    return this.isSingleAndOwned();
};

SuggestionVertexController.prototype.cutCanDo = function () {
    return false;
};

SuggestionVertexController.prototype.accept = function () {
    var deferred = $.Deferred();
    var self = this;
    var suggestionVertex = this.getUi();
    var parentSuggestionVertex = suggestionVertex.getParentSuggestionVertex();
    var hasParentSuggestionVertex = !parentSuggestionVertex.isSameBubble(
        suggestionVertex
    );
    if (hasParentSuggestionVertex) {
        return parentSuggestionVertex.getController().accept().then(
            acceptCurrent
        );
    }
    return acceptCurrent();

    function acceptCurrent() {
        return SuggestionService.accept(
            self.getUi()
        ).then(function (xhr) {
            var newVertexUi = self.getUi().integrateUsingNewVertexAndEdgeUri(
                xhr.vertex_uri,
                xhr.edge_uri
            );
            return deferred.resolve(
                newVertexUi
            );
        });
    }
};

SuggestionVertexController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned();
};

SuggestionVertexController.prototype.addChild = function () {
    this.accept().then(function (newVertex) {
        newVertex.getController().addChild();
    });
};
SuggestionVertexController.prototype.centerCanDo = function () {
    return false;
};
SuggestionVertexController.prototype.expand = function () {
    // var deferred = $.Deferred();
    // if (this.getUi().isCollapsed) {
    //     this.getUi().expand();
    //     return deferred.resolve();
    // }
    // this.getUi().hideHiddenRelationsContainer();
    // var uriToFetch = this.getUi().getModel().getExternalResourceUri();
    // var suggestionUi = this.getUi();
    // var parentEdgeUri = this.getUi().getParentBubble().getModel().getFirstIdentificationToAGraphElement().getExternalResourceUri();
    // GraphService.getForCentralBubbleUri(
    //     uriToFetch,
    //     function (serverGraph) {
    //         var subGraph = SubGraph.fromServerFormat(serverGraph);
    //         var centerVertex = subGraph.getVertexWithUri(
    //             suggestionUi.getModel().getExternalResourceUri()
    //         );
    //         subGraph.visitEdgesRelatedToVertex(centerVertex, function (edge) {
    //             if (edge.getUri() === parentEdgeUri) {
    //                 return;
    //             }
    //             var destinationVertex = edge.getOtherVertex(centerVertex);
    //             destinationVertex = subGraph.getVertexWithUri(
    //                 destinationVertex.getUri()
    //             );
    //             var triple = GraphUiBuilder.addSuggestionToVertex(
    //                 Suggestion.fromTriple(
    //                     Triple.fromEdgeAndSourceAndDestinationVertex(
    //                         edge,
    //                         centerVertex,
    //                         destinationVertex
    //                     )
    //                 ),
    //                 suggestionUi
    //             );
    //             triple.edge().setComparedWith(
    //                 edge
    //             );
    //             triple.destinationVertex().setText(
    //                 destinationVertex.getLabel()
    //             );
    //             triple.destinationVertex().setComparedWith(
    //                 destinationVertex
    //             );
    //             if (destinationVertex.getNumberOfConnectedEdges() > 1) {
    //                 triple.destinationVertex().buildHiddenNeighborPropertiesIndicator();
    //             }
    //         });
    //         deferred.resolve();
    //     }
    // );
    // return deferred.promise();
};
SuggestionVertexController.prototype.addSiblingCanDo = function () {
    return false;
};
api.VertexSuggestionController = SuggestionVertexController;

export default api;
