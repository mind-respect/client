/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import MindMapInfo from '@/MindMapInfo'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import Store from '@/store'

const api = {};
api.expandAllCanDo = function () {
    let graph = CurrentSubGraph.get();
    if (!graph) {
        return false;
    }
    let center = graph.center;
    if (!center) {
        return false;
    }
    const controller = center.controller();
    return controller.expandCanDo && controller.expandCanDo();
};

api.expandAll = function () {
    CurrentSubGraph.get().center.controller().expand();
};

api.compareCanDo = function () {
    return !MindMapInfo.isViewOnly();
};

// api.compare = function () {
//     CompareFlow.enter();
// };

api.selectAllBubbles = function () {
    CurrentSubGraph.get().center.selectTree();
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

api.hideAllTags = function () {
    CurrentSubGraph.get().getGraphElements().forEach((graphElement) => {
        graphElement.controller().hideTags(true);
    });
    Store.dispatch("redraw");
};

api.showAllTags = function () {
    CurrentSubGraph.get().getGraphElements().forEach((graphElement) => {
        graphElement.controller().showTags(true, true, true);
    });
    Store.dispatch("redraw");
};

export default api;
