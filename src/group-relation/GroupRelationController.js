/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import GraphElementController from '@/graph-element/GraphElementController'
import GraphElementService from '@/graph-element/GraphElementService'
import Selection from '@/Selection'
import Vue from 'vue'
import Store from '@/store'
import CurrentSubGraph from "../graph/CurrentSubGraph";
import ForkService from "../fork/ForkService";
import ForkController from "../fork/ForkController";
import SubGraphController from '@/graph/SubGraphController'

const api = {};
api.GroupRelationController = GroupRelationController;

function GroupRelationController(groupRelationUi) {
    this.groupRelationsUi = groupRelationUi;
    ForkController.ForkController.prototype.init.call(
        this,
        this.groupRelationsUi
    );
    this.subGraphController = SubGraphController.withVertices(
        this.groupRelationsUi
    );
}

GroupRelationController.prototype = new ForkController.ForkController();

GroupRelationController.prototype.getSubGraphController = function () {
    return this.subGraphController;
};

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

GroupRelationController.prototype.addChildWhenInTransition = function (convertPromise) {
    return this.addChild(
        undefined,
        undefined,
        false,
        convertPromise
    )
};

GroupRelationController.prototype.addChild = function (index, isToTheLeft, saveIndex, convertPromise) {
    if (saveIndex === undefined) {
        saveIndex = true;
    }
    let parentVertex = this.model().getParentVertex();
    if (this.model().canExpand()) {
        this.model().expand(true);
    }
    let addTuple = ForkService.addTuple(
        this.model(),
        convertPromise
    );

    let triple = addTuple.optimistic;

    addTuple.promise.then(() => {
        triple.destination.controller().setShareLevelDo(
            parentVertex.getShareLevel()
        );

        // let tags = this.model().getParentSerialTags();
        // return Promise.all(tags.map((identifier) => {
        //     identifier.makeSameAs();
        //     return triple.edge.controller().addIdentification(
        //         identifier,
        //         true,
        //         true
        //     ).then((tags) => {
        //         tags.forEach((tag) => {
        //             if (this.model().hasIdentification(tag)) {
        //                 this.model().getIdentifierHavingExternalUri(tag.getExternalResourceUri()).setUri(
        //                     tag.getUri()
        //                 )
        //             }
        //         })
        //     });
        // }));
    });
    addTuple.promise.catch(() => {
        triple.destination.remove();
    });
    // triple.edge.addIdentifications(
    //     this.model().getParentSerialTags()
    // );
    this.model().addChild(
        triple.edge,
        isToTheLeft,
        index
    );
    CurrentSubGraph.get().add(triple.edge);
    if (saveIndex) {
        this.model().refreshChildren();
    }
    Vue.nextTick(async () => {
        saveIndex === false ? Promise.resolve() : GraphElementService.changeChildrenIndex(
            this.model()
        );
        if (saveIndex) {
            Selection.setToSingle(triple.destination);
            triple.destination.focus();
        }
    });
    return Promise.resolve(triple);
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

// GroupRelationController.prototype.becomeExParent = function (movedEdge, newParent) {
    // let promises = [];
    // let greatestGroupRelationAncestor = this.model().getGreatestGroupRelationAncestor();
    // let isMovingUnderSameGroupRelation = this.model().getDescendants().some((child) => {
    //     return child.getId() === newParent.getId();
    // });
    // if (isMovingUnderSameGroupRelation) {
    //     return Promise.resolve();
    // }
    // let groupRelationToStop;
    // if (movedEdge.isGroupRelation()) {
    //     groupRelationToStop = movedEdge;
    // }
    // greatestGroupRelationAncestor.getIdentifiersAtAnyDepth(groupRelationToStop, true).forEach((identifier) => {
    //     if (movedEdge.isGroupRelation()) {
    //         movedEdge.getClosestChildRelations(true).forEach((relation) => {
    //             promises.push(
    //                 relation.controller().removeTag(
    //                     identifier,
    //                     true
    //                 )
    //             );
    //         });
    //     } else {
    //         promises.push(
    //             movedEdge.controller().removeTag(
    //                 identifier,
    //                 true
    //             )
    //         );
    //     }
    // });
    // return Promise.all(promises);
// };

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

// GroupRelationController.prototype.replaceParentVertex = function (newParentVertex) {
//     return Promise.all(
//         this.model().getClosestChildRelations().map((child) => {
//             return child.controller().replaceParentVertex(newParentVertex);
//         })
//     );
// };


GroupRelationController.prototype.addIdentificationCanDo = function () {
    return false;
};

GroupRelationController.prototype.removeIdentifier = function (tag, preventMoving) {
    return Promise.all(
        this.model().getClosestChildRelations(true).map((edge) => {
            return edge.controller().removeTag(tag, true)
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
