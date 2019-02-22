/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphDisplayer from '@/graph/GraphDisplayer'
import EdgeService from '@/edge/EdgeService'
import GraphElementUi from '@/graph-element/GraphElementUi'
import BubbleUi from '@/bubble/BubbleUi'
import MindMapInfo from '@/MindMapInfo'
import EventBus from '@/EventBus'
import I18n from '@/I18n'

const api = {};
api.getWhenEmptyLabel = function () {
    return I18n.i18next.t("edge", "default");
};
api.buildCommonConstructors = function (api) {
    GraphElementUi.buildCommonConstructors(api);
    api.visitAllEdges = function (visitor) {
        api.visitAll(function (element) {
            if (element.isRelation()) {
                visitor(element);
            }
        });
    };
};

api.EdgeUi = function (html) {
    this.html = html;
    BubbleUi.Bubble.apply(this, [html]);
};

api.EdgeUi.prototype = new BubbleUi.Bubble();

api.EdgeUi.prototype.focus = function () {
    this.setAsNotSameAsGroupRelation();
    BubbleUi.Bubble.prototype.focus.call(
        this
    );
};
api.EdgeUi.prototype.getMenuHtml = function () {
    return this.html.find('.relation-menu');
};
api.EdgeUi.prototype.getGraphElementType = function () {
    return GraphElementUi.Types.Relation;
};
api.EdgeUi.prototype.serverFacade = function () {
    return EdgeService;
};
api.EdgeUi.prototype.getDestinationVertex = function () {
    return GraphDisplayer.getVertexSelector().withId(
        this.html.data("destination_vertex_id")
    ) || GraphDisplayer.getMetaUiSelector().withId(
        this.html.data("destination_vertex_id")
    );
};
api.EdgeUi.prototype.getSourceVertex = function () {
    return GraphDisplayer.getVertexSelector().withId(
        this.html.data("source_vertex_id")
    ) || GraphDisplayer.getMetaUiSelector().withId(
        this.html.data("source_vertex_id")
    );
};
api.EdgeUi.prototype.getOtherVertex = function (vertex) {
    return this.getParentBubble().isSameBubble(vertex) ?
        this.getTopMostChildBubble() : this.getParentBubble();
};
api.EdgeUi.prototype.inverseAbstract = function () {
    var sourceVertexId = this.html.data("source_vertex_id");
    var destinationVertexId = this.html.data("destination_vertex_id");
    this.html.data(
        "source_vertex_id",
        destinationVertexId
    );
    this.html.data(
        "destination_vertex_id",
        sourceVertexId
    );
};
api.EdgeUi.prototype.serverFacade = function () {
    return EdgeService;
};

api.EdgeUi.prototype.getHtml = function () {
    return this.html;
};

api.EdgeUi.prototype.deselect = function () {
    this.html.removeClass("selected");
    GraphElementUi.resetOtherInstancesDisplay();
    this.removeSingleSelected();
    this.hideMenu();
};

api.EdgeUi.prototype.isSetAsSameAsGroupRelation = function () {
    return this.getHtml().hasClass(
        "same-as-group-relation"
    );
};

api.EdgeUi.prototype.setAsNotSameAsGroupRelation = function () {
    if (!this.getModel().isLabelEmpty()) {
        this.getHtml().removeClass("empty-label");
    }
    return this.getHtml().removeClass(
        "same-as-group-relation"
    );
};

api.EdgeUi.prototype.setAsSameAsGroupRelation = function () {
    if (MindMapInfo.isViewOnly()) {
        this.hideLabel();
    }
    return this.getHtml().addClass("empty-label").addClass(
        "same-as-group-relation"
    );
};

api.EdgeUi.prototype.hasHiddenRelations = function () {
    return false;
};

api.EdgeUi.prototype.getYPosition = function () {
    var html = this.getLabel();
    return html.offset().top + html.height();
};

api.EdgeUi.prototype.getNumberOfHiddenRelations = function () {
    return 1;
};

api.EdgeUi.prototype.getDropContainer = function () {
    return this.html.find('.label-container');
};

api.EdgeUi.prototype.hideLabel = function () {
    this.getHtml().closest(".vertex-tree-container").addClass(
        "no-relation-label"
    );
};

api.EdgeUi.prototype.getTagNumberOfOtherReferences = function (tag) {
    var parentBubble = this.getParentBubble();
    if (parentBubble.isGroupRelation()) {
        if (parentBubble.getModel().hasIdentification(tag)) {
            return parentBubble.getTagNumberOfOtherReferences(tag);
        }
    }
    return GraphElementUi.GraphElementUi.prototype.getTagNumberOfOtherReferences.call(
        this,
        tag
    );
};

EventBus.subscribe(
    '/event/ui/graph/vertex/privacy/updated',
    function (event, graphElement) {
        graphElement.applyToConnectedEdges(function (edge) {
            edge.reviewInLabelButtonsVisibility();
        });
    }
);
GraphElementUi.buildCommonConstructors(api);

export default api;
