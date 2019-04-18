/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import SelectionHandler from '@/SelectionHandler'
import VertexUi from '@/vertex/VertexUi'
import GraphElementUi from '@/graph-element/GraphElementUi'
import CompareFlow from '@/compare/CompareFlow'
import MindMapInfo from '@/MindMapInfo'
import SubGraph from '@/graph/SubGraph'

const api = {};
api.expandAllCanDo = function () {
    let canDo = false;
    let center = SubGraph.graph.center;
    if (!center) {
        return false;
    }
    center.visitDescendants(function (descendant) {
        if (descendant.getController().expandCanDo()) {
            canDo = true;
            return false;
        }
    });
    return canDo;
};

api.expandAll = function () {
    SubGraph.graph.center.getController().expand();
};

api.compareCanDo = function () {
    return !MindMapInfo.isViewOnly();
};

api.compare = function () {
    CompareFlow.enter();
};

api.selectAllBubbles = function () {
    SubGraph.graph.center.selectTree();
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
