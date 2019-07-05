/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexService from '@/vertex/VertexService'
import EdgeService from '@/edge/EdgeService'
import GraphElementController from '@/graph-element/GraphElementController'
import GraphElementType from '@/graph-element/GraphElementType'
import GraphElementService from '@/graph-element/GraphElementService'
import Selection from '@/Selection'
import Vue from 'vue'
import Store from '@/store'

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

GroupRelationController.prototype.addChild = function (index, isToTheLeft, saveIndex) {
    if (saveIndex === undefined) {
        saveIndex = true;
    }
    let parentVertex = this.model().getParentVertex();
    let triple;
    if (this.model().canExpand()) {
        this.expand(true);
    }
    return VertexService.addTuple(
        parentVertex
    ).then((_triple) => {
        triple = _triple;
        let addIdentifiers = Promise.all(this.model().getIdentifiers().map(function (identifier) {
            identifier.makeSameAs();
            return triple.edge.getController().addIdentification(
                identifier
            );
        })).then(() => {
            this.model().addChild(
                triple.edge,
                isToTheLeft,
                index
            );
            return triple.destination.getController().setShareLevel(
                parentVertex.getShareLevel()
            );
        });
        let promises = [
            addIdentifiers,
            EdgeService.updateLabel(
                triple.edge,
                this.model().getIdentification().getLabel()
            ).then(() => {
                triple.edge.setLabel(
                    this.model().getIdentification().getLabel()
                );
            })
        ];
        return Promise.all(promises);
    }).then(() => {
        Vue.nextTick(() => {
            saveIndex === false ? Promise.resolve() : GraphElementService.changeChildrenIndex(
                this.model().getParentVertex()
            );
            if (saveIndex) {
                Selection.setToSingle(triple.destination);
                Store.dispatch("redraw");
            }
        });
        return triple;
    });
};

GroupRelationController.prototype.becomeParent = function (child) {
    let uiChild;
    let promises = [];
    if (child.isGroupRelation()) {
        child.expand();
        child.getClosestChildrenOfType(
            GraphElementType.Relation,
            moveEdge.bind(this)
        );
        uiChild = child;
    } else {
        uiChild = child.isVertex() ? child.getParentBubble() : child;
        moveEdge.bind(this)(
            uiChild
        );
    }
    return Promise.all(promises).then(() => {
        uiChild.moveToParent(this.model());
    });

    function moveEdge(movedEdge) {
        let parentGroupRelation = this.model();
        promises.push(
            movedEdge.getController().replaceParentVertex(
                parentGroupRelation.getParentVertex(),
                true
            )
        );
        do {
            promises.push(
                movedEdge.getController().addIdentifiers(
                    parentGroupRelation.model().getIdentifiers()
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
                movedEdge.getController().removeIdentifier(
                    identifier
                )
            );
        }
    });
    return Promise.all(promises);
};

export default api;
