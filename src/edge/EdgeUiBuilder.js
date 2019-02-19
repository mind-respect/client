/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import EventBus from '@/EventBus'
import GraphElementMainMenu from '@/graph-element/GraphElementMainMenu'
import EdgeUiBuilderCommon from '@/edge/EdgeUiBuilderCommon'
import GraphElementUiBuilder from '@/graph-element/GraphElementUiBuilder'
import BubbleFactory from '@/bubble/BubbleFactory'
import MindMapInfo from '@/MindMapInfo'

const api = {};
api.withOptions = function (options) {
    return new api.EdgeUiBuilder(
        options
    );
};
api.afterChildBuilt = function (ui, parentUi, childUi) {
    var model = ui.getModel(),
        parentVertexUi = parentUi.isVertex() ?
            parentUi :
            parentUi.getParentVertex(),
        isInverse = model.getSourceVertex().getUri() !== parentVertexUi.getUri();
    ui.getHtml().data(
        "source_vertex_id",
        parentVertexUi.getId()
    ).data(
        "destination_vertex_id",
        childUi.getId()
    );
    ui.getHtml().closest(
        ".vertex-tree-container"
    ).find("> .vertical-border, > .arrow").addClass("small");
    if (isInverse) {
        ui.inverse();
    }
    if (!MindMapInfo.isViewOnly()) {
        GraphElementUiBuilder.setupDrag(ui);
    }
    model.setSourceVertex(
        isInverse ?
            childUi.getModel() :
            parentVertexUi.getModel()
    );
    model.setDestinationVertex(
        isInverse ?
            parentVertexUi.getModel() :
            childUi.getModel()
    );
    GraphElementUiBuilder.integrateIdentifications(
        ui
    );
    EdgeUiBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
        ui
    );
    GraphElementUiBuilder._setupChildrenContainerDragOverAndDrop(
        ui
    );
    ui.refreshImages();
    ui.resetOtherInstances();
    ui.reviewInLabelButtonsVisibility();
    if (MindMapInfo.isViewOnly() && ("" === ui.text() || ui.isSetAsSameAsGroupRelation())) {
        ui.hideLabel();
    }
    var propertiesIndicator = ui.buildHiddenNeighborPropertiesIndicator();
    propertiesIndicator.hide();
    GraphElementUiBuilder.setupDrop(
        ui
    );
    EventBus.publish(
        '/event/ui/html/edge/created/',
        ui
    );
    ui.reviewIsSameAsGroupRelation();
    GraphElementUiBuilder.completeBuild(
        ui
    );
};
api.EdgeUiBuilder = function (options) {
    this.options = options || {};
};

api.EdgeUiBuilder.prototype.create = function (edgeServer) {
    this.edgeServer = edgeServer;
    this.uri = edgeServer.getUri();
    this.html = $(
        "<div class='relation graph-element bubble' draggable='false'>"
    ).addClass(
        this.options.htmlClass
    ).append("<div class='in-bubble-content'>").data(
        "uri",
        this.uri
    );
    this.html.uniqueId();
    var uiObjectClass = BubbleFactory.getUiObjectClassFromHtml(this.html);
    var edgeUi = uiObjectClass.createFromHtml(
        this.html
    );
    EdgeUiBuilderCommon.buildLabel(
        edgeUi,
        this.edgeServer.getLabel(),
        uiObjectClass.getWhenEmptyLabel(),
        this.options.isViewOnly
    );
    this.html.append(
        "<span class='connector'>"
    );
    edgeUi.setModel(
        this.edgeServer
    );
    buildMenu(edgeUi);
    EdgeUiBuilderCommon.buildInLabelButtons(
        edgeUi
    );
    edgeUi.hideMenu();
    edgeUi.addImages(
        this.edgeServer.getImages()
    );
    return edgeUi;
};

api.EdgeUiBuilder.prototype.getClass = function () {
    return api;
};


function buildMenu(edge) {
    var edgeHtml = edge.getHtml(),
        menu = $("<span class='relation-menu menu'>");
    edgeHtml.find(".label-container").append(menu);
    GraphElementMainMenu.addRelevantButtonsInMenu(
        menu,
        edge.getController()
    );
    GraphElementUiBuilder.setupContextMenu(edge);
}

export default api;
