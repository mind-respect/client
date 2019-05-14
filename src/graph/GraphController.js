/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import CompareFlow from '@/compare/CompareFlow'
import MindMapInfo from '@/MindMapInfo'
import SubGraph from '@/graph/SubGraph'

const api = {};
api.expandAllCanDo = function () {
    let graph = SubGraph.graph;
    if(!graph){
        return false;
    }
    let center = SubGraph.graph.center;
    if (!center) {
        return false;
    }
    return center.getController().expandCanDo();
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
