/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Command from '@/Command'
import GraphUi from '@/graph/GraphUi'
import VertexService from '@/vertex/VertexService'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import MindMapInfo from '@/MindMapInfo'
import GraphDisplayer from '@/graph/GraphDisplayer'
import Vertex from '@/vertex/Vertex'
import IdUri from '@/IdUri'
import ToList from '@/ToList'
import GraphElementUi from '@/graph-element/GraphElementUi'
import Store from '@/store'

const api = {};
api.undoCanDo = function () {
    return Command.canUndo();
};
api.undo = function () {
    Command.undo();
};
api.redo = function () {
    Command.redo();
};
api.redoCanDo = function () {
    return Command.canRedo();
};
api.getUi = function () {
    return [];
};
api.find = function () {
    $("#vertex-search-input").focus();
};
api.zoomIn = function () {
    GraphUi.zoom(
        0.1
    );
    Store.dispatch("redraw");
};
api.zoomOut = function () {
    GraphUi.zoom(
        -0.1
    );
    Store.dispatch("redraw");
};

api.createVertex = function (label) {
    return VertexService.createVertex().then(function (serverFormat) {
        var newVertex = Vertex.fromServerFormat(
            serverFormat
        );
        var updateLabelPromise = label === undefined ? $.Deferred().resolve() :
            FriendlyResourceService.updateLabel(
                newVertex,
                label
            );
        return updateLabelPromise.then(function () {
            if (MindMapInfo.isTagCloudFlow() || MindMapInfo.isAuthenticatedLandingPageFlow()) {
                window.location = IdUri.htmlUrlForBubbleUri(newVertex.getUri());
            } else {
                return GraphDisplayer.displayUsingCentralBubbleUri(
                    newVertex.getUri()
                );
            }
        }).then(function () {
            return newVertex;
        });
    });
};
api.changeBackgroundColorCanDo = function () {
    return !MindMapInfo.isViewOnly() &&
        GraphElementUi.hasCenterBubble() &&
        GraphElementUi.getCenterVertexOrSchema().isVertex();
};

api.changeBackgroundColor = function () {
    $("#background-color-picker").click();
};

api.list = function () {
    ToList.showForList(
        GraphDisplayer.getVertexSelector().VerticesToHtmlLists(
            GraphDisplayer.getVertexSelector().getAllVertices()
        )
    );
};

api.isMultiple = function () {
    return false;
};

api.isSingle = function () {
    return false;
};

api.fontPickerCanDo = function () {
    return !MindMapInfo.isViewOnly() &&
        GraphElementUi.hasCenterBubble() &&
        GraphElementUi.getCenterVertexOrSchema().isVertex();
};

api.fontPicker = function () {
    var offset = $("#font-btn").offset();
    var $fontPicker = $("#font-picker");
    $fontPicker.removeClass(
        'hidden'
    ).css({top: offset.top + 12, left: offset.left + 44, position: 'absolute'}).find(
        "button, ul"
    ).addClass('expanded');
    $fontPicker.find("input").val('').focus().keyup();
};

$("#background-color-picker").on("change", function () {
        GraphUi.changeBackgroundColor(this.value);
        VertexService.saveColors({background: this.value});
    }
);
export default api;
