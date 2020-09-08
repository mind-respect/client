import GraphElementController from '@/graph-element/GraphElementController'
import LoadingFlow from '@/LoadingFlow'
import Vue from "vue";
import GraphElementService from '@/graph-element/GraphElementService'
import GraphElementType from '@/graph-element/GraphElementType'

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
    if (!avoidShowingLoad) {
        LoadingFlow.enterNoSpinner();
    }
    this.model().loading = false;
    avoidExpandChild = avoidExpandChild || false;
    this.model().beforeExpand();
    if (!this.model().isExpanded) {
        if (!this.model().isCollapsed) {
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
        this.model().expand(avoidCenter, true);
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

ForkController.prototype.addSibling = function () {
    return this._addSiblingUpOrDown(true);
};

ForkController.prototype.addSiblingUp = function () {
    return this._addSiblingUpOrDown(false);
};

ForkController.prototype._addSiblingUpOrDown = function (isDown) {
    let parent = this.model().getParentBubble();
    if (parent.isRelation() && (parent.isPristine() || parent.isLabelSameAsParentGroupRelation())) {
        parent = parent.getParentBubble();
    }
    return parent.controller().addChild(
        this.model().getIndexInTree() + (isDown ? 1 : 0),
        this.model().isToTheLeft()
    );
};