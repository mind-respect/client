/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexService from '@/vertex/VertexService'
import EdgeService from '@/edge/EdgeService'
import Selection from '@/Selection'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementController from '@/graph-element/GraphElementController'
import GraphElementService from '@/graph-element/GraphElementService'
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'
import ShareLevel from '@/vertex/ShareLevel'
import SubGraphController from '@/graph/SubGraphController'
import LoadingFlow from '@/LoadingFlow'
import Scroll from '@/Scroll'
import Vue from 'vue'
import Store from '@/store'
import CurrentSubGraph from "../graph/CurrentSubGraph";

const api = {};

function VertexController(vertices) {
    this.vertices = vertices;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.vertices
    );
    this.subGraphController = SubGraphController.withVertices(
        this.vertices
    );
}

VertexController.prototype = new GraphElementController.GraphElementController();

VertexController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned() && !this.model().isPristine();
};

VertexController.prototype.addChild = function (index, isToTheLeft) {
    let promise = this.model().isCenter ? Promise.resolve() : this.expand(true, true);
    return promise.then(() => {
        let triple = VertexService.addTuple(
            this.model()
        ).optimistic;
        this.model().addChild(
            triple.edge,
            isToTheLeft,
            index
        );
        CurrentSubGraph.get().add(triple.edge);
        Vue.nextTick(() => {
            Selection.setToSingle(triple.destination);
            GraphElementService.changeChildrenIndex(
                this.model()
            );
            triple.destination.focus();
            //would need to redraw but focus hides drawing
        });
        if (ShareLevel.PRIVATE === this.model().model().getShareLevel()) {
            triple.destination.setShareLevel(ShareLevel.PRIVATE);
        } else {
            //not returning promise to allow faster process
            triple.destination.controller().setShareLevel(
                this.model().getShareLevel()
            );
        }
        return triple;
    });
};

VertexController.prototype.convertToRelationCanDo = function () {
    if (!this.isSingleAndOwned() || this.model().canExpand() || this.model().isLabelEmpty() || this.model().hasIdentifications()) {
        return false;
    }
    let numberOfChild = this.model().getNumberOfChild();
    if (numberOfChild >= 2) {
        return false;
    }
    let parentBubble = this.getUi().getParentBubble();

    if (!parentBubble.isRelation() || !parentBubble.isPristine()) {
        return false;
    }
    if (numberOfChild === 1) {
        let childRelation = this.model().getNextBubble();
        return childRelation.isRelation() && childRelation.isPristine();
    }
    return true;
};

VertexController.prototype.convertToRelation = function () {
    let parentRelation = this.getUi().getParentBubble();
    let promises = [];
    let label = this.model().getLabel();
    let toSelect;
    if (this.model().getNumberOfChild() === 1) {
        let childRelation = this.getUi().getNextBubble();
        promises.push(
            childRelation.controller().setLabel(
                label
            )
        );
        promises.push(
            childRelation.controller().moveBelow(
                parentRelation
            )
        );
        promises.push(
            this.remove(true)
        );
        toSelect = childRelation;
    } else {
        promises.push(
            parentRelation.controller().setLabel(
                label
            )
        );
        this.setLabel(
            ""
        );
        toSelect = this.getUi();
    }
    return Promise.all(promises).then(() => {
        Selection.setToSingle(toSelect);
        Store.dispatch("redraw");
    });
};

VertexController.prototype.convertToGroupRelationCanDo = function () {
    if (!this.isSingleAndOwned() || this.model().canExpand() || this.model().isLabelEmpty() || this.model().hasIdentifications()) {
        return false;
    }
    let numberOfChild = this.model().getNumberOfChild();
    if (numberOfChild <= 1) {
        return false;
    }
    let allChildAreEmptyRelations = this.model().getNextChildren().every((child) => {
        return child.isRelation() && child.isPristine()
    });
    if (!allChildAreEmptyRelations) {
        return false;
    }

    let parentBubble = this.model().getParentBubble();
    return parentBubble.isRelation() && parentBubble.isPristine();
};

VertexController.prototype.convertToGroupRelation = async function () {
    let parentRelation = this.model().getParentBubble();
    let children = this.model().getClosestChildrenOfType(GraphElementType.Relation);
    parentRelation.setLabel(this.model().getLabel());
    parentRelation = await children[0].controller().moveUnderParent(parentRelation);
    let promises = [];
    let l = 1;
    while (l < children.length) {
        let childRelation = children[l];
        promises.push(
            childRelation.controller().moveUnderParent(
                parentRelation
            )
        );
        l++;
    }
    return Promise.all(promises).then(() => {
        return this.removeDo(true);
    }).then(() => {
        Selection.setToSingle(parentRelation);
        GraphElementService.changeChildrenIndex(parentRelation.getParentVertex());
    });
};

VertexController.prototype.addSiblingCanDo = function () {
    return this.isSingleAndOwned() && !this.model().isCenter &&
        !this.getUi().getParentBubble().getParentBubble().isMeta() &&
        !this.model().isPristine();
};

VertexController.prototype.addSibling = function () {
    let parent = this.model().getParentFork();
    return parent.controller().addChild(
        this.model().getIndexInTree() + 1,
        this.model().isToTheLeft()
    );
};

VertexController.prototype.removeManyIsPossible = true;

VertexController.prototype.removeCanDo = function () {
    return this.isOwned();
};

VertexController.prototype.imagesCanDo = function () {
    return false;
    // return this.isSingleAndOwned();
};

VertexController.prototype.images = function () {
//
};

VertexController.prototype.togglePublicPrivate = function () {
    if (this._areAllElementsPrivate()) {
        this.makePublic();
    } else if (this._areAllElementsPublic()) {
        this.makePrivate();
    }
};


VertexController.prototype.makePrivateManyIsPossible = true;

VertexController.prototype.makePrivateCanDo = function () {
    return this.isOwned() && (
        (this.isMultiple() && !this._areAllElementsPrivate()) || (
            this.isSingle() && this.getUi().model().isPublic()
        )
    );
};

VertexController.prototype.makePrivate = function () {
    return this.setShareLevel(ShareLevel.PRIVATE);
};


VertexController.prototype.makePublicCanDo = function () {
    return this.isOwned() && (
        (this.isMultiple() && !this._areAllElementsPublic()) || (
            this.isSingle() && !this.getUi().model().isPublic()
        )
    );
};

VertexController.prototype._areAllElementsPublic = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.PUBLIC_WITH_LINK,
        ShareLevel.PUBLIC
    ]);
};

VertexController.prototype._areAllElementsPrivate = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.PRIVATE
    ]);
};

VertexController.prototype._areAllElementsFriendsOnly = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.FRIENDS
    ]);
};

VertexController.prototype._areAllElementsInShareLevels = function (shareLevels) {
    if (this.isSingle()) {
        return shareLevels.indexOf(
            this.model().getShareLevel()
        ) !== -1;
    }
    return this.getUi().every(function (ui) {
        return shareLevels.indexOf(
            ui.model().getShareLevel()
        ) !== -1;
    });
};

VertexController.prototype.makePublic = function () {
    return this.setShareLevel(ShareLevel.PUBLIC);
};

// VertexController.prototype.share = function () {
//     var $shareMenu = $("#share-menu");
//     var $shareList = $("#share-list").empty();
//     var $copyShareLink = $("#copy-share-link");
//     this.getUiArray().forEach(function (bubble) {
//         $shareList.append(
//             $("<li>").text(bubble.text())
//         );
//     });
//     $shareMenu.find(".multiple-flow")[
//         this.isMultiple() ? 'removeClass' : 'addClass'
//         ]("hidden");
//     $copyShareLink[this.isMultiple() ? 'addClass' : 'removeClass'](
//         "hidden"
//     );
//     var $radios = $shareMenu.find("input[name=shareLevel]");
//     if (this._areAllElementsPrivate()) {
//         $radios.val(["private"]);
//         $copyShareLink.prop('disabled', true);
//     } else if (this._areAllElementsFriendsOnly()) {
//         $radios.val(["friends"]);
//     } else if (this._areAllElementsInShareLevels([ShareLevel.PUBLIC_WITH_LINK])) {
//         $radios.val(["public_with_link"]);
//     }
//     else if (this._areAllElementsInShareLevels([ShareLevel.PUBLIC])) {
//         $radios.val(["public"]);
//     } else {
//         $radios.val([""]);
//     }
//     $shareMenu.modal();
// };

VertexController.prototype.setShareLevel = function (shareLevel) {
    let verticesToUpdate = this.getUiArray().filter((vertex) => {
        return vertex.getShareLevel() !== shareLevel.toUpperCase()
    }).map((vertex) => {
        if (ShareLevel.isPublic(shareLevel)) {
            vertex.getParentVertex().incrementNbPublicNeighbors();
        }
        if (shareLevel === ShareLevel.FRIENDS) {
            vertex.getParentVertex().incrementNbFriendNeighbors();
        }
        vertex.setShareLevel(shareLevel);
        if (vertex.model().isPublic()) {
            vertex.getParentVertex().decrementNbPublicNeighbors();
        }
        if (vertex.model().isFriendsOnly()) {
            vertex.getParentVertex().decrementNbFriendNeigbors();
        }
        return vertex;
    });
    if (verticesToUpdate.length === 0) {
        return Promise.resolve();
    }
    return this.isMultiple() ?
        VertexService.setCollectionShareLevel(
            shareLevel, verticesToUpdate
        ) : VertexService.setShareLevel(
            shareLevel, this.model()
        );
};

VertexController.prototype.becomeParent = function (child) {
    let promises = [];
    let uiChild;
    if (child.isGroupRelation()) {
        child.expand();
        child.visitClosestChildOfType(
            GraphElementType.Relation,
            moveEdge.bind(this)
        );
        uiChild = child;
    } else {
        uiChild = child.isRelation() ? child : child.getParentBubble();
        moveEdge.bind(this)(uiChild);
    }

    return Promise.all(promises).then(() => {
        uiChild.moveToParent(
            this.model()
        );
        Vue.nextTick(() => {
            GraphElementService.changeChildrenIndex(this.model());
        });
    });

    function moveEdge(movedEdge) {
        promises.push(
            movedEdge.controller().replaceParentVertex(
                this.model(),
                true
            )
        );
        if (!child.isGroupRelation()) {
            promises.push(
                movedEdge.getParentBubble().controller().becomeExParent(movedEdge)
            );
        }
    }
};

VertexController.prototype.copyCanDo = function () {
    return !this.isSingle() || !this.getUi().isLabelEmpty();
};

VertexController.prototype.copy = function () {

};

VertexController.prototype.expand = function (avoidCenter, avoidExpandChild, isChildExpand) {
    if (!this.expandCanDo()) {
        this.model().isExpanded = true;
        return Promise.resolve();
    }
    if (avoidExpandChild && !this.model().canExpand()) {
        this.model().isExpanded = true;
        return Promise.resolve();
    }
    let promise = Promise.resolve();
    LoadingFlow.enterNoSpinner();
    this.model().loading = false;
    avoidExpandChild = avoidExpandChild || false;
    isChildExpand = isChildExpand || false;
    this.model().beforeExpand();
    if (!this.model().isExpanded) {
        if (!this.model().isCollapsed) {
            promise = this.subGraphController.loadForParentIsAlreadyOnMap().then(() => {
                if (avoidExpandChild) {
                    return true;
                }
                let expandChildCalls = [];
                this.model().getClosestChildVertices().forEach((childVertex) => {
                    if (childVertex.getNumberOfChild() === 1) {
                        expandChildCalls.push(
                            childVertex.controller().expand(true, true, true)
                        );
                    }
                });
                return Promise.all(expandChildCalls);
            });
        }
    } else {
        this.model().loading = false;
        promise = this.expandDescendantsIfApplicable();
    }
    return promise.then(() => {
        this.model().expand(avoidCenter, isChildExpand);
        Vue.nextTick(() => {
            LoadingFlow.leave();
            if (avoidCenter !== true) {
                Scroll.centerBubbleForTreeIfApplicable(this.model());
                Store.dispatch("redraw");
            }
        });
    });
};

VertexController.prototype.convertToDistantBubbleWithUriCanDo = function (distantVertexUri) {
    if (!IdUri.isGraphElementUriOwnedByCurrentUser(distantVertexUri)) {
        return false;
    }
    if (!IdUri.isVertexUri(distantVertexUri)) {
        return false;
    }
    let parent = this.getUi().getParentVertex();
    let grandParent = parent.getParentVertex();
    if (distantVertexUri === grandParent.getUri()) {
        return false;
    }
    let alreadyChildOfParent = parent.getClosestChildVertices().some((child) => {
        return child.getUri() === distantVertexUri;
    });
    return !alreadyChildOfParent;
};

VertexController.prototype.convertToDistantBubbleWithUri = function (distantVertexUri) {
    if (!this.convertToDistantBubbleWithUriCanDo(distantVertexUri)) {
        return Promise.reject();
    }
    let beforeMergeLabel = this.model().getLabel();
    return this.expand(true).then(() => {
        return VertexService.mergeTo(this.model(), distantVertexUri);
    }).then(() => {
        this.model().setUri(distantVertexUri);
        CurrentSubGraph.get().add(this.model());
        return SubGraphController.withVertex(
            this.model()
        ).loadForParentIsAlreadyOnMap();
    }).then(() => {
        let concatenatedLabel = beforeMergeLabel + " " + this.model().getLabel();
        if (concatenatedLabel !== this.model().getLabel()) {
            this.setLabel(
                concatenatedLabel
            );
        }
        GraphElementService.changeChildrenIndex(
            this.model().getParentVertex()
        );
        Store.dispatch("redraw");
    });
};

VertexController.prototype.mergeCanDo = function () {
    return this.isSingle() && this.isOwned();
};

VertexController.prototype.merge = function () {
    Store.dispatch("setSideMenuFlow", 2);
    return Promise.resolve();
};

VertexController.prototype._relateToDistantVertexWithUri = function (distantVertexUri) {
    return EdgeService.addToFarVertex(this.getUi(), distantVertexUri).then(() => {
        return GraphDisplayer.connectVertexToVertexWithUri(
            this.getUi(),
            distantVertexUri
        );
    });
};

api.VertexController = VertexController;

export default api;
