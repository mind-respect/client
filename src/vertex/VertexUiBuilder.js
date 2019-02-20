/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import EventBus from '@/EventBus'
import MindMapTemplate from '@/MindMapTemplate'
import BubbleFactory from '@/bubble/BubbleFactory'
import RelativeTreeVertex from '@/vertex/RelativeTreeVertex'
import VertexUiBuilderCommon from '@/vertex/VertexUiBuilderCommon'
import GraphElementUiBuilder from '@/graph-element/GraphElementUiBuilder'
import GraphUi from '@/graph/GraphUi'
import MindMapInfo from '@/MindMapInfo'
import JqueryIsFullyOnScreen from '@/jquery/jquery.is-fully-on-screen'
import JqueryCenterOnScreen from '@/jquery/jquery.center-on-screen'
let linkifyjs = require('linkifyjs')
window.jQuery = $;
window.linkify = linkifyjs;
require('linkifyjs/dist/linkify-jquery')
const api = {};
api.withOptions = function (options) {
    return new api.VertexUiBuilder(
        options
    );
};
api.completeBuild = function (vertexUi) {
    if (!vertexUi.isMeta()) {
        GraphElementUiBuilder.integrateIdentifications(
            vertexUi
        );
    }
    vertexUi.refreshImages();
    VertexUiBuilderCommon.moveInLabelButtonsContainerIfIsToTheLeft(
        vertexUi
    );
    var hasAnExpandedOtherInstance = false;
    vertexUi.applyToOtherInstances(function (otherInstance) {
        if (otherInstance.getNumberOfChild() > 0) {
            hasAnExpandedOtherInstance = true;
            return false;
        }
    });
    vertexUi.buildHiddenNeighborPropertiesIndicator();
    if (!vertexUi.hasHiddenRelations() || hasAnExpandedOtherInstance) {
        vertexUi.getHiddenRelationsContainer().hide();
    }
    vertexUi.reviewInLabelButtonsVisibility();
    if (!MindMapInfo.isViewOnly() && !vertexUi.isCenterBubble()) {
        GraphElementUiBuilder.setupDrag(vertexUi);
    }
    GraphElementUiBuilder._setupChildrenContainerDragOverAndDrop(vertexUi);
    RelativeTreeVertex.setupVertexCopyButton(
        vertexUi
    );
    GraphElementUiBuilder.completeBuild(
        vertexUi
    );
    EventBus.publish(
        '/event/ui/vertex/build_complete',
        vertexUi
    );
};
EventBus.subscribe(
    '/event/ui/vertex/visit_after_graph_drawn',
    handleVisitAfterGraphDrawn
);

function handleVisitAfterGraphDrawn(event, vertex) {
    api.completeBuild(vertex);
}

api.VertexUiBuilder = function (options) {
    this.options = options || {};
};

api.VertexUiBuilder.prototype.create = function (serverFacade, htmlId) {
    this.serverFacade = serverFacade;
    this.html = $(
        MindMapTemplate['relative_vertex'].merge()
    ).addClass(
        this.options.htmlClass
    ).data(
        "uri",
        serverFacade.getUri()
    );
    VertexUiBuilderCommon.setUpClickBehavior(
        this.html,
        this.options.isViewOnly
    );
    if (undefined === htmlId) {
        htmlId = GraphUi.generateBubbleHtmlId();
    }
    this.html.attr('id', htmlId);
    this.vertexUi = BubbleFactory.getUiObjectClassFromHtml(
        this.html
    ).createFromHtml(
        this.html
    );
    this.vertexUi.setModel(serverFacade);
    var label = VertexUiBuilderCommon.buildLabelHtml(
        this.vertexUi,
        VertexUiBuilderCommon.buildInsideBubbleContainer(
            this.html
        ),
        this.vertexUi.getSelector(),
        this.serverFacade
    ).blur(function () {
        var $label = $(this);
        $label.linkify({
            target: "_blank"
        });
    });
    label.linkify({
        target: "_blank"
    });
    GraphElementUiBuilder.setupDrop(
        this.vertexUi
    );

    if (this.vertexUi.isVertex() && this.serverFacade.hasIncludedGraphElements()) {
        this._showItHasIncludedGraphElements();
    }
    this._createMenu();
    VertexUiBuilderCommon.buildInLabelButtons(
        this.vertexUi
    );
    this.vertexUi.hideMenu();
    this.vertexUi.addImages(
        this.serverFacade.getImages()
    );
    EventBus.publish(
        '/event/ui/html/vertex/created/',
        this.vertexUi
    );
    return this.vertexUi;
};

api.VertexUiBuilder.prototype.getClass = function () {
    return api;
};

api.VertexUiBuilder.prototype._showItHasIncludedGraphElements = function () {
    this.html.append(
        $("<div class='included-graph-elements-flag'>").text(
            ". . ."
        )
    ).addClass("includes-vertices");
};

api.VertexUiBuilder.prototype._createMenu = function () {
    var vertexMenu = $(
        MindMapTemplate['vertex_menu'].merge()
    );
    this.html.find(
        ".in-bubble-content"
    ).append(vertexMenu);
    VertexUiBuilderCommon.addRelevantButtonsInMenu(
        vertexMenu,
        this.vertexUi
    );
    GraphElementUiBuilder.setupContextMenu(
        this.vertexUi
    );
    return vertexMenu;
};
export default api;
