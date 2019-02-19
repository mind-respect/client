/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElementUi from '@/graph-element/GraphElementUi'
import GraphUi from '@/graph/GraphUi'
import UiUtils from '@/UiUtils'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementMainMenu from '@/graph-element/GraphElementMainMenu'
import EventBus from '@/EventBus'

const api = {};
var selectedRelations = [];
var selectedVertices = [];

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

api.setToSingleGraphElement = function (graphElement) {
    api._getSetterFromGraphElement(
        graphElement
    )(graphElement);
    centerBubbleIfApplicable(graphElement);
};

api._getSetterFromGraphElement = function (graphElement) {
    return graphElement.isEdge() ?
        api.setToSingleRelation :
        api.setToSingleVertex;
};

api.setToSingleVertex = function (vertex) {
    if (api.getNbSelectedElements() === 1 && api.getSingleElement().getId() === vertex.getId()) {
        return;
    }
    deselectAll();
    api.addVertex(vertex);
    vertex.makeSingleSelected();
};

api.setToSingleRelation = function (relation) {
    if (api.getNbSelectedElements() === 1 && api.getSingleElement().getId() === relation.getId()) {
        return;
    }
    deselectAll();
    api.addRelation(relation);
    relation.makeSingleSelected();
};

api.addGraphElement = function (graphElement, onlyPrepare) {
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
    if (api.isOnlyASingleBubbleSelected()) {
        api.getSingleElement().removeSingleSelected();
    }
    relation.select();
    selectedRelations.push(relation);
    api._reviewMenu();
};

api.addVertex = function (vertex) {
    if (api.isOnlyASingleBubbleSelected()) {
        api.getSingleElement().removeSingleSelected();
    }
    vertex.select();
    selectedVertices.push(vertex);
    api._reviewMenu();
};
api.removeVertex = function (vertex) {
    deselectGraphElement(vertex, selectedVertices);
};
api.removeRelation = function (relation) {
    deselectGraphElement(relation, selectedRelations);
};

api.removeAll = function () {
    deselectAll();
    api._reviewMenu();
};

api.getSelectedVertices = function () {
    return selectedVertices;
};

api.handleSelectionManagementClick = function (event) {
    event.preventDefault();
};

api.getNbSelectedVertices = function () {
    return selectedVertices.length;
};
api.getNbSelectedRelations = function () {
    return selectedRelations.length;
};
api.getOneOrArrayOfSelected = function () {
    return 1 === api.getNbSelected() ?
        api.getSingleElement() : api.getSelectedElements();
};
api.getSingleElement = function () {
    return api.getSelectedBubbles()[0];
};
api.getSelectedElements = api.getSelectedBubbles = function () {
    return selectedRelations.concat(
        selectedVertices
    );
};
api.getNbSelected = api.getNbSelectedElements = function () {
    return selectedVertices.length + selectedRelations.length;
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
    GraphElementMainMenu.reviewOutOfBubbleButtonsDisplay(
        api.getSelectedBubbles(),
        api.getControllerFromCurrentSelection()
    );
    GraphElementUi.resetOtherInstancesDisplay();
};

EventBus.subscribe("/event/ui/graph/reset", deselectAll);

export default api;

function centerBubbleIfApplicable(bubble) {
    var html = bubble.getHtml();
    if (!UiUtils.isElementFullyOnScreen(html)) {
        html.centerOnScreenWithAnimation();
    }
}

function deselectAll() {
    api.getSelectedElements().forEach(function (graphElement) {
        graphElement.deselect();
    });
    selectedVertices = [];
    selectedRelations = [];
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
