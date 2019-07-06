/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vue from 'vue'
import GraphElementController from '@/graph-element/GraphElementController'
import EdgeService from '@/edge/EdgeService'
import GraphElementType from '@/graph-element/GraphElementType'
import Selection from '@/Selection'
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

EdgeController.prototype.addChild = async function () {
    let newGroupRelation = this._convertToGroupRelation();
    let triple;
    Selection.removeAll();
    return newGroupRelation.getController().addChildWhenInTransition().then((_triple) => {
        triple = _triple;
        newGroupRelation.getIdentification().setUri(
            triple.edge.getIdentifiers()[0].getUri()
        );
        return triple.edge.getController().addIdentifiers(
            this.model().getIdentifiers()
        );
    }).then(() => {
        let parentBubble = this.model().getParentBubble();
        parentBubble.replaceChild(
            this.model(),
            newGroupRelation
        );
        Vue.nextTick(() => {
            GraphElementService.changeChildrenIndex(
                this.model().getParentVertex()
            );
            Selection.setToSingle(triple.destination);
            setTimeout(function () {
                Store.dispatch("redraw");
            }, 300)
        });
        return triple
    });
};

EdgeController.prototype.addSibling = function () {
    return this.model().getNextBubble().getController().addSibling().then((triple) => {
        Vue.nextTick(() => {
            Selection.setToSingle(
                triple.edge
            );
        })
    });
};

EdgeController.prototype.addSiblingCanDo = function () {
    return this.isSingle() && this.model().getNextBubble().getController().addSiblingCanDo();
};

EdgeController.prototype.becomeParent = function (adoptedChild) {
    if (adoptedChild.isVertex()) {
        adoptedChild = adoptedChild.getParentBubble();
    }
    let promises = [];
    Selection.removeAll();
    adoptedChild.getParentFork().removeChild(adoptedChild);
    let newGroupRelation = this._convertToGroupRelation();
    let parentFork = this.model().getParentFork();
    newGroupRelation.addChild(adoptedChild);
    parentFork.replaceChild(
        this.model(),
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
    return Promise.all(promises).then(() => {
        newGroupRelation.expand(true);
        Store.dispatch("redraw");
    });

    function moveEdge(movedEdge) {
        let identifiers = this.model().hasIdentifications() ?
            this.model().getIdentifiers() :
            this.model().getIdentifiersIncludingSelf();
        promises.push(
            movedEdge.getController().addIdentifiers(
                identifiers
            )
        );
        promises.push(
            movedEdge.getController().replaceParentVertex(
                this.model().getParentVertex(),
                true
            )
        );
    }
};

EdgeController.prototype._convertToGroupRelation = function () {
    let tuple = {
        edge: this.model(),
        vertex: this.model().getDestinationVertex()
    };
    let parentBubble = this.model().getParentBubble();
    let groupRelationIdentifiers;
    if (parentBubble.isGroupRelation()) {
        if (parentBubble.model().hasIdentification(this.model().buildSelfIdentifier())) {
            groupRelationIdentifiers = [
                this.model().buildTwiceSelfIdentifier()
            ];
        } else {
            groupRelationIdentifiers = [
                this.model().buildSelfIdentifier()
            ];
        }
    } else {
        groupRelationIdentifiers = this.model().hasIdentifications() ?
            this.model().getIdentifiers() :
            this.model().getIdentifiersIncludingSelf();
    }
    let newGroupRelation = GroupRelation.usingIdentifiers(
        groupRelationIdentifiers
    );
    newGroupRelation.addTuple(tuple);
    newGroupRelation.parentBubble = parentBubble;
    newGroupRelation.parentVertex = this.getUi().getParentVertex();
    newGroupRelation._sortedImmediateChild = newGroupRelation.sortedImmediateChild();
    newGroupRelation.isExpanded = true;
    newGroupRelation.updateGraphElementType();
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
    return this.reverse();
};

EdgeController.prototype.reverseToLeftCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    return !this.reverseToRightCanDo();
};

EdgeController.prototype.reverseToLeft = function () {
    return this.reverse();
};

EdgeController.prototype.reverse = function () {
    return EdgeService.inverse(
        this.model()
    ).then(() => {
        this.model().inverse();
    })
};
EdgeController.prototype.sourceVertex = function (sourceVertex) {
    if (!sourceVertex.isExpanded) {
        return sourceVertex.getController().expand().then(doIt.bind(this));
    } else {
        return doIt.bind(this)();
    }

    function doIt() {
        if (this.model().isInverse()) {
            this.setSourceVertex(sourceVertex);
            return EdgeService.changeSourceVertex(
                sourceVertex,
                self.getUi()
            );
        }
        this.setDestinationVertex(sourceVertex);
        return EdgeService.changeDestinationVertex(
            sourceVertex,
            this.model()
        );
    }
};
EdgeController.prototype.replaceParentVertex = function (newParentVertex, preventChangingInModel) {
    if (newParentVertex.canExpand()) {
        return newParentVertex.getController().expand().then(doIt.bind(this));
    } else {
        return doIt.bind(this)();
    }

    async function doIt() {
        let parentVertex = this.model().getParentVertex();
        // parentVertex.removeChild(this.getModel());
        if (this.model().isInverse()) {
            await EdgeService.changeDestinationVertex(
                newParentVertex,
                this.model()
            );
            return;
        } else {
            await EdgeService.changeSourceVertex(
                newParentVertex,
                this.model()
            );
        }
        if (!preventChangingInModel) {
            this.model().replaceRelatedVertex(parentVertex, newParentVertex);
        }
        // this.getModel().parentBubble = newParentVertex;
        // this.getModel().parentVertex = newParentVertex;
        // newParentVertex.addChild(this.getModel());


    }
};

EdgeController.prototype.setIsToTheLeftOrRight = function () {
    return this.getUi().isToTheLeft() ?
        EdgeService.setToTheLeft(
            this.model()
        ) :
        EdgeService.setToTheRight(
            this.model()
        );
};

export default api;
