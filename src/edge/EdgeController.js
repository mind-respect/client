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
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import VertexService from '@/vertex/VertexService'
import UiUtils from "../UiUtils";

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
    let newGroupRelation = await this._convertToGroupRelation();
    Selection.removeAll();
    let triple = await newGroupRelation.controller().addChildWhenInTransition();
    this.model().getIdentifiers().forEach((tag) => {
        if (triple.edge.hasIdentification(tag)) {
            return;
        }
        triple.edge.controller().addIdentification(
            tag,
            true,
            true
        );
        triple.edge.addIdentification(tag);
    });
    this.setLabel("");
    previousParentFork.replaceChild(
        this.model(),
        newGroupRelation
    );
    CurrentSubGraph.get().add(newGroupRelation);
    previousParentFork.refreshChildren(true);
    GraphElementService.changeChildrenIndex(
        this.model().getParentVertex()
    );
    Selection.setToSingle(triple.destination);
    await Vue.nextTick()
    await UiUtils.animateNewTriple(
        newGroupRelation,
        triple
    );
    return triple;
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

EdgeController.prototype.becomeParent = async function (adoptedChild) {
    if (adoptedChild.isVertex()) {
        adoptedChild = adoptedChild.getParentBubble();
    }
    let promises = [];
    Selection.removeAll();
    let previousParentFork = this.model().getParentFork();
    let childParentFork = adoptedChild.getParentFork();
    promises.push(
        childParentFork.controller().becomeExParent(adoptedChild, this.model())
    );
    childParentFork.removeChild(adoptedChild, false, true);
    let newGroupRelation = await this._convertToGroupRelation();
    adoptedChild.setParentVertex(this.model().getParentVertex());
    newGroupRelation.addChild(adoptedChild);
    previousParentFork.replaceChild(
        this.model(),
        newGroupRelation
    );
    if (adoptedChild.isVertex()) {
        moveEdge.bind(this)(adoptedChild.getParentBubble());
    } else {
        moveEdge.bind(this)(adoptedChild);
    }
    previousParentFork.refreshChildren();
    return Promise.all(promises).then(() => {
        CurrentSubGraph.get().add(newGroupRelation);
        newGroupRelation.expand(true);
        GraphElementService.changeChildrenIndex(
            this.model().getParentVertex()
        );
        Selection.setToSingle(newGroupRelation);
        return newGroupRelation;
    });

    async function moveEdge(movedEdge) {
        let tags = this.model().hasIdentifications() && !previousParentFork.isGroupRelation() ?
            this.model().getIdentifiers() :
            this.model().getIdentifiersIncludingSelf();
        let tagsWithDefinedUri;
        let lastAddTagsPromise;
        let relations = movedEdge.isGroupRelation() ? movedEdge.getClosestChildRelations(true) : [movedEdge];
        promises.push(
            relations.map(async (relation) => {
                if (lastAddTagsPromise && !tagsWithDefinedUri) {
                    tagsWithDefinedUri = await lastAddTagsPromise;
                }
                lastAddTagsPromise = relation.controller().addIdentifiers(
                    tagsWithDefinedUri === undefined ? tags : tagsWithDefinedUri,
                    true
                );
                return Promise.all([
                    lastAddTagsPromise,
                    relation.controller().replaceParentVertex(
                        this.model().getParentVertex(),
                        true
                    )
                ]);
            })
        );
    }
};

EdgeController.prototype._convertToGroupRelation = async function () {
    let parentBubble = this.model().getParentBubble();
    let groupRelationIdentifiers;
    let nonRefTags = this.model().getNonRefTags();
    if (parentBubble.isGroupRelation() || nonRefTags.length === 0) {
        groupRelationIdentifiers = await this.addIdentification(
            this.model().buildAdditionalSelfTag(),
            true
        );
        groupRelationIdentifiers[0].setShareLevel(
            this.model().getShareLevel()
        );
        this.model().addIdentification(groupRelationIdentifiers[0]);
    } else {
        groupRelationIdentifiers = [nonRefTags[0]];
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
                this.model()
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

EdgeController.prototype.leaveContextCanDo = function () {
    return this.isSingleAndOwned();
};

EdgeController.prototype.leaveContext = function () {
    Store.dispatch("isNewContextFlow", true);
};

EdgeController.prototype.leaveContextDo = async function () {
    const original = this.model().getDestinationVertex();
    const isRemoveFlow = this.model().getParentVertex().getUri() === original.getUri();
    const newVertex = await VertexService.createVertex();
    CurrentSubGraph.get().remove(original);
    CurrentSubGraph.get().add(newVertex);
    const newVertexController = newVertex.controller();
    const addIdentifiersPromise = newVertexController.addIdentifiers(
        original.getIdentifiersIncludingSelf(),
        true
    );
    return Promise.all([
        newVertexController.setLabel(original.getLabel()),
        newVertexController.setShareLevelDo(original.getShareLevel()),
        addIdentifiersPromise,
        EdgeService.changeDestinationVertex(
            newVertex,
            this.model()
        )
    ]).then(() => {
        if (isRemoveFlow) {
            this.model().getParentVertex().addIdentifications(
                newVertex.getIdentifiers()
            );
            this.model().remove();
        } else {
            this.model().setDestinationVertex(newVertex);
            this.model().refreshChildren();
            GraphElementService.changeChildrenIndex(this.model().getParentVertex());
        }
        return newVertex;
    });
};

export default api;
