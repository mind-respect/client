/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import SelectionHandler from '@/SelectionHandler'
import VertexUi from '@/vertex/VertexUi'
import GraphElementUi from '@/graph-element/GraphElementUi'
import CompareFlow from '@/compare/CompareFlow'
import MindMapInfo from '@/MindMapInfo'

const api = {};
api.expandAllCanDo = function () {
    var canDo = false;
    GraphElementUi.visitAll(function (graphElementUi) {
        if (graphElementUi.getController().expandCanDo()) {
            canDo = true;
            return false;
        }
    });
    return canDo;
};

api.expandAll = function () {
    GraphElementUi.getCenterBubble().getController().expand();
};

api.compareCanDo = function () {
    return !MindMapInfo.isViewOnly();
};

api.compare = function () {
    CompareFlow.enter();
};

api.selectAllBubbles = function () {
    GraphElementUi.getCenterBubble().selectTree();
};

api.selectTreeCanDo = function () {
    return VertexUi.getNumber() > SelectionHandler.getNbSelectedVertices();
};

api.getUi = function () {
    return [];
};

api.isMultiple = function () {
    return false;
};

api.isSingle = function () {
    return false;
};

export default api;
