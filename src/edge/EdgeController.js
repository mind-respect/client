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

EdgeController.prototype.expandCanDo = function () {
    return false;
};

EdgeController.prototype.collapseCanDo = function () {
    return false;
};

EdgeController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned();
};

EdgeController.prototype.addChild = async function () {
    let previousParentFork = this.model().getParentFork();
    let newGroupRelation = this._convertToGroupRelation();
    Selection.removeAll();
    let triple;
    return newGroupRelation.controller().addChildWhenInTransition().then((_triple) => {
        triple = _triple;
        triple.edge.addIdentifications(
            this.model().getIdentifiers()
        );
        triple.edge.controller().addIdentifiers(
            this.model().getIdentifiers(),
            true
        );
        this.setLabel("");
        previousParentFork.replaceChild(
            this.model(),
            newGroupRelation
        );
        newGroupRelation.refreshChildren();
        Vue.nextTick(() => {
            GraphElementService.changeChildrenIndex(
                this.model().getParentVertex()
            );
            Selection.setToSingle(triple.destination);
            triple.destination.focus();
            //would need to redraw but focus hides drawing
        });
        return triple;
    });
};

EdgeController.prototype.addSibling = function () {
    return this.model().getNextBubble().controller().addSibling().then((triple) => {
        Vue.nextTick(() => {
            Selection.setToSingle(
                triple.edge
            );
        })
    });
};

EdgeController.prototype.addSiblingCanDo = function () {
    return this.isSingle() && this.model().getNextBubble().controller().addSiblingCanDo();
};

EdgeController.prototype.becomeParent = function (adoptedChild) {
    if (adoptedChild.isVertex()) {
        adoptedChild = adoptedChild.getParentBubble();
    }
    let promises = [];
    Selection.removeAll();
    let parentFork = this.model().getParentFork();
    adoptedChild.getParentFork().removeChild(adoptedChild, false, true);
    let newGroupRelation = this._convertToGroupRelation();
    adoptedChild.setParentVertex(this.model().getParentVertex());
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
        GraphElementService.changeChildrenIndex(
            this.model().getParentVertex()
        );
        return newGroupRelation;
    });

    function moveEdge(movedEdge) {
        let identifiers = this.model().hasIdentifications() ?
            this.model().getIdentifiers() :
            this.model().getIdentifiersIncludingSelf();
        promises.push(
            movedEdge.controller().addIdentifiers(
                identifiers,
                true
            )
        );
        promises.push(
            movedEdge.controller().replaceParentVertex(
                this.model().getParentVertex(),
                true
            )
        );
    }
};

EdgeController.prototype._convertToGroupRelation = function () {
    let parentBubble = this.model().getParentBubble();
    let groupRelationIdentifiers;
    if (parentBubble.isGroupRelation()) {
        if (parentBubble.model().hasIdentification(this.model().buildSelfIdentifier())) {
            groupRelationIdentifiers = [this.model().buildTwiceSelfIdentifier()]
        } else {
            groupRelationIdentifiers = [this.model().buildSelfIdentifier()];
        }
    } else {
        groupRelationIdentifiers = this.model().hasIdentifications() ?
            this.model().getIdentifiers() :
            this.model().getIdentifiersIncludingSelf();
    }
    let newGroupRelation = GroupRelation.usingIdentifiers(
        groupRelationIdentifiers
    );
    newGroupRelation.parentBubble = parentBubble;
    newGroupRelation.parentVertex = this.model().getParentVertex();
    newGroupRelation.addChild(this.model());
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
    let isToTheLeft = this.model().isToTheLeft();
    let isInverse = this.model().isInverse();
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
        return sourceVertex.controller().expand().then(doIt.bind(this));
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
        return newParentVertex.controller().expand().then(doIt.bind(this));
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

export default api;
