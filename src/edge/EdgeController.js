import GraphElementController from '@/graph-element/GraphElementController'
import EdgeService from '@/edge/EdgeService'


function EdgeController() {
}

EdgeController.prototype = new GraphElementController.GraphElementController();

EdgeController.prototype.init = function (edges) {
    this.edges = edges;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.edges
    );
    return this;
}

EdgeController.prototype.replaceParentFork = async function (newParentFork, preventChangingInModel) {
    if (newParentFork.canExpand()) {
        await newParentFork.controller().expand(true, true, true);
    }
    let edge = this.model();
    let parentFork = edge.getParentFork();
    let newShareLevel = parentFork.getShareLevel();
    let keptShareLevel = edge.isGroupRelation() ? edge.getShareLevel() : edge.getOtherVertex(edge.getParentVertex()).getShareLevel();
    let oldShareLevel = newParentFork.getShareLevel();
    // parentVertex.removeChild(this.getModel());
    if (this.model().isInverse()) {
        await EdgeService.changeDestination(
            newParentFork,
            edge,
            newShareLevel,
            keptShareLevel,
            oldShareLevel
        );
    } else {
        await EdgeService.changeSource(
            newParentFork,
            edge,
            newShareLevel,
            keptShareLevel,
            oldShareLevel
        );
        if (!preventChangingInModel) {
            this.model().replaceRelatedVertex(parentFork, newParentFork);
        }
        // this.getModel().parentBubble = newParentVertex;
        // this.getModel().parentVertex = newParentVertex;
        // newParentVertex.addChild(this.getModel());
    }
};
export default EdgeController;