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

RelationController.prototype.addChild = async function () {
    let previousParentFork = this.model().getParentFork();
    let convertResponse = this._convertToGroupRelation();
    let newGroupRelation = convertResponse.optimistic;
    Selection.removeAll();
    let triple = await newGroupRelation.controller().addChildWhenInTransition(convertResponse.promise);
    this.setLabel("");
    previousParentFork.replaceChild(
        this.model(),
        newGroupRelation
    );
    CurrentSubGraph.get().add(newGroupRelation);
    previousParentFork.refreshChildren(true);
    GraphElementService.changeChildrenIndex(
        newGroupRelation.getParentFork()
    );
    GraphElementService.changeChildrenIndex(
        newGroupRelation
    );
    Selection.setToSingle(triple.destination);
    triple.destination.focus();
    return triple;
};

RelationController.prototype.addSibling = function () {
    return this.model().getNextBubble().controller().addSibling().then((triple) => {
        Vue.nextTick(() => {
            Selection.setToSingle(
                triple.edge
            );
        })
    });
};

RelationController.prototype.addSiblingCanDo = function () {
    return this.isSingle() && this.model().getNextBubble().controller().addSiblingCanDo();
};

RelationController.prototype.becomeParent = async function (adoptedChild) {
    if (adoptedChild.isVertex()) {
        adoptedChild = adoptedChild.getParentBubble();
    }
    let promises = [];
    Selection.removeAll();
    let previousParentFork = this.model().getParentFork();
    let childParentFork = adoptedChild.getParentFork();
    promises.push(
        childParentFork.controller().becomeExParent(adoptedChild, this.model())
    );
    childParentFork.removeChild(adoptedChild, false, true);
    let convertResponse = this._convertToGroupRelation();
    let newGroupRelation = await convertResponse.promise;
    adoptedChild.setParentFork(newGroupRelation);
    newGroupRelation.addChild(adoptedChild);
    previousParentFork.replaceChild(
        this.model(),
        newGroupRelation
    );
    if (adoptedChild.isVertex()) {
        moveEdge.bind(this)(adoptedChild.getParentBubble());
    } else {
        moveEdge.bind(this)(adoptedChild);
    }
    previousParentFork.refreshChildren();
    return Promise.all(promises).then(() => {
        CurrentSubGraph.get().add(newGroupRelation);
        newGroupRelation.expand(true);
        GraphElementService.changeChildrenIndex(
            this.model().getParentFork()
        );
        Selection.setToSingle(newGroupRelation);
        return newGroupRelation;
    });

    async function moveEdge(movedEdge) {
        let tags = this.model().getIdentifiers();
        let tagsWithDefinedUri;
        let lastAddTagsPromise;
        let relations = movedEdge.isGroupRelation() ?
            movedEdge.getClosestChildRelations(true) :
            [movedEdge];
        promises.push(
            relations.map(async (relation) => {
                if (lastAddTagsPromise && !tagsWithDefinedUri) {
                    tagsWithDefinedUri = await lastAddTagsPromise;
                }
                lastAddTagsPromise = relation.controller().addIdentifiers(
                    tagsWithDefinedUri === undefined ? tags : tagsWithDefinedUri
                );
                return Promise.all([
                    lastAddTagsPromise,
                    relation.controller().replaceParentFork(
                        newGroupRelation,
                        true
                    )
                ]);
            })
        );
    }
};

RelationController.prototype._convertToGroupRelation = function () {
    let edge = this.model();
    edge.getIdentifiers().forEach((tag) => {
        this.model().removeTag(tag);
    });
    let response = RelationService.convertToGroupRelation(
        edge.getUri(),
        edge.getParentVertex().getShareLevel(),
        edge.isLabelEmpty() && edge.hasIdentifications() ? edge.getIdentifiers()[0].getLabel() : edge.getLabel(),
        !edge.hasComment() && edge.hasIdentifications() ? edge.getIdentifiers()[0].getComment() : edge.getComment()
    );
    let newGroupRelation = response.optimistic;
    newGroupRelation.parentBubble = this.model().getParentBubble();
    newGroupRelation.parentVertex = this.model().getParentVertex();
    this.model().parentBubble = newGroupRelation;
    this.model().setSourceVertex(newGroupRelation);
    newGroupRelation.addChild(this.model());
    newGroupRelation.isExpanded = true;
    return response;
};

RelationController.prototype.removeCanDo = function () {
    return this.isSingleAndOwned();
};

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
    CurrentSubGraph.get().remove(original);
    CurrentSubGraph.get().add(newVertex);
    const newVertexController = newVertex.controller();
    const addIdentifiersPromise = newVertexController.addIdentifiers(
        original.getIdentifiersIncludingSelf()
    );
    return Promise.all([
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
    ]).then(() => {
        if (isRemoveFlow) {
            this.model().getParentVertex().addIdentifications(
                newVertex.getIdentifiers()
            );
            this.model().remove();
        } else {
            this.model().setDestinationVertex(newVertex);
            this.model().refreshChildren();
            GraphElementService.changeChildrenIndex(this.model().getParentFork());
        }
        return newVertex;
    });
};

export default api;
