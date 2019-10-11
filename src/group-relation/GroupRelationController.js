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
    this.model().refreshChildren();
    Vue.nextTick(() => {
        saveIndex === false ? Promise.resolve() : GraphElementService.changeChildrenIndex(
            this.model().getParentVertex()
        );
        if (saveIndex) {
            Selection.setToSingle(triple.destination);
            triple.destination.focus();
            //would need to redraw but focus hides drawing
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
    this.model().setLabel(
        newLabel
    );
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
    this.model().setComment(
        note
    );
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

GroupRelationController.prototype.becomeParent = function (child) {
    let uiChild;
    let promises = [];
    if (child.isGroupRelation()) {
        child.expand();
        child.getClosestChildrenOfType(
            GraphElementType.Relation
        ).forEach(moveEdge.bind(this));
        uiChild = child;
    } else {
        uiChild = child.isVertex() ? child.getParentBubble() : child;
        moveEdge.bind(this)(
            uiChild
        );
    }
    return Promise.all(promises).then(() => {
        uiChild.moveToParent(this.model());
        Vue.nextTick(() => {
            GraphElementService.changeChildrenIndex(
                this.model().getParentVertex()
            );
        });
        return this.model();
    });

    function moveEdge(movedEdge) {
        let parentGroupRelation = this.model();
        promises.push(
            movedEdge.controller().replaceParentVertex(
                parentGroupRelation.getParentVertex(),
                true
            )
        );
        do {
            promises.push(
                movedEdge.controller().addIdentifiers(
                    parentGroupRelation.model().getIdentifiers(),
                    true
                )
            );
            parentGroupRelation = parentGroupRelation.getParentBubble();
        } while (parentGroupRelation.isGroupRelation());
    }
};

GroupRelationController.prototype.becomeExParent = function (movedEdge) {
    let promises = [];
    let previousParentGroupRelation = this.model().getGreatestGroupRelationAncestor();
    previousParentGroupRelation.getIdentifiersAtAnyDepth().forEach((identifier) => {
        identifier = identifier.getExternalResourceUri() === movedEdge.getUri() ? identifier :
            movedEdge.model().getIdentifierHavingExternalUri(
                identifier.getExternalResourceUri()
            );
        if (identifier) {
            promises.push(
                movedEdge.controller().removeIdentifier(
                    identifier,
                    true
                )
            );
        }
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

GroupRelationController.prototype.addTagToChildVertex = function (tag) {
    return Promise.all(
        this.model().getClosestChildVertices().map((child) => {
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

export default api;
