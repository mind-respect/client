/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vue from 'vue'
import EdgeController from '@/edge/EdgeController'
import RelationService from '@/relation/RelationService'
import Selection from '@/Selection'
import GraphElementService from '@/graph-element/GraphElementService'
import Store from '@/store'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import VertexService from '@/vertex/VertexService'
import EdgeService from "../edge/EdgeService";

const api = {};
api.RelationController = RelationController;

function RelationController(edges) {
    this.edges = edges;
    EdgeController.prototype.init.call(
        this,
        this.edges
    );
}

RelationController.prototype = new EdgeController();

RelationController.prototype.expandCanDo = function () {
    return false;
};

RelationController.prototype.collapseCanDo = function () {
    return false;
};

RelationController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned();
};

RelationController.prototype.addChild = async function (index) {

    let previousParentFork = this.model().getParentFork();
    let prepareConvertData = this._prepareConvertToGroupRelation();
    let convertResponse = await this._convertToGroupRelation();
    let newGroupRelation = convertResponse.optimistic;
    Selection.removeAll();
    let triple = await newGroupRelation.controller().addChildWhenInTransition(convertResponse.promise, index);
    this.setLabel("");
    previousParentFork.replaceChild(
        this.model(),
        newGroupRelation
    );
    CurrentSubGraph.get().add(newGroupRelation);
    this._postConvertToGroupRelation(newGroupRelation, prepareConvertData);
    previousParentFork.refreshChildren(true);
    GraphElementService.changeChildrenIndex(
        newGroupRelation.getParentFork()
    );
    GraphElementService.changeChildrenIndex(
        newGroupRelation
    );
    Selection.setToSingle(triple.destination);
    triple.destination.isNewBubble = true;
    triple.destination.focus();
    return triple;
};

RelationController.prototype.addSibling = function () {
    return this._addSiblingUpOrDown(true);
};

RelationController.prototype.addSiblingUp = function () {
    return this._addSiblingUpOrDown(false);
};

RelationController.prototype._addSiblingUpOrDown = function (isDown) {
    let nextBubbleController = this.model().getNextBubble().controller();
    return isDown ? nextBubbleController.addSibling(true) : nextBubbleController.addSiblingUp(true);
};

RelationController.prototype.addSiblingCanDo = RelationController.prototype.addSiblingUpCanDo = function (labelText) {
    return this.isSingle() && this.model().getNextBubble().controller().addSiblingCanDo(labelText);
};

RelationController.prototype.becomeParent = async function (adoptedChild) {
    if (adoptedChild.isVertex()) {
        adoptedChild = adoptedChild.getParentBubble();
    }
    let promises = [];
    Selection.removeAll();
    let previousParentFork = this.model().getParentFork();
    let childParentFork = adoptedChild.getParentFork();
    childParentFork.removeChild(adoptedChild, false, true);
    let prepareConvertData = this._prepareConvertToGroupRelation();
    let convertResponse = await this._convertToGroupRelation();
    let newGroupRelation = await convertResponse.promise;
    adoptedChild.setParentFork(newGroupRelation);
    newGroupRelation.addChild(adoptedChild);
    previousParentFork.replaceChild(
        this.model(),
        newGroupRelation
    );
    let relation = adoptedChild.isVertex() ? adoptedChild.getParentBubble() : adoptedChild;
    promises.push(
        relation.controller().replaceParentFork(
            newGroupRelation,
            true
        )
    );
    previousParentFork.refreshChildren();
    return Promise.all(promises).then(async () => {
        await childParentFork.controller().becomeExParent(adoptedChild, this.model());
        this._postConvertToGroupRelation(newGroupRelation, prepareConvertData);
        CurrentSubGraph.get().add(newGroupRelation);
        newGroupRelation.expand(true);
        GraphElementService.changeChildrenIndex(
            newGroupRelation.getParentFork()
        );
        GraphElementService.changeChildrenIndex(
            newGroupRelation
        );
        Selection.setToSingle(newGroupRelation);
        return newGroupRelation;
    });
};

RelationController.prototype._prepareConvertToGroupRelation = function () {
    let areTagsShown = this.hideTagsCanDo();
    if (areTagsShown) {
        this.hideTags();
    }
    return areTagsShown;
}

RelationController.prototype._convertToGroupRelation = function () {
    let edge = this.model();
    let response = RelationService.convertToGroupRelation(
        edge.getUri(),
        edge.getParentVertex().getShareLevel(),
        edge.hasIdentifications() ? edge.getIdentifiers()[0].getLabel() : edge.getLabel(),
        edge.hasIdentifications() ? edge.getIdentifiers()[0].getComment() : edge.getComment()
    );
    let newGroupRelation = response.optimistic;
    newGroupRelation.addIdentifications(edge.getIdentifiers());
    edge.getIdentifiers().forEach((tag) => {
        edge.removeTag(tag, true);
    });
    newGroupRelation.parentBubble = edge.getParentBubble();
    newGroupRelation.parentVertex = edge.getParentVertex();
    if (edge.isInverse()) {
        edge.setDestinationVertex(newGroupRelation);
    } else {
        edge.setSourceVertex(newGroupRelation);
    }
    newGroupRelation.addChild(edge);
    newGroupRelation.isExpanded = true;
    return response;
};

RelationController.prototype._postConvertToGroupRelation = async function (newGroupRelation, areTagsShown) {
    if (areTagsShown) {
        newGroupRelation.controller().showTags(false, false, true);
    }
}

RelationController.prototype.reverseToRightCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    let isToTheLeft = this.model().isToTheLeft();
    let isInverse = this.model().isInverse();
    return (isToTheLeft && !isInverse) ||
        (!isToTheLeft && isInverse);

};
RelationController.prototype.reverseToRight = function () {
    return this.reverse();
};

RelationController.prototype.reverseToLeftCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    return !this.reverseToRightCanDo();
};

RelationController.prototype.reverseToLeft = function () {
    return this.reverse();
};

RelationController.prototype.reverse = function () {
    return RelationService.inverse(
        this.model()
    ).then(() => {
        this.model().inverse();
    })
};

RelationController.prototype.leaveContextCanDo = function () {
    return this.isSingleAndOwned();
};

RelationController.prototype.leaveContext = function () {
    Store.dispatch("isNewContextFlow", true);
};

RelationController.prototype.leaveContextDo = async function () {
    const original = this.model().getDestinationVertex();
    const isRemoveFlow = this.model().getParentVertex().getUri() === original.getUri();
    const newVertex = await VertexService.createVertex();
    if (!this.model().isInverse()) {
        CurrentSubGraph.get().remove(original);
        CurrentSubGraph.get().add(newVertex);
    }
    const newVertexController = newVertex.controller();
    const addIdentifiersPromise = newVertexController.addIdentifiers(
        original.getIdentifiersIncludingSelf()
    );
    await Promise.all([
        newVertexController.setLabel(original.getLabel()),
        newVertexController.setShareLevelDo(original.getShareLevel()),
        addIdentifiersPromise,
        EdgeService.changeDestination(
            newVertex,
            this.model(),
            original.getShareLevel(),
            this.model().getOtherVertex(original).getShareLevel(),
            newVertex.getShareLevel()
        )
    ]);
    if (isRemoveFlow) {
        this.model().getParentVertex().addIdentifications(
            newVertex.getIdentifiers()
        );
        Selection.setToSingle(this.model().getParentVertex());
        this.model().remove();
    } else {
        this.model().setDestinationVertex(newVertex);
        this.model().refreshChildren();
        GraphElementService.changeChildrenIndex(this.model().getParentFork());
    }
    return newVertex;
};

export default api;
