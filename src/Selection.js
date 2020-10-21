/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Scroll from '@/Scroll'
import Store from '@/store'
import CurrentSubGraph from "@/graph/CurrentSubGraph";
import GraphElementType from '@/graph-element/GraphElementType'
import GraphElement from '@/graph-element/GraphElement'
import Vue from 'vue'

const api = {};
let isContinuous = false;
let rootOfSelectedTree = undefined;
api.reset = function () {
    isContinuous = false;
    Store.dispatch("setSelected", []);
};

api.setToSingle = function (graphElement, scroll) {
    return new Promise((resolve) => {
        if (!graphElement) {
            resolve();
            return;
        }
        if (api.isSingle()) {
            if (Store.state.selected[0].id === graphElement.getId()) {
                resolve();
                return;
            }
        }
        api.getSelectedElements().forEach((selected) => {
            if (selected) {
                selected.deselect();
            }
        });
        graphElement.select();
        Store.dispatch("setSelected", [
            api._storeFormat(graphElement)
        ]);
        isContinuous = defineIsContinuous();
        Vue.nextTick(() => {
            if (!graphElement.loading && scroll) {
                Vue.nextTick(() => {
                    centerBubbleIfApplicable(graphElement).then(resolve)
                });
            } else {
                resolve();
            }
        });
    });
};

api.isSelected = function (graphElement) {
    return Store.state.selected.some((selected) => {
        return selected.id === graphElement.getId();
    });
};

api.add = function (graphElement) {
    graphElement.select();
    Store.dispatch(
        "addSelected",
        api._storeFormat(graphElement)
    );
    isContinuous = defineIsContinuous();
};

api.setSelected = function (graphElements) {
    Store.dispatch(
        "setSelected",
        graphElements.map((graphElement) => {
            graphElement.select();
            return api._storeFormat(graphElement);
        })
    );
    isContinuous = defineIsContinuous();
};

api.remove = function (toDeselect) {
    toDeselect.deselect();
    Store.dispatch("removeSelected", api._storeFormat(toDeselect));
    isContinuous = defineIsContinuous();
};

api.removeAll = function () {
    api.getSelectedElements().forEach(function (selected) {
        if (selected) {
            selected.deselect();
        }
    });
    const promise = Store.dispatch("setSelected", []);
    isContinuous = defineIsContinuous();
    return promise;
};

api.getNbSelectedVertices = function () {
    return Store.state.selected.filter((selected) => {
        return GraphElementType.isVertex(selected.type);
    }).length;
};
api.getNbSelectedRelations = function () {
    return Store.state.selected.filter((selected) => {
        return GraphElementType.isRelation(selected.type);
    }).length;
};
api.getOneOrArrayOfSelected = function () {
    return 1 === api.getNbSelected() ?
        api.getSingle() : api.getSelectedElements();
};
api.getSingle = function () {
    if (Store.state.selected.length === 0) {
        return;
    }
    return api._graphElementSelected(Store.state.selected[0]);
};
api.getSelectedElements = api.getSelectedBubbles = function () {
    return Store.state.selected.map((selected) => {
        return api._graphElementSelected(selected);
    }).filter((selected) => {
        return selected !== undefined;
    })
};
api._graphElementSelected = function (selected) {
    return CurrentSubGraph.get().getHavingUriAndId(selected.uri, selected.id, selected.type);
};
api.getNbSelected = api.getNbSelectedElements = function () {
    return Store.state.selected.length;
};
api.isSingle = function () {
    return 1 === api.getNbSelectedElements();
};

api.isEmpty = function () {
    return 0 === api.getNbSelected();
};

api.controller = function () {
    return GraphElement.wrapElementsInController(
        this.getSelectedElements()
    );
};

api.isContinuous = function () {
    return isContinuous;
};

api.getRootOfSelectedTree = function () {
    return rootOfSelectedTree;
};

api._storeFormat = function (graphElement) {
    return {
        type: graphElement.getGraphElementType(),
        uri: graphElement.getUri(),
        id: graphElement.getId()
    }
};

export default api;

function centerBubbleIfApplicable(bubble) {
    return Scroll.centerBubbleIfApplicable(bubble);
}

function defineIsContinuous() {
    rootOfSelectedTree = undefined;
    return api.getSelectedBubbles().every((bubble) => {
        if (!bubble.isForkType()) {
            return false;
        }
        const parentFork = bubble.getParentFork();
        if (parentFork.isSelected) {
            if (bubble.isCenter) {
                rootOfSelectedTree = bubble;
            }
            return true;
        } else if (rootOfSelectedTree === undefined) {
            rootOfSelectedTree = bubble;
            return true;
        } else {
            return false;
        }
    });
};
