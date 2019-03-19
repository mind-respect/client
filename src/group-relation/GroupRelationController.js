/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import VertexService from '@/vertex/VertexService'
import EdgeService from '@/edge/EdgeService'
import GraphElementController from '@/graph-element/GraphElementController'
import GraphElementType from '@/graph-element/GraphElementType'
import GraphElementService from '@/graph-element/GraphElementService'

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

GroupRelationController.prototype.addChild = function (edgeOver) {
    let parentVertex = this.getUi().getParentVertex();
    let triple;
    if (this.getUi().canExpand()) {
        this.expand();
    }
    return VertexService.addRelationAndVertexToVertex(
        parentVertex,
        this.getUi(),
        edgeOver
    ).then(function (_triple) {
        triple = _triple;
        this.getModel().addTuple({
            edge: triple.edge,
            vertex: triple.destination
        });
        this.getModel().getIdentifiers().forEach(function (identifier) {
            identifier.makeSameAs();
            triple.edge.getController().addIdentification(
                identifier
            );
        });
        let promises = [
            EdgeService.updateLabel(
                triple.edge,
                this.getModel().getIdentification().getLabel()
            ).then(function () {
                triple.edge.setLabel(
                    this.getModel().getIdentification().getLabel()
                );
            }.bind(this))
        ];
        if (parentVertex.getModel().isPublic()) {
            promises.push(
                triple.destinationVertex().getController().makePublic()
            );
        }
        return Promise.all(promises);
    }.bind(this)).then(function () {
        if (edgeOver) {
            triple.edge().moveBelow(edgeOver);
        }
        return GraphElementService.changeChildrenIndex(
            this.getModel().getParentVertex()
        );
    }.bind(this)).then(function () {
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
            movedEdge.getController().changeEndVertex(
                this.getUi().getParentVertex()
            )
        );
        do {
            promises.push(
                movedEdge.getController().addIdentifiers(
                    parentGroupRelation.getModel().getIdentifiers()
                )
            );
            parentGroupRelation = parentGroupRelation.getParentBubble();
        } while (parentGroupRelation.isGroupRelation());
    }
};

GroupRelationController.prototype.becomeExParent = function (movedEdge) {
    var promises = [];
    var previousParentGroupRelation = this.getUi().getGreatestGroupRelationAncestor();
    previousParentGroupRelation.getModel().getIdentifiersAtAnyDepth().forEach(function (identifier) {
        identifier = movedEdge.getModel().getIdentifierHavingExternalUri(
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
    return $.when.apply($, promises);
};

export default api;
