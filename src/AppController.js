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
import ToList from '@/ToList'
import Store from '@/store'
import SubGraph from '@/graph/SubGraph'
import Vue from 'vue'
import router from '@/router'

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
    api.zoom(
        0.1
    )
};
api.zoomOut = function () {
    api.zoom(
        -0.1
    )
};
api.zoomOutCanDo = function () {
    return Store.state.zoom >= 0.7;
};
api.zoom = function (adjust) {
    Store.dispatch(
        "zoom",
        parseFloat((Store.state.zoom + adjust).toFixed(2))
    );
    Vue.nextTick(function () {
        Store.dispatch("redraw");
    })
};

api.createVertex = function (label) {
    return VertexService.createVertex().then(function (response) {
        let serverFormat = response.data;
        var newVertex = Vertex.fromServerFormat(
            serverFormat
        );
        var updateLabelPromise = label === undefined ? Promise.resolve() :
            FriendlyResourceService.updateLabel(
                newVertex,
                label
            );
        return updateLabelPromise.then(function () {
            router.push(
                newVertex.uri().url()
            );
        }).then(function () {
            return newVertex;
        });
    });
};
api.changeBackgroundColorCanDo = function () {
    return !MindMapInfo.isViewOnly() &&
        SubGraph.graph.center.isVertex();
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
    return !MindMapInfo.isViewOnly();
};

api.fontPicker = function () {
    Store.dispatch("setIsFontFlow", true);
};

$("#background-color-picker").on("change", function () {
        GraphUi.changeBackgroundColor(this.value);
        VertexService.saveColors({background: this.value});
    }
);
export default api;
