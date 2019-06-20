/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexService from '@/vertex/VertexService'
import EdgeService from '@/edge/EdgeService'
import GraphElementController from '@/graph-element/GraphElementController'
import GraphElementType from '@/graph-element/GraphElementType'
import GraphElementService from '@/graph-element/GraphElementService'
import SelectionHandler from '@/SelectionHandler'
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

GroupRelationController.prototype.addChild = function (saveIndex) {
    if (saveIndex === undefined) {
        saveIndex = true;
    }
    let parentVertex = this.getUi().getParentVertex();
    let triple;
    if (this.getUi().canExpand()) {
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
            this.model().addChild(triple.edge)
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
        if (parentVertex.model().isPublic()) {
            promises.push(
                triple.destination.getController().makePublic()
            );
        }
        return Promise.all(promises);
    }).then(() => {
        Vue.nextTick(() => {
            saveIndex === false ? Promise.resolve() : GraphElementService.changeChildrenIndex(
                this.model().getParentVertex()
            );
            if (saveIndex) {
                SelectionHandler.setToSingle(triple.destination);
                Store.dispatch("redraw");
            }
        });
        return triple;
    });
};

GroupRelationController.prototype.becomeParent = function (graphElementUi) {
    let uiChild;
    let promises = [];
    if (graphElementUi.isGroupRelation()) {
        graphElementUi.expand();
        graphElementUi.visitClosestChildOfType(
            GraphElementType.Relation,
            moveEdge.bind(this)
        );
        uiChild = graphElementUi;
    } else {
        uiChild = graphElementUi.isVertex() ? graphElementUi.getParentBubble() : graphElementUi;
        moveEdge.bind(this)(
            uiChild
        );
    }
    uiChild.moveToParent(this.getUi());
    return Promise.all(promises);

    function moveEdge(movedEdge) {
        var parentGroupRelation = this.getUi();
        promises.push(
            movedEdge.getController().replaceParentVertex(
                this.getUi().getParentVertex()
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
    previousParentGroupRelation.getModel().getIdentifiersAtAnyDepth().forEach(function (identifier) {
        identifier = movedEdge.model().getIdentifierHavingExternalUri(
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
