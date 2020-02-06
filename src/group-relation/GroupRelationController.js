/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexService from '@/vertex/VertexService'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import GraphElementController from '@/graph-element/GraphElementController'
import GraphElementType from '@/graph-element/GraphElementType'
import GraphElementService from '@/graph-element/GraphElementService'
import Selection from '@/Selection'
import Vue from 'vue'
import Store from '@/store'
import CurrentSubGraph from "../graph/CurrentSubGraph";
import Vertex from '@/vertex/Vertex'

const api = {};
api.GroupRelationController = GroupRelationController;

function GroupRelationController(groupRelationUi) {
    this.groupRelationsUi = groupRelationUi;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.groupRelationsUi
    );
}

GroupRelationController.prototype = new GraphElementController.GraphElementController();

GroupRelationController.prototype.cutCanDo = function () {
    return false;
};

GroupRelationController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned();
};

GroupRelationController.prototype.addTagCanDo = function () {
    return false;
};

GroupRelationController.prototype.centerCanDo = function () {
    return false;
};

GroupRelationController.prototype.addChildWhenInTransition = function () {
    return this.addChild(
        undefined,
        undefined,
        false
    )
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

GroupRelationController.prototype.addChild = function (index, isToTheLeft, saveIndex) {
    if (saveIndex === undefined) {
        saveIndex = true;
    }
    let parentVertex = this.model().getParentVertex();
    if (this.model().canExpand()) {
        this.model().expand(true);
    }
    let addTuple = VertexService.addTuple(
        parentVertex
    );

    let triple = addTuple.optimistic;

    addTuple.promise.then(() => {
        triple.destination.controller().setShareLevelDo(
            parentVertex.getShareLevel()
        );
        return Promise.all(this.model().getIdentifiers().map((identifier) => {
            identifier.makeSameAs();
            return triple.edge.controller().addIdentification(
                identifier,
                true,
                true
            ).then((identifiers) => {
                identifiers.forEach((tag) => {
                    if (this.model().hasIdentification(tag)) {
                        this.model().getIdentifierHavingExternalUri(tag.getExternalResourceUri()).setUri(
                            tag.getUri()
                        )
                    }
                })
            });
        }));
    });
    triple.edge.addIdentifications(
        this.model().getIdentifiers()
    );
    this.model().addChild(
        triple.edge,
        isToTheLeft,
        index
    );
    CurrentSubGraph.get().add(triple.edge);
    if (saveIndex) {
        this.model().refreshChildren();
    }
    Vue.nextTick(() => {
        saveIndex === false ? Promise.resolve() : GraphElementService.changeChildrenIndex(
            this.model().getParentVertex()
        );
        if (saveIndex) {
            Selection.setToSingle(triple.destination);
            triple.destination.focus();
        }
    });
    return Promise.resolve(triple);
};

GroupRelationController.prototype.relateToDistantVertexWithUri = function (distantVertexUri, index, isLeft) {
    return GraphElementController.GraphElementController.prototype.relateToDistantVertexWithUri.call(
        this,
        distantVertexUri,
        index,
        isLeft,
        this.model().getIdentifiers()
    );
};


GroupRelationController.prototype.setLabel = function (newLabel) {
    let tag = this.model().getIdentification();
    tag.setLabel(
        newLabel
    );
    return FriendlyResourceService.updateLabel(
        tag,
        newLabel
    );
};

GroupRelationController.prototype.noteDo = function (note) {
    let tag = this.model().getIdentification();
    tag.setComment(
        note
    );
    return GraphElementService.updateNote(
        tag
    ).then(() => {
        Store.dispatch("redraw");
    });
};

GroupRelationController.prototype.becomeExParent = function (movedEdge, newParent) {
    let promises = [];
    let previousParentGroupRelation = this.model().getGreatestGroupRelationAncestor();
    let isMovingUnderSameGroupRelation = this.model().getDescendants().some((child)=>{
        return child.getId() === newParent.getId();
    });
    if (isMovingUnderSameGroupRelation) {
        return Promise.resolve();
    }
    let groupRelationToStop;
    if (movedEdge.isGroupRelation()) {
        groupRelationToStop = movedEdge;
    }
    previousParentGroupRelation.getIdentifiersAtAnyDepth(groupRelationToStop).forEach((identifier) => {
        promises.push(
            movedEdge.controller().removeIdentifier(
                identifier,
                true
            )
        );
    });
    return Promise.all(promises);
};

GroupRelationController.prototype.removeCanDo = function () {
    return false;
};

GroupRelationController.prototype.remove = function () {
    return Promise.all(
        this.model().getClosestChildRelations().map((child) => {
            return child.controller().remove();
        })
    );
};

GroupRelationController.prototype.addIdentification = function (tag) {
    return Promise.all(
        this.model().getClosestChildRelations().map((child) => {
            return child.controller().addIdentification(tag, true);
        })
    );
};

GroupRelationController.prototype.replaceParentVertex = function (newParentVertex) {
    return Promise.all(
        this.model().getClosestChildRelations().map((child) => {
            return child.controller().replaceParentVertex(newParentVertex);
        })
    );
};


GroupRelationController.prototype.addIdentificationCanDo = function () {
    return false;
};

GroupRelationController.prototype.removeIdentifier = function (tag, preventMoving) {
    return Promise.all(
        this.model().getClosestChildRelations(true).map((edge) => {
            return edge.controller().removeIdentifier(tag, true)
        })
    ).then(async () => {
        if (!preventMoving) {
            this.model().moveBelow(
                this.model().getParentBubble()
            );
            await Vue.nextTick();
            GraphElementService.changeChildrenIndex(
                this.model().getParentVertex()
            );
        }
    });
};

export default api;
