/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphDisplayer from '@/graph/GraphDisplayer'
import Scroll from '@/Scroll'

const api = {
    selected: []
};

api.reset = function () {
    api.selected = [];
};


api.setToSingle = function (graphElement) {
    if (!graphElement) {
        return;
    }
    if (api.isSingle() && api.getSingle().getId() === graphElement.getId()) {
        return;
    }
    api.removeAll();
    api.add(graphElement);
    graphElement.makeSingleSelected();
    centerBubbleIfApplicable(graphElement);
};

api.isSelected = function (graphElement) {
    return api.selected.some((selected) => {
        return selected.getId() === graphElement.getId();
    });
};

api._getSetterFromGraphElement = function (graphElement) {
    return graphElement.isEdge() ?
        api.setToSingleRelation :
        api.setToSingleVertex;
};

api.setToSingleRelation = function (relation) {
    if (api.getNbSelectedElements() === 1 && api.getSingle().getId() === relation.getId()) {
        return;
    }
    deselectAll();
    api.addRelation(relation);
    relation.makeSingleSelected();
};

api.add = function (graphElement, onlyPrepare) {
    onlyPrepare = onlyPrepare || false;
    api.addVertex(graphElement, onlyPrepare);
};

api.addRelation = function (relation) {
    api.addVertex(relation);
};

api.addVertex = function (vertex) {
    if (api.isSingle()) {
        api.getSingle().removeSingleSelected();
    }
    vertex.select();
    api.selected.push(vertex);
};
api.remove = api.removeVertex = function (vertex) {
    deselectGraphElement(vertex, api.selected);
};
api.removeRelation = function (relation) {
    deselectGraphElement(relation, api.selected);
};

api.removeAll = function () {
    deselectAll();
};

api.getSelectedVertices = function () {
    return api.selected;
};

api.handleSelectionManagementClick = function (event) {
    event.preventDefault();
};

api.getNbSelectedVertices = function () {
    return api.selected.filter((selected) => {
        return selected.isVertex();
    }).length;
};
api.getNbSelectedRelations = function () {
    return api.selected.filter((selected) => {
        return selected.isRelation();
    }).length;
};
api.getOneOrArrayOfSelected = function () {
    return 1 === api.getNbSelected() ?
        api.getSingle() : api.getSelectedElements();
};
api.getSingle = function () {
    return api.getSelectedBubbles()[0];
};
api.getSelectedElements = api.getSelectedBubbles = function () {
    return api.selected;
};
api.getNbSelected = api.getNbSelectedElements = function () {
    return api.selected.length;
};
api.isSingle = function () {
    return 1 === api.getNbSelectedElements();
};

api.isEmpty = function () {
    return 0 === api.getNbSelected();
};

api.getController = function () {
    let nbSelectedGraphElements = api.getNbSelected();
    let currentController;
    if (0 === nbSelectedGraphElements) {
        currentController = GraphDisplayer.getGraphMenuHandler();
    } else if (1 === nbSelectedGraphElements) {
        currentController = api.getSingle().getController();
    } else {
        let anyElement = api.getSingle();
        let anyElementType = anyElement.getGraphElementType();
        let areAllElementsOfSameType = true;
        api.getSelectedElements().forEach(function (selectedElement) {
            if (selectedElement.getGraphElementType() !== anyElementType) {
                areAllElementsOfSameType = false;
            }
        });
        var graphElementControllerClass = GraphDisplayer.getGraphElementMenuHandler();
        currentController = areAllElementsOfSameType ? anyElement.getControllerWithElements(
            api.getSelectedElements()
        ) : new graphElementControllerClass.GraphElementController(
            api.getSelectedElements()
        );
    }
    return currentController;
};


export default api;

function centerBubbleIfApplicable(bubble) {
    Scroll.centerBubbleIfApplicable(bubble);
}

function deselectAll() {
    api.getSelectedElements().forEach(function (selected) {
        selected.deselect();
    });
    for (let i = api.selected.length; i > 0; i--) {
        api.selected.pop();
    }
}

function deselectGraphElement(toDeselect, graphElements) {
    toDeselect.deselect();
    var uriToRemove = toDeselect.getUri();
    for (var i = graphElements.length - 1; i >= 0; i--) {
        if (uriToRemove === graphElements[i].getUri()) {
            graphElements.splice(i, 1);
            return;
        }
    }
}
