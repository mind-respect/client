/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import SchemaUi from '@/schema/SchemaUi'
import MindMapInfo from '@/MindMapInfo'
import VertexUiBuilderCommon from '@/vertex/VertexUiBuilderCommon'
import GraphElementUiBuilder from '@/graph-element/GraphElementUiBuilder'
import GraphElementMainMenu from '@/graph-element/GraphElementMainMenu'
import GraphUi from '@/graph/GraphUi'
import EventBus from '@/EventBus'

const api = {};

api.completeBuild = function () {
    if (!MindMapInfo.isSchemaMode()) {
        return;
    }
    var schema = SchemaUi.get();
    GraphElementUiBuilder.integrateIdentifications(
        schema
    );
    schema.refreshImages();
    schema.reviewInLabelButtonsVisibility();
    if (!MindMapInfo.isViewOnly()) {
        GraphUi.showSchemaInstructions();
    }
};
api.SchemaUiBuilder = function () {
};
api.SchemaUiBuilder.prototype.create = function (serverFacade, htmlId) {
    this.serverFacade = serverFacade;
    this.html = $(
        "<div class='schema vertex graph-element relative bubble'>"
    ).data(
        "uri",
        serverFacade.getUri()
    );
    VertexUiBuilderCommon.setUpClickBehavior(
        this.html
    );
    if (undefined === htmlId) {
        htmlId = GraphUi.generateBubbleHtmlId();
    }
    this.html.attr('id', htmlId);
    var schemaUi = SchemaUi.createFromHtml(
        this.html
    );
    schemaUi.setModel(serverFacade);
    VertexUiBuilderCommon.buildLabelHtml(
        schemaUi,
        VertexUiBuilderCommon.buildInsideBubbleContainer(
            this.html
        ),
        SchemaUi,
        this.serverFacade
    );
    GraphElementMainMenu.addRelevantButtonsInMenu(
        this._addMenu(),
        schemaUi.getController()
    );
    schemaUi.addImages(
        this.serverFacade.getImages()
    );
    schemaUi.hideMenu();
    schemaUi.makePublic();
    VertexUiBuilderCommon.buildInLabelButtons(
        schemaUi
    );
    return schemaUi;
};

api.SchemaUiBuilder.prototype.getClass = function () {
    return api;
};

api.SchemaUiBuilder.prototype._addMenu = function () {
    return $("<div class='menu'>").appendTo(
        this.html
    );
};
EventBus.subscribe(
    '/event/ui/graph/drawn',
    api.completeBuild
);

export default api;
