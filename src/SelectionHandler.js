/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphUi from '@/graph/GraphUi'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementMainMenu from '@/graph-element/GraphElementMainMenu'
import EventBus from '@/EventBus'
import Scroll from '@/Scroll'

const api = {
    selected: []
};

api.reset = function () {
    api.selected = [];
};

api.selectAllVerticesOnly = function () {
    GraphUi.getDrawnGraph().detachTemp();
    deselectAll();
    var onlyPrepare = true;
    GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
        api.addVertex(vertex, onlyPrepare);
    });
    GraphUi.getDrawnGraph().reattach();
};

api.selectAllRelationsOnly = function () {
    GraphUi.getDrawnGraph().detachTemp();
    deselectAll();
    var onlyPrepare = true;
    GraphDisplayer.getEdgeSelector().visitAllEdges(function (edge) {
        api.addRelation(edge, onlyPrepare);
    });
    GraphUi.getDrawnGraph().reattach();
};

api.setToSingle = function (graphElement) {
    if (!graphElement) {
        return;
    }
    api.removeAll();
    api.add(graphElement);
    graphElement.makeSingleSelected();
    centerBubbleIfApplicable(graphElement);
};

api._getSetterFromGraphElement = function (graphElement) {
    return graphElement.isEdge() ?
        api.setToSingleRelation :
        api.setToSingleVertex;
};

api.setToSingleRelation = function (relation) {
    if (api.getNbSelectedElements() === 1 && api.getSingleElement().getId() === relation.getId()) {
        return;
    }
    deselectAll();
    api.addRelation(relation);
    relation.makeSingleSelected();
};

api.add = function (graphElement, onlyPrepare) {
    onlyPrepare = onlyPrepare || false;
    api._getAdderFromGraphElement(graphElement)(
        graphElement, onlyPrepare
    );
};

api._getAdderFromGraphElement = function (graphElement) {
    if (graphElement.isEdge()) {
        return api.addRelation;
    }
    return api.addVertex;
};

api.addRelation = function (relation) {
    api.addVertex(relation);
};

api.addVertex = function (vertex) {
    if (api.isOnlyASingleBubbleSelected()) {
        api.getSingleElement().removeSingleSelected();
    }
    if (vertex.isSelected) {
        return;
    }
    // debugger;
    vertex.select();
    api.selected.push(vertex);
    api._reviewMenu();
};
api.remove = api.removeVertex = function (vertex) {
    deselectGraphElement(vertex, api.selected);
};
api.removeRelation = function (relation) {
    deselectGraphElement(relation, api.selected);
};

api.removeAll = function () {
    deselectAll();
    api._reviewMenu();
};

api.getSelectedVertices = function () {
    return api.selected;
};

api.handleSelectionManagementClick = function (event) {
    event.preventDefault();
};

api.getNbSelectedVertices = function () {
    return api.selected.length;
};
api.getNbSelectedRelations = function () {
    return api.selected.length;
};
api.getOneOrArrayOfSelected = function () {
    return 1 === api.getNbSelected() ?
        api.getSingleElement() : api.getSelectedElements();
};
api.getSingleElement = function () {
    return api.getSelectedBubbles()[0];
};
api.getSelectedElements = api.getSelectedBubbles = function () {
    return api.selected;
};
api.getNbSelected = api.getNbSelectedElements = function () {
    return api.selected.length;
};
api.isOnlyASingleBubbleSelected = api.isOnlyASingleElementSelected = function () {
    return 1 === api.getNbSelectedElements();
};

api.isEmpty = function () {
    return 0 === api.getNbSelected();
};

api.getControllerFromCurrentSelection = function () {
    var nbSelectedGraphElements = api.getNbSelected();
    var currentController;
    if (0 === nbSelectedGraphElements) {
        currentController = GraphDisplayer.getGraphMenuHandler();
    } else if (1 === nbSelectedGraphElements) {
        currentController = api.getSingleElement().getController();
    } else {
        var anyElement = api.getSingleElement();
        var anyElementType = anyElement.getGraphElementType();
        var areAllElementsOfSameType = true;
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

api._reviewMenu = function () {
    return;
    GraphElementMainMenu.reviewOutOfBubbleButtonsDisplay(
        api.getSelectedBubbles(),
        api.getControllerFromCurrentSelection()
    );
    let GraphElementUi = require('@/graph-element/GraphElementUi').default;
    GraphElementUi.resetOtherInstancesDisplay();
};

EventBus.subscribe("/event/ui/graph/reset", deselectAll);

export default api;

function centerBubbleIfApplicable(bubble) {
    Scroll.centerBubbleIfApplicable(bubble);
}

function deselectAll() {
    api.getSelectedElements().forEach(function (graphElement) {
        graphElement.deselect();
    });
    for (let i = api.selected.length; i > 0; i--) {
        api.selected.pop();
    }
    api._reviewMenu();
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
    api._reviewMenu();
}
