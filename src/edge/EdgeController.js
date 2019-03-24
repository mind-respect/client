/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vue from 'vue'
import $ from 'jquery'
import GraphElementController from '@/graph-element/GraphElementController'
import EdgeService from '@/edge/EdgeService'
import BubbleDeleteMenu from '@/bubble/BubbleDeleteMenu'
import GraphElementType from '@/graph-element/GraphElementType'
import SelectionHandler from '@/SelectionHandler'
import GroupRelation from '@/group-relation/GroupRelation'
import GraphElementService from '@/graph-element/GraphElementService'

const api = {};
api.RelationController = EdgeController;

function EdgeController(edges) {
    this.edges = edges;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.edges
    );
}

EdgeController.prototype = new GraphElementController.GraphElementController();

EdgeController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned();
};

EdgeController.prototype.addChild = function () {
    let newGroupRelation = this._convertToGroupRelation();
    let triple;
    SelectionHandler.reset();
    return newGroupRelation.getController().addChild(false).then(function (_triple) {
        triple = _triple;
        return triple.edge.getController().addIdentifiers(
            this.getModel().getIdentifiers()
        );
    }.bind(this)).then(function () {
        let parentBubble = this.getModel().getParentBubble();
        parentBubble.replaceChild(
            this.getModel(),
            newGroupRelation
        );
        Vue.nextTick(function () {
            GraphElementService.changeChildrenIndex(
                this.getModel().getParentVertex()
            );
            SelectionHandler.setToSingle(triple.destination);
        }.bind(this))
        return triple
    }.bind(this));
};

EdgeController.prototype.addSibling = function () {
    return this.getUi().getTopMostChildBubble().getController().addSibling().then(function (triple) {
        SelectionHandler.setToSingle(
            triple.edge()
        );
    });
};

EdgeController.prototype.addSiblingCanDo = function () {
    return this.isSingle() && this.getUi().getTopMostChildBubble().getController().addSiblingCanDo();
};

EdgeController.prototype.becomeParent = function (graphElementUi) {
    let promises = [];
    SelectionHandler.reset();
    let newGroupRelation = this._convertToGroupRelation();
    this.getModel().getParentVertex().replaceChild(
        this.getModel(),
        newGroupRelation
    );
    newGroupRelation.addChild(graphElementUi);
    if (graphElementUi.isGroupRelation()) {
        graphElementUi.expand();
        graphElementUi.visitClosestChildOfType(
            GraphElementType.Relation,
            moveEdge.bind(this)
        );
    } else if (graphElementUi.isVertex()) {
        moveEdge.bind(this)(graphElementUi.getParentBubble());
    } else {
        moveEdge.bind(this)(graphElementUi);
    }
    return $.when.apply($, promises);

    function moveEdge(movedEdge) {
        var identifiers = this.getModel().hasIdentifications() ?
            this.getModel().getIdentifiers() :
            this.getModel().getIdentifiersIncludingSelf();
        promises.push(
            movedEdge.getController().addIdentifiers(
                identifiers
            )
        );
        promises.push(
            movedEdge.getController().changeEndVertex(
                this.getUi().getParentVertex()
            )
        );
    }
};

EdgeController.prototype._convertToGroupRelation = function () {
    let tuple = {
        edge: this.getModel(),
        vertex: this.getModel().getDestinationVertex()
    };
    let parentBubble = this.getUi().getParentBubble();
    let groupRelationIdentifiers;
    if (parentBubble.isGroupRelation()) {
        if (parentBubble.getModel().hasIdentification(this.getModel().buildSelfIdentifier())) {
            groupRelationIdentifiers = [
                this.getModel().buildTwiceSelfIdentifier()
            ];
        } else {
            groupRelationIdentifiers = [
                this.getModel().buildSelfIdentifier()
            ];
        }
    } else {
        groupRelationIdentifiers = this.getModel().hasIdentifications() ?
            this.getModel().getIdentifiers() :
            this.getModel().getIdentifiersIncludingSelf();
    }
    // let newGroupRelation = GraphDisplayer.addNewGroupRelation(
    //     groupRelationIdentifiers,
    //     parentBubble,
    //     this.getUi().isToTheLeft(),
    //     this.getUi()
    // );
    let newGroupRelation = GroupRelation.usingIdentifiers(
        groupRelationIdentifiers
    );
    newGroupRelation.getModel().addTuple(tuple);
    newGroupRelation.parentBubble = newGroupRelation.parentVertex = parentBubble;
    // this.getUi().convertToGroupRelation(newGroupRelation);
    return newGroupRelation;
};

EdgeController.prototype.removeCanDo = function () {
    return this.isSingleAndOwned();
};

EdgeController.prototype.remove = function (skipConfirmation) {
    if (skipConfirmation) {
        return deleteAfterConfirmationBehavior.bind(this)();
    }
    return BubbleDeleteMenu.forRelation(
        this.getUi()
    ).ask().then(
        deleteAfterConfirmationBehavior.bind(this)
    );

    function deleteAfterConfirmationBehavior() {
        return EdgeService.remove(this.getUi(), function () {
            var parentBubble = this.getUi().getParentBubble();
            var childVertex = this.getUi().getTopMostChildBubble();
            this.getUi().applyToOtherInstances(function (otherInstance) {
                var childVertex = otherInstance.getTopMostChildBubble();
                childVertex.remove(false);
            });
            childVertex.remove(false);
            parentBubble.getModel().decrementNumberOfConnectedEdges();
            parentBubble.sideCenterOnScreenWithAnimation();
        }.bind(this));
    }
};
EdgeController.prototype.reverseToRightCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    var isToTheLeft = this.edges.isToTheLeft();
    var isInverse = this.edges.isInverse();
    return (isToTheLeft && !isInverse) ||
        (!isToTheLeft && isInverse);

};
EdgeController.prototype.reverseToRight = function () {
    this.reverse();
};

EdgeController.prototype.reverseToLeftCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    return !this.reverseToRightCanDo();
};

EdgeController.prototype.reverseToLeft = function () {
    this.reverse();
};

EdgeController.prototype.reverse = function () {
    var self = this;
    EdgeService.inverse(
        this.getUi()
    ).then(function () {
        self.getUi().inverse();
    });
};
EdgeController.prototype.sourceVertex = function (sourceVertex) {
    if (!sourceVertex.isExpanded()) {
        return sourceVertex.getController().expand().then(doIt.bind(this));
    } else {
        return doIt.bind(this)();
    }

    function doIt() {
        if (this.getModel().isInverse()) {
            this.setSourceVertex(sourceVertex);
            return EdgeService.changeSourceVertex(
                sourceVertex,
                self.getUi()
            );
        }
        this.setDestinationVertex(sourceVertex);
        return EdgeService.changeDestinationVertex(
            sourceVertex,
            this.getModel()
        );
    }
};
EdgeController.prototype.changeEndVertex = function (endVertex) {
    if (endVertex.canExpand()) {
        return endVertex.getController().expand().then(doIt.bind(this));
    } else {
        return doIt.bind(this)();
    }

    function doIt() {
        if (this.getModel().isInverse()) {
            this.getModel().setDestinationVertex(endVertex)
            return EdgeService.changeDestinationVertex(
                endVertex,
                this.getModel()
            )

        }
        this.getModel().setSourceVertex(endVertex)
        return EdgeService.changeSourceVertex(
            endVertex,
            this.getModel()
        );
    }
};

EdgeController.prototype.setIsToTheLeftOrRight = function () {
    return this.getUi().isToTheLeft() ?
        EdgeService.setToTheLeft(
            this.getModel()
        ) :
        EdgeService.setToTheRight(
            this.getModel()
        );
};

export default api;
