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

api.reset = function () {
    Store.dispatch("setSelected", []);
};

api.setToSingle = function (graphElement, noScroll) {
    if (!graphElement) {
        return;
    }
    if (api.isSingle()) {
        api.getSingle().isSelected = false;
        if (Store.state.selected[0].id === graphElement.getId()) {
            return;
        }
    }
    api.getSelectedElements().forEach((selected) => {
        if (selected) {
            selected.deselect();
        }
    });
    graphElement.isSelected = true;

    Vue.nextTick(() => {
        Store.dispatch("setSelected", [
            api._storeFormat(graphElement)
        ]);
        if (!graphElement.loading && !noScroll) {
            Vue.nextTick(() => {
                centerBubbleIfApplicable(graphElement)
            });
        }
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
};

api.setSelected = function (graphElements) {
    Store.dispatch(
        "setSelected",
        graphElements.map((graphElement) => {
            graphElement.select();
            return api._storeFormat(graphElement);
        })
    );
};

api.remove = function (toDeselect) {
    toDeselect.deselect();
    Store.dispatch("removeSelected", api._storeFormat(toDeselect));
};

api.removeAll = function () {
    api.getSelectedElements().forEach(function (selected) {
        if (selected) {
            selected.deselect();
        }
    });
    Store.dispatch("setSelected", []);
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
    });
};
api._graphElementSelected = function (selected) {
    if (GraphElementType.isEdgeType(selected.type)) {
        return CurrentSubGraph.get().getEdgeWithUriAndId(
            selected.uri,
            selected.id
        );
    }
    switch (selected.type) {
        case GraphElementType.Vertex :
            return CurrentSubGraph.get().getVertexWithUriAndId(
                selected.uri,
                selected.id
            );
        case GraphElementType.GroupRelation :
            return CurrentSubGraph.get().getGroupRelationWithUiId(
                selected.id
            );
        case GraphElementType.Meta:
            return CurrentSubGraph.get().tags[0];
        default:
            return CurrentSubGraph.get().otherGraphElements[selected.id];
    }
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

