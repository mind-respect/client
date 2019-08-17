/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Command from '@/Command'
import VertexService from '@/vertex/VertexService'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import MindMapInfo from '@/MindMapInfo'
import Vertex from '@/vertex/Vertex'
import GraphElement from '@/graph-element/GraphElement'
import Store from '@/store'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import Vue from 'vue'
import router from '@/router'

const api = {};
api.undoCanDo = function () {
    return Command.canUndo();
};
api.undo = function () {
    return Command.undo();
};
api.redo = function () {
    return Command.redo();
};
api.redoCanDo = function () {
    return Command.canRedo();
};
api.getUi = function () {
    return [];
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

api.createVertex = function (event, label) {
    return VertexService.createVertex().then(function (response) {
        let serverFormat = response.data;
        let newVertex = Vertex.fromServerFormat(
            serverFormat
        );
        let promise = Promise.resolve();
        if (label) {
            newVertex.setLabel(label);
            promise = FriendlyResourceService.updateLabel(
                newVertex
            );
        }
        return promise.then(function () {
            router.push(
                newVertex.uri().url()
            );
            return newVertex;
        });
    });
};
api.changeBackgroundColorCanDo = function () {
    if (!CurrentSubGraph.get() || !CurrentSubGraph.get().center) {
        return false;
    }
    return !MindMapInfo.isViewOnly() &&
        CurrentSubGraph.get().center.isVertex();
};

api.changeBackgroundColor = function () {
    document.getElementById(
        "background-color-picker"
    ).click();
};

api.listAll = function () {
    Store.dispatch("setIsListViewFlow", true);
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

api.refreshFont = function (justChanged) {
    let font = CurrentSubGraph.get().center.getFont();
    if (!justChanged && GraphElement.DEFAULT_FONT.family === font.family) {
        return;
    }
    // let fontFile = new FontFace(font.family, 'url(fonts/junction-regular.woff)');

    let link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", "https://fonts.googleapis.com/css?family=" + font.family.replace(/ /g, '+'));
    link.onload = () => {
        setTimeout(()=>{
            Vue.nextTick(() => {
                Store.dispatch("redraw");
            });
        },100)
    };
    document.getElementsByTagName("head")[0].appendChild(link);
};


export default api;
