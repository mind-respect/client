/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import TreeEdge from '@/edge/TreeEdge'

const api = {};
api.afterChildBuilt = function (edge, parentUi, childUi) {
    var edgeServer = edge.getModel(),
        parentVertexUi = parentUi.isVertex() ?
            parentUi :
            parentUi.getParentVertex(),
        isInverse = edgeServer.getSourceVertex().getUri() !== parentVertexUi.getUri();
    edge.getHtml().data(
        "source_vertex_id",
        parentVertexUi.getId()
    ).data(
        "destination_vertex_id",
        childUi.getId()
    );
    if (isInverse) {
        edge.inverse();
    }
    edge.getHtml().closest(
        ".vertex-tree-container"
    ).find("> .vertical-border, > .arrow").addClass("small");
};
api.EdgeBuilderForViewOnly = function () {
};

api.EdgeBuilderForViewOnly.prototype.create = function (edgeServerFormat) {
    var html;
    html = $(
        "<div class='relation bubble graph-element'>"
    ).append(
        buildInnerHtml()
    ).append(
        "<span class='connector'>"
    ).uniqueId();
    var edge = TreeEdge.createFromHtml(
        html
    );
    return edge;

    function buildInnerHtml() {
        var label = edgeServerFormat.getLabel();
        return $(
            "<span>"
        ).addClass(
            "label bubble-label label-info"
        ).text(
            label.trim()
        ).attr(
            "data-placeholder",
            TreeEdge.getWhenEmptyLabel()
        );
    }
};
api.EdgeBuilderForViewOnly.prototype.getClass = function () {
    return api;
};
export default api;
