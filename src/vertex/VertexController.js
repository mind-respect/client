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

VertexController.prototype.becomeParent = function (child) {
    let promises = [];
    let movedEdge = child.isVertexType() ? child.getParentBubble : child;
    if (movedEdge.getParentFork().getUri() !== this.model().getUri()) {
        promises.push(
            movedEdge.controller().replaceParentFork(
                this.model(),
                true
            )
        );
        promises.push(
            movedEdge.getParentBubble().controller().becomeExParent(movedEdge, this.model())
        );
    }
    return Promise.all(promises).then(() => {
        movedEdge.moveToParent(
            this.model()
        );
        this.model().refreshChildren(true);
        Vue.nextTick(() => {
            GraphElementService.changeChildrenIndex(this.model());
        });
    });
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
    let grandParent = parent.getParentVertex();
    if (distantVertexUri === grandParent.getUri()) {
        return false;
    }
    let alreadyChildOfParent = parent.getClosestChildVertices().some((child) => {
        return child.getUri() === distantVertexUri;
    });
    return !alreadyChildOfParent;
};

VertexController.prototype.convertToDistantBubbleWithUri = async function (distantVertexUri, bubbleToReplace, keptColor) {
    if (!this.convertToDistantBubbleWithUriCanDo(distantVertexUri)) {
        return Promise.reject();
    }
    bubbleToReplace = bubbleToReplace || this.model();
    let isCenter = this.model().isCenter || bubbleToReplace.isCenter;
    let beforeMergeLabel = this.model().getLabel();
    let beforeMergeComment = this.model().getComment();
    let isFontDefined = this.model().isFontDefined();
    let mergeService = this.model().isMeta() ? TagVertexService.mergeTo : VertexService.mergeTo;
    await mergeService(this.model(), distantVertexUri);
    this.model().loading = true;
    this.model().resetChildren(true);
    this.model().expand();
    let modelUri = this.model().getUri();
    if (this.model().isMeta()) {
        CurrentSubGraph.get().getGraphElements().forEach((graphElement) => {
            graphElement.getIdentifiers().forEach((tag) => {
                if (tag.getUri() === modelUri) {
                    tag.setUri(distantVertexUri)
                }
            });
        })
    } else {
        this.model().getDuplicates().forEach((duplicate) => {
            duplicate.setUri(distantVertexUri);
        });
    }
    this.model().setUri(distantVertexUri);
    if (bubbleToReplace.getId() === this.model().getId()) {
        CurrentSubGraph.get().add(this.model());
    } else {
        if (isCenter) {
            this.model().parentBubble = this.model();
            this.model().parentVertex = this.model();
        } else {
            this.model().parentBubble = bubbleToReplace.getParentBubble();
            this.model().parentVertex = bubbleToReplace.getParentBubble().parentVertex;
            bubbleToReplace.getParentBubble().replaceChild(
                bubbleToReplace,
                this.model()
            );
        }
        CurrentSubGraph.get().replaceGraphElement(
            bubbleToReplace,
            this.model()
        );
    }
    let mergedWith = await this.getSubGraphController().loadForParentIsAlreadyOnMap();
    let promises = [];
    if (beforeMergeLabel.toLowerCase().trim() !== mergedWith.getLabel().toLowerCase().trim()) {
        let concatenatedLabel = beforeMergeLabel + " " + mergedWith.getLabel();
        if (concatenatedLabel !== mergedWith.getLabel()) {
            promises.push(
                this.setLabel(
                    concatenatedLabel
                )
            );
        }
    }
    if (beforeMergeComment.toLowerCase().trim() !== mergedWith.getComment().toLowerCase().trim()) {
        let concatenatedComment = beforeMergeComment + " " + mergedWith.getComment();
        if (concatenatedComment !== mergedWith.getComment()) {
            promises.push(
                this.noteDo(
                    concatenatedComment
                )
            );
        }
    }
    if (keptColor && mergedWith.getBackgroundColor() !== keptColor) {
        promises.push(
            mergedWith.controller().setBackgroundColor(
                keptColor
            )
        );
    }
    if (isFontDefined && !mergedWith.isFontDefined()) {
        promises.push(
            VertexService.saveFont(
                mergedWith.getUri(),
                this.model().getFont()
            )
        );
    }
    promises.push(
        GraphElementService.changeChildrenIndex(
            this.model().getParentVertex()
        )
    );
    this.model().loading = false;
    this.model().refreshChildren();
    if (isCenter) {
        await Promise.all(promises);
        if (IdUri.getGraphElementUriInUrl() === mergedWith.getUri()) {
            Store.dispatch("centerRefresh");
            return 'isRefreshing';
        } else {
            router.push({
                name: "Center",
                params: {
                    username: mergedWith.uri().getOwner(),
                    graphElementType: mergedWith.getGraphElementType(),
                    centerUri: mergedWith.uri().getGraphElementShortId()
                }
            });
        }
    }
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
