import GraphElementController from '@/graph-element/GraphElementController'
import LoadingFlow from '@/LoadingFlow'
import Vue from "vue";

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
        promise = avoidExpandChild ? Promise.resolve() : this.expandDescendantsIfApplicable();
    }
    return promise.then(async () => {
        this.model().expand(avoidCenter, true);
        if (!avoidShowingLoad) {
            await Vue.nextTick();
            //this.model().refreshChildren() for Store.dispatch("redraw") for when expanding a grand children
            this.model().refreshChildren(true);
            LoadingFlow.leave();
        }
    });
};