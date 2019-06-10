/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vue from 'vue'
import GraphElementController from '@/graph-element/GraphElementController'
import EdgeService from '@/edge/EdgeService'
import GraphElementType from '@/graph-element/GraphElementType'
import SelectionHandler from '@/SelectionHandler'
import GroupRelation from '@/group-relation/GroupRelation'
import GraphElementService from '@/graph-element/GraphElementService'
import Store from '@/store'

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
    SelectionHandler.removeAll();
    return newGroupRelation.getController().addChild(false).then((_triple) => {
        triple = _triple;
        return triple.edge.getController().addIdentifiers(
            this.getModel().getIdentifiers()
        );
    }).then(() => {
        let parentBubble = this.getModel().getParentBubble();
        parentBubble.replaceChild(
            this.getModel(),
            newGroupRelation
        );
        Vue.nextTick(() => {
            GraphElementService.changeChildrenIndex(
                this.getModel().getParentVertex()
            );
            setTimeout(function () {
                SelectionHandler.setToSingle(triple.destination);
                Store.dispatch("redraw");
            }, 300)
        });
        return triple
    });
};

EdgeController.prototype.addSibling = function () {
    return this.getModel().getNextBubble().getController().addSibling().then(function (triple) {
        Vue.nextTick(function () {
            SelectionHandler.setToSingle(
                triple.edge
            );
        })
    });
};

EdgeController.prototype.addSiblingCanDo = function () {
    return this.isSingle() && this.getModel().getNextBubble().getController().addSiblingCanDo();
};

EdgeController.prototype.becomeParent = function (adoptedChild) {
    let promises = [];
    SelectionHandler.removeAll();
    let newGroupRelation = this._convertToGroupRelation();
    let parentBubble = this.getModel().getParentBubble();
    newGroupRelation.addChild(adoptedChild);
    parentBubble.replaceChild(
        this.getModel(),
        newGroupRelation
    );
    if (adoptedChild.isGroupRelation()) {
        adoptedChild.expand();
        adoptedChild.visitClosestChildOfType(
            GraphElementType.Relation,
            moveEdge.bind(this)
        );
    } else if (adoptedChild.isVertex()) {
        moveEdge.bind(this)(adoptedChild.getParentBubble());
    } else {
        moveEdge.bind(this)(adoptedChild);
    }
    return Promise.all(promises).then(function () {
        newGroupRelation.expand(true);
        Store.dispatch("redraw");
    });

    function moveEdge(movedEdge) {
        let identifiers = this.getModel().hasIdentifications() ?
            this.getModel().getIdentifiers() :
            this.getModel().getIdentifiersIncludingSelf();
        promises.push(
            movedEdge.getController().addIdentifiers(
                identifiers
            )
        );
        this.getModel().getParentBubble().removeChild(movedEdge);
        promises.push(
            movedEdge.getController().replaceParentVertex(
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
    let newGroupRelation = GroupRelation.usingIdentifiers(
        groupRelationIdentifiers
    );
    newGroupRelation.getModel().addTuple(tuple);
    newGroupRelation.parentBubble = parentBubble;
    newGroupRelation.parentVertex = this.getUi().getParentVertex();
    newGroupRelation._sortedImmediateChild = newGroupRelation.sortedImmediateChild();
    newGroupRelation.isExpanded = true;
    return newGroupRelation;
};

EdgeController.prototype.removeCanDo = function () {
    return this.isSingleAndOwned();
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
    EdgeService.inverse(
        this.getModel()
    ).then(() => {
        this.getModel().inverse();
    })
};
EdgeController.prototype.sourceVertex = function (sourceVertex) {
    if (!sourceVertex.isExpanded) {
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
EdgeController.prototype.replaceParentVertex = function (newParentVertex) {
    if (newParentVertex.canExpand()) {
        return newParentVertex.getController().expand().then(doIt.bind(this));
    } else {
        return doIt.bind(this)();
    }

    function doIt() {
        let parentVertex = this.getModel().getParentVertex();
        // parentVertex.removeChild(this.getModel());
        this.getModel().replaceRelatedVertex(parentVertex, newParentVertex);
        // this.getModel().parentBubble = newParentVertex;
        // this.getModel().parentVertex = newParentVertex;
        // newParentVertex.addChild(this.getModel());
        if (this.getModel().isSourceVertex(newParentVertex)) {
            return EdgeService.changeSourceVertex(
                newParentVertex,
                this.getModel()
            );
        } else {
            return EdgeService.changeDestinationVertex(
                newParentVertex,
                this.getModel()
            )
        }
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
