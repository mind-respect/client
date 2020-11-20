import GraphElementController from '@/graph-element/GraphElementController'
import LoadingFlow from '@/LoadingFlow'
import Vue from "vue";
import GraphElementService from '@/graph-element/GraphElementService'
import Selection from '@/Selection'
import ForkService from "@/fork/ForkService";
import CurrentSubGraph from "@/graph/CurrentSubGraph";
import Store from '@/store'

export default {
    ForkController: ForkController
}

function ForkController(forks) {
    this.forks = forks;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.forks
    );
}

ForkController.prototype = new GraphElementController.GraphElementController();


ForkController.prototype.expand = function (avoidCenter, avoidExpandChild, avoidShowingLoad) {
    if (!this.expandCanDo()) {
        return Promise.resolve();
    }
    if (avoidExpandChild && !this.model().canExpand()) {
        return Promise.resolve();
    }
    if (this.model().isMetaGroupVertex()) {
        this.model().expand();
    }
    let promise = Promise.resolve();
    let isFirstExpand = false;
    if (!avoidShowingLoad) {
        LoadingFlow.enterNoSpinner();
    }
    this.model().loading = false;
    avoidExpandChild = avoidExpandChild || false;
    this.model().beforeExpand();
    if (!this.model().isExpanded) {
        if (!this.model().isCollapsed) {
            isFirstExpand = true;
            promise = this.getSubGraphController().loadForParentIsAlreadyOnMap().then(() => {
                if (avoidExpandChild) {
                    return true;
                }
                let expandChildCalls = [];
                if (this.model().getNumberOfChild() === 1) {
                    expandChildCalls.push(
                        this.model().getClosestChildForks()[0].controller().expand(true, true, true)
                    );
                } else {
                    this.model().getClosestChildForks().filter((childFork) => {
                        return childFork.getNumberOfChild() === 1;
                    }).forEach((childFork) => {
                        expandChildCalls.push(
                            childFork.controller().expand(true, true, true)
                        );
                    });
                }
                return Promise.all(expandChildCalls);
            });
        }
    } else {
        this.model().loading = false;
        promise = avoidExpandChild ? Promise.resolve() : this.expandDescendantsIfApplicable();
    }
    return promise.then(async () => {
        this.model().expand(avoidCenter, isFirstExpand);
        if (!avoidShowingLoad) {
            await Vue.nextTick();
            if (this.model().getNumberOfChild() === 0) {
                /*
                    in case where nb neighbors count is wrong and expand children button appears but clicking on it does nothing
                */
                console.log("wrong nb neighbors. Setting nb neighbors from this.model().buildNbNeighbors()")
                this.model().setNbNeighbors(
                    this.model().buildNbNeighbors()
                );
                GraphElementService.setNbNeighbors(this.model());
            }
            //this.model().refreshChildren() for Store.dispatch("redraw") for when expanding a grand children
            this.model().refreshChildren(true);
            LoadingFlow.leave();
        }
    });
};

ForkController.prototype.addSibling = function (forceUnderParentFork) {
    return this._addSiblingUpOrDown(true, forceUnderParentFork);
};

ForkController.prototype.addSiblingUp = function (forceUnderParentFork) {
    return this._addSiblingUpOrDown(false, forceUnderParentFork);
};

ForkController.prototype._addSiblingUpOrDown = function (isDown, forceUnderParentFork) {
    if (this.model().isCenter) {
        return this.addChild();
    }
    let parent = this.model().getParentBubble();
    if (forceUnderParentFork || (parent.isRelation() && (parent.isPristine() || parent.isLabelSameAsParentGroupRelation()))) {
        parent = parent.getParentBubble();
    }
    const indexInTree = parent.isRelation() && parent.shouldShow() ? 0 : this.model().getIndexInTree();
    return parent.controller().addChild(
        indexInTree + (isDown ? 1 : 0),
        this.model().isToTheLeft()
    );
};

ForkController.prototype.addParentCanDo = function () {
    return this.isSingleAndOwned() && !this.model().isCenter && !this.model().getParentBubble().isMeta();
};

ForkController.prototype.addParent = async function () {
    let parentFork = this.model().getParentFork();
    let addTuple = ForkService.addTuple(
        parentFork
    );
    let triple = addTuple.optimistic;
    parentFork.addChild(
        triple.edge,
        this.model().isToTheLeft(),
        this.model().getIndexInTree()
    );
    CurrentSubGraph.get().add(triple.edge);
    let movedEdge = this.model().isVertexType() ? this.model().getParentBubble() : this.model();
    movedEdge.moveToParent(
        triple.destination,
        true,
        this.model().isToTheLeft()
    );
    await addTuple.promise;
    movedEdge.controller().replaceParentFork(
        triple.destination,
        true
    );
    movedEdge.getParentBubble().controller().becomeExParent(movedEdge);
    Selection.setToSingle(triple.destination);
    triple.destination.isNewBubble = true;
    triple.destination.focus();
    GraphElementService.changeChildrenIndex(triple.source);
    GraphElementService.changeChildrenIndex(triple.destination);
};

ForkController.prototype.addExistingToParentFlowCanDo = function () {
    return this.isSingleAndOwned();
};

ForkController.prototype.addExistingToParentFlow = function () {
    const model = this.model();
    return Store.dispatch("setAddExistingToParent", {
        uri: model.getUri(),
        id: model.getId(),
        graphElementType: model.getGraphElementType()
    });
};