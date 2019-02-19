/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElementController from '@/graph-element/GraphElementController'

const api = {};
api.RelationSuggestionController = SuggestionRelationController;

function SuggestionRelationController(suggestionsRelationUi) {
    this.suggestionsRelationUi = suggestionsRelationUi;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.suggestionsRelationUi
    );
}

SuggestionRelationController.prototype = new GraphElementController.GraphElementController();

SuggestionRelationController.prototype.centerCanDo = function () {
    return false;
};

SuggestionRelationController.prototype.cutCanDo = function () {
    return false;
};

SuggestionRelationController.prototype.addSiblingCanDo = function () {
    return false;
};

export default api;
