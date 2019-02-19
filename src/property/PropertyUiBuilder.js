/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import PropertyUi from '@/property/PropertyUi'
import GraphElementUiBuilder from '@/graph-element/GraphElementUiBuilder'
import EdgeUiBuilderCommon from '@/edge/EdgeUiBuilderCommon'
import GraphElementMainMenu from '@/graph-element/GraphElementMainMenu'
import EventBus from '@/EventBus'

const api = {};

api.completeBuild = function (property) {
    EdgeUiBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
        property
    );
    GraphElementUiBuilder.integrateIdentifications(
        property
    );
    property.refreshImages();
    property.reviewInLabelButtonsVisibility();
};

api.PropertyUiBuilder = function () {
};

api.PropertyUiBuilder.prototype.create = function (serverFacade) {
    this.serverFacade = serverFacade;
    this.html = $("<div class='property relation bubble graph-element public'>").data(
        "uri",
        this.serverFacade.getUri()
    ).uniqueId();
    $("<div class='in-bubble-content'>").appendTo(
        this.html
    );
    var propertyUi = PropertyUi.createFromHtml(
        this.html
    );
    propertyUi.setModel(serverFacade);
    EdgeUiBuilderCommon.buildLabel(
        propertyUi,
        this.serverFacade.getLabel(),
        PropertyUi.getWhenEmptyLabel()
    );
    this._buildMenu(
        this.html.find(".label-container"),
        propertyUi
    ).hide();
    EdgeUiBuilderCommon.buildInLabelButtons(
        propertyUi
    );
    this.html.append(
        $("<span class='arrow'>")
    );
    propertyUi.addImages(
        this.serverFacade.getImages()
    );
    return propertyUi;
};
api.PropertyUiBuilder.prototype._buildMenu = function (container, propertyUi) {
    var menu = $("<div class='relation-menu menu'>").appendTo(
        container
    );
    GraphElementMainMenu.addRelevantButtonsInMenu(
        menu,
        propertyUi.getController()
    );
    return menu;
};
EventBus.subscribe('/event/ui/graph/drawn', function () {
    PropertyUi.visitAllProperties(api.completeBuild);
});
export default api;
