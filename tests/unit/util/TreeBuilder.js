import SubGraph from '@/graph/SubGraph'
function TreeBuilder(wrapper) {
    this.wrapper = wrapper;
}

TreeBuilder.prototype.build = function () {
    if (this._tree === undefined) {
        this._tree = makeTree(
            context.getGraph(),
            context.getCenterBubbleUri()
        );
    }
    return this._tree;
};


TreeBuilder.prototype.getBubbleWithLabelInTree = function (label) {
    return this._findUsingBubbleSelectorAndLabel(
        ".bubble",
        label
    );
};


TreeBuilder.prototype.getRelationWithLabelInTree = function (label) {
    return this._findUsingBubbleSelectorAndLabel(
        ".relation",
        label
    );
};
TreeBuilder.prototype.getGroupRelationWithLabelInTree = function (label) {
    return this._findUsingBubbleSelectorAndLabel(
        ".group-relation",
        label
    );
};
TreeBuilder.prototype._findUsingBubbleSelectorAndLabel = function (bubbleSelector, label) {
    // let bubbleHtml = this.wrapper.find(bubbleSelector);
    console.log("inside !!!")
    return SubGraph.graph;
    // console.log(bubbleHtml);
    // bubbleHtml.has(
    //     ".bubble-label:contains(" + label + ")"
    // );
    // if (bubbleHtml.length !== 1) {
    //     console.error(
    //         bubbleHtml.length + " bubble(s) found but there should it should be one"
    //     );
    // }
    // return bubbleHtml;
};

export default TreeBuilder;