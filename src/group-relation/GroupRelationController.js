/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElementService from '@/graph-element/GraphElementService'
import Selection from '@/Selection'
import Vue from 'vue'
import CurrentSubGraph from "../graph/CurrentSubGraph";
import ForkService from "../fork/ForkService";
import ForkController from "../fork/ForkController";
import SubGraphController from '@/graph/SubGraphController'
import EdgeController from '@/edge/EdgeController'

const api = {};
api.GroupRelationController = GroupRelationController;

function GroupRelationController(groupRelationUi) {
    this.groupRelationsUi = groupRelationUi;
    ForkController.ForkController.prototype.init.call(
        this,
        this.groupRelationsUi
    );
    this.subGraphController = SubGraphController.withVertices(
        this.groupRelationsUi
    );
}

GroupRelationController.prototype = new ForkController.ForkController();

GroupRelationController.prototype.getSubGraphController = function () {
    return this.subGraphController;
};

GroupRelationController.prototype.cutCanDo = function () {
    return false;
};

GroupRelationController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned();
};


GroupRelationController.prototype.centerCanDo = function () {
    return false;
};

GroupRelationController.prototype.addChildWhenInTransition = function (convertPromise) {
    return this.addChild(
        undefined,
        undefined,
        false,
        convertPromise
    )
};

GroupRelationController.prototype.addChild = function (index, isToTheLeft, saveIndex, convertPromise) {
    if (saveIndex === undefined) {
        saveIndex = true;
    }
    let parentVertex = this.model().getParentVertex();
    if (this.model().canExpand()) {
        this.model().expand(true);
    }
    let addTuple = ForkService.addTuple(
        this.model(),
        convertPromise
    );

    let triple = addTuple.optimistic;

    addTuple.promise.then(() => {
        triple.destination.controller().setShareLevelDo(
            parentVertex.getShareLevel()
        );
    });
    addTuple.promise.catch(() => {
        triple.destination.remove();
    });
    this.model().addChild(
        triple.edge,
        isToTheLeft,
        index
    );
    CurrentSubGraph.get().add(triple.edge);
    if (saveIndex) {
        this.model().refreshChildren();
    }
    Vue.nextTick(async () => {
        saveIndex === false ? Promise.resolve() : GraphElementService.changeChildrenIndex(
            this.model()
        );
        if (saveIndex) {
            Selection.setToSingle(triple.destination);
            triple.destination.focus();
        }
    });
    return Promise.resolve(triple);
};

GroupRelationController.prototype.addSiblingCanDo = function () {
    return this.isSingleAndOwned() && this.model().getParentFork().controller().addChildCanDo();
};

GroupRelationController.prototype.addSibling = function () {
    return this.model().getParentFork().controller().addChild(
        this.model().getIndexInTree() + 1,
        this.model().isToTheLeft()
    );
};

GroupRelationController.prototype.removeCanDo = function () {
    return this.isOwned();
};

GroupRelationController.prototype.replaceParentFork = function (newParentFork, preventChangingInModel) {
    return this.getEdgeController().replaceParentFork(newParentFork, preventChangingInModel);
};

GroupRelationController.prototype.getEdgeController = function () {
    if (this._edgeController === undefined) {
        this._edgeController = new EdgeController().init(this.groupRelationsUi);
    }
    return this._edgeController;
};

GroupRelationController.prototype.convertToRelation = async function () {
    let edge = this.model().getNextBubble();
    await edge.controller().moveAbove(this.model());
    if (edge.isLabelEmpty()) {
        edge.controller().setLabel(this.model().getLabel());
    }
    await this.removeDo();
}
export default api;
