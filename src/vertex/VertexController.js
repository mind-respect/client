/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexService from '@/vertex/VertexService'
import Selection from '@/Selection'
import GraphElementService from '@/graph-element/GraphElementService'
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'
import ShareLevel from '@/vertex/ShareLevel'
import SubGraphController from '@/graph/SubGraphController'
import LoadingFlow from '@/LoadingFlow'
import TagVertexService from '@/tag/TagVertexService'
import Vue from 'vue'
import Store from '@/store'
import CurrentSubGraph from "@/graph/CurrentSubGraph";
import router from '@/router'
import ForkService from "../fork/ForkService";
import ForkController from "../fork/ForkController";

const api = {};

api.fromDifferentGraphElements = function (graphElements) {
    return new VertexController(
        graphElements.filter((graphElement) => {
            return graphElement.isVertex() || graphElement.isMeta()
        })
    );
};

function VertexController(vertices) {
    this.vertices = vertices;
    ForkController.ForkController.prototype.init.call(
        this,
        this.vertices
    );
    this.subGraphController = SubGraphController.withVertices(
        this.vertices
    );
}

VertexController.prototype = new ForkController.ForkController();

VertexController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned() && !this.model().isPristine();
};

VertexController.prototype.addChild = function (index, isToTheLeft) {
    let promise = this.model().isCenter ? Promise.resolve() : this.expand(true, true);
    return promise.then(() => {
        let addTuple = ForkService.addTuple(
            this.model()
        );
        let triple = addTuple.optimistic;
        this.model().addChild(
            triple.edge,
            isToTheLeft,
            index
        );
        this.model().refreshChildren(true);
        CurrentSubGraph.get().add(triple.edge);
        Vue.nextTick(async () => {
            GraphElementService.changeChildrenIndex(
                this.model()
            );
            Selection.setToSingle(triple.destination);
            triple.destination.focus();
        });
        if (ShareLevel.PRIVATE === this.model().model().getShareLevel()) {
            triple.destination.setShareLevel(ShareLevel.PRIVATE);
        } else {
            //not returning promise to allow faster process
            addTuple.promise.then(() => {
                triple.destination.controller().setShareLevelDo(
                    this.model().getShareLevel()
                );
            });
        }
        addTuple.promise.catch(() => {
            triple.destination.remove();
        });
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
    return Promise.all(promises).then(async () => {
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
    LoadingFlow.enter();
    let parentRelation = this.model().getParentBubble();
    let children = this.model().getClosestChildrenOfType(GraphElementType.Relation);
    parentRelation.setLabel(this.model().getLabel());
    parentRelation = await children[0].controller().moveUnderParent(parentRelation);

    let l = 1;
    while (l < children.length) {
        let childRelation = children[l];
        //using await and not Promise.all to make sure children order is kept
        await childRelation.controller().moveUnderParent(
            parentRelation
        );
        l++;
    }
    return this.removeDo(true).then(() => {
        Selection.setToSingle(parentRelation);
        GraphElementService.changeChildrenIndex(parentRelation.getParentVertex());
        LoadingFlow.leave();
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

VertexController.prototype.becomeExParent = async function () {
    GraphElementService.changeChildrenIndex(this.model());
}

VertexController.prototype.becomeParent = async function (child, preventAnimation, forceLeft) {
    let movedEdge = child.isVertexType() ? child.getParentBubble() : child;
    if (movedEdge.getParentFork().getUri() === this.model().getUri() && (this.model().isCenter && forceLeft !== undefined && forceLeft === child.isToTheLeft())) {
        return;
    }
    let movedEdgeParentBubble = movedEdge.getParentBubble();
    if (movedEdge.getParentFork().getUri() === this.model().getUri()) {
        movedEdge.moveToParent(
            this.model(),
            forceLeft,
            preventAnimation
        );
    }
    if (movedEdge.getParentFork().getUri() !== this.model().getUri()) {
        await movedEdge.controller().replaceParentFork(
            this.model(),
            true
        );
        movedEdge.moveToParent(
            this.model(),
            undefined,
            preventAnimation
        );
        await movedEdgeParentBubble.controller().becomeExParent(movedEdge);
    }
    this.model().refreshChildren(true);
    await Vue.nextTick();
    GraphElementService.changeChildrenIndex(this.model());
};

VertexController.prototype.copyCanDo = function () {
    return this.isSingle() && !this.model().isLabelEmpty();
};

VertexController.prototype.copy = function () {

};


VertexController.prototype.convertToDistantBubbleWithUriCanDo = function (distantVertexUri) {
    if (!IdUri.isGraphElementUriOwnedByCurrentUser(distantVertexUri)) {
        return false;
    }
    if (!IdUri.isVertexUri(distantVertexUri)) {
        return false;
    }
    let parent = this.getUi().getParentVertex();
    return [parent].concat(parent.getClosestChildVertices()).every((child) => {
        return child.getUri() !== distantVertexUri;
    });
};

VertexController.prototype.convertToDistantBubbleWithUri = async function (distantVertexUri, bubbleToReplace, keptColor) {
    if (!this.convertToDistantBubbleWithUriCanDo(distantVertexUri)) {
        return Promise.reject();
    }
    await Selection.removeAll();
    bubbleToReplace = bubbleToReplace || this.model();
    if (bubbleToReplace.isAncestor(this.model())) {
        bubbleToReplace = CurrentSubGraph.get().getHavingUri(this.model().getUri());
    }
    let beforeConverted = this.model();
    let converted;
    let distantVertex = CurrentSubGraph.get().getHavingUri(distantVertexUri);
    if (distantVertex) {
        converted = distantVertex.clone();
    } else {
        converted = this.model().clone();
    }
    converted.setUri(distantVertexUri);
    beforeConverted.resetChildren(true);
    beforeConverted.expand();
    let isCenter = beforeConverted.isCenter;
    let beforeMergeLabel = beforeConverted.getLabel();
    let beforeMergeComment = beforeConverted.getComment();
    let isFontDefined = beforeConverted.isFontDefined();
    let mergeService = beforeConverted.isMeta() ? TagVertexService.mergeTo : VertexService.mergeTo;
    await mergeService(beforeConverted, distantVertexUri);
    beforeConverted.loading = true;
    let uriBefore = beforeConverted.getUri();
    if (isCenter) {
        converted.parentBubble = this.model();
        converted.parentVertex = this.model();
    } else {
        converted.parentBubble = bubbleToReplace.getParentBubble();
        converted.parentVertex = bubbleToReplace.getParentVertex();
        bubbleToReplace.getParentBubble().replaceChild(
            bubbleToReplace,
            converted
        );
    }
    converted = await converted.controller().getSubGraphController().loadForParentIsAlreadyOnMap();
    let promises = [];
    if (beforeMergeLabel.toLowerCase().trim() !== converted.getLabel().toLowerCase().trim()) {
        let concatenatedLabel = beforeMergeLabel + " " + converted.getLabel();
        if (concatenatedLabel !== converted.getLabel()) {
            promises.push(
                converted.controller().setLabel(
                    concatenatedLabel
                )
            );
        }
    }
    if (beforeMergeComment.toLowerCase().trim() !== converted.getComment().toLowerCase().trim()) {
        let concatenatedComment = beforeMergeComment + " " + converted.getComment();
        if (concatenatedComment !== converted.getComment()) {
            promises.push(
                converted.controller().noteDo(
                    concatenatedComment
                )
            );
        }
    }
    if (keptColor && converted.getBackgroundColor() !== keptColor) {
        promises.push(
            converted.controller().setBackgroundColor(
                keptColor
            )
        );
    }
    if (isFontDefined && !converted.isFontDefined()) {
        promises.push(
            VertexService.saveFont(
                converted.getUri(),
                converted.getFont()
            )
        );
    }
    promises.push(
        GraphElementService.changeChildrenIndex(
            converted.getParentVertex()
        )
    );
    promises.push(
        GraphElementService.changeChildrenIndex(
            converted
        )
    );
    if (beforeConverted.isMeta()) {
        CurrentSubGraph.get().getGraphElements().forEach((graphElement) => {
            graphElement.getIdentifiers().forEach((tag) => {
                if (tag.getUri() === uriBefore) {
                    tag.setUri(distantVertexUri)
                }
            });
        })
    } else {
        beforeConverted.getDuplicates().forEach((duplicate) => {
            if (converted.getId() === duplicate.getId()) {
                return;
            }
            duplicate.setUri(distantVertexUri);
            duplicate.resetChildren();
            duplicate.setLabel(converted.getLabel());
            duplicate.setComment(converted.getComment());
            duplicate.setBackgroundColor(converted.getBackgroundColor());
        });
    }
    converted.loading = false;
    converted.refreshChildren();
    if (isCenter) {
        await Promise.all(promises);
        if (IdUri.getGraphElementUriInUrl() === converted.getUri()) {
            Store.dispatch("centerRefresh");
            return 'isRefreshing';
        } else {
            await router.push({
                name: "Center",
                params: {
                    username: converted.uri().getOwner(),
                    graphElementType: converted.getGraphElementType(),
                    centerUri: converted.uri().getGraphElementShortId()
                }
            });
        }
    }
    CurrentSubGraph.get().rebuild();
    if (CurrentSubGraph.get().component) {
        CurrentSubGraph.get().component.refreshChildren();
    }
    Selection.setToSingle(converted);
};

VertexController.prototype.mergeCanDo = function () {
    return this.isSingle() && this.isOwned() && !Store.state.isPatternFlow
};

VertexController.prototype.merge = function () {
    Store.dispatch("setIsMergeFlow", true);
    return Promise.resolve();
};

VertexController.prototype.getSubGraphController = function () {
    return this.subGraphController;
};

api.VertexController = VertexController;

export default api;
