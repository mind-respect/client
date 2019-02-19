/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import EdgeUiBuilderCommon from '@/edge/EdgeUiBuilderCommon'
import SuggestionRelationUi from '@/suggestion/SuggestionRelationUi'
import GraphElementMainMenu from '@/graph-element/GraphElementMainMenu'

const api = {};

api.afterChildBuilt = function (suggestionRelationUi) {
    var propertiesIndicator = suggestionRelationUi.buildHiddenNeighborPropertiesIndicator();
    propertiesIndicator.hide();
    suggestionRelationUi.getHtml().closest(
        ".vertex-tree-container"
    ).find("> .vertical-border,> .arrow").addClass("small");
};

api.SuggestionRelationUiBuilder = function () {
};

api.SuggestionRelationUiBuilder.prototype.create = function (serverFacade) {
    this.serverFacade = serverFacade;
    this.html = $(
        "<div class='suggestion relation graph-element bubble'>"
    ).data(
        "uri",
        this.serverFacade.getUri()
    ).uniqueId().append(
        "<span class='connector'>"
    ).append("<div class='in-bubble-content'>");
    var edgeUi = this.edge = SuggestionRelationUi.createFromHtml(
        this.html
    );
    EdgeUiBuilderCommon.buildLabel(
        edgeUi,
        this.serverFacade.getLabel(),
        SuggestionRelationUi.getWhenEmptyLabel()
    ).css("visibility", "visible");
    edgeUi.setModel(this.serverFacade);
    this._buildMenu();
    edgeUi.hideMenu();
    return edgeUi;
};
api.SuggestionRelationUiBuilder.prototype._buildMenu = function () {
    var menu = $("<span class='relation-menu menu'>");
    this.html.find(".label-container").append(menu);
    GraphElementMainMenu.addRelevantButtonsInMenu(
        menu,
        this.edge.getController()
    );
};

export default api;
