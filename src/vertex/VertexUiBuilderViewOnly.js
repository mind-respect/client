/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import MindMapTemplate from '@/MindMapTemplate'
import RelativeTreeVertex from '@/vertex/RelativeTreeVertex'
import GraphDisplayer from '@/graph/GraphDisplayer'

const api = {};
api.ViewOnlyVertexUiBuilder = function () {
};
api.ViewOnlyVertexUiBuilder.prototype.create = function (serverFormatFacade) {
    var html,
        vertex;
    html = $(
        MindMapTemplate['relative_vertex'].merge()
    ).data(
        "uri",
        serverFormatFacade.getUri()
    ).uniqueId().addClass(
        "view-only"
    ).on(
        "click",
        handleClickToDisplayVertexAsCentralVertex
    );
    vertex = RelativeTreeVertex.createFromHtml(
        html
    );
    var bubbleContent = $("<div class='in-bubble-content'>").appendTo(html);
    createLabel(bubbleContent);
    html.append("<span class='arrow'>");
    vertex.setModel(
        serverFormatFacade
    );
    return vertex;

    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        return RelativeTreeVertex.withHtml(
            htmlOfSubComponent.closest('.vertex')
        );
    }

    function handleClickToDisplayVertexAsCentralVertex() {
        GraphDisplayer.displayUsingCentralBubble(
            vertexOfSubHtmlComponent($(this))
        );
        $(".ui-dialog-content").dialog("close").remove();
    }

    function createLabel(container) {
        return $(
            "<div class='bubble-label'>"
        ).text(
            serverFormatFacade.getLabel().trim()
        ).attr(
            "placeholder",
            RelativeTreeVertex.getWhenEmptyLabel()
        ).prop(
            'disabled',
            true
        ).on(
            "click",
            handleClickToDisplayVertexAsCentralVertex
        ).appendTo(container);
    }
};
api.ViewOnlyVertexUiBuilder.prototype.getClass = function () {
    return api;
};
export default api;
