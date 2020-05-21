import Scenario from './Scenario'

let MergeDescendantWithAncestor = function () {
    this.dataKey = "mergeDescendantWithAncestor.centerSubGraph";
    return this.init();
};

MergeDescendantWithAncestor.prototype = new Scenario.Scenario();

MergeDescendantWithAncestor.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

MergeDescendantWithAncestor.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

MergeDescendantWithAncestor.prototype.expandA1 = function (a1) {
    return this.expandBubbleWithKey(
        a1,
        "mergeDescendantWithAncestor.a1SubGraph"
    );
};

MergeDescendantWithAncestor.prototype.expandA2 = function (a2) {
    return this.expandBubbleWithKey(
        a2,
        "mergeDescendantWithAncestor.a2SubGraph"
    );
};

MergeDescendantWithAncestor.prototype.expandA21 = function (a21) {
    return this.expandBubbleWithKey(
        a21,
        "mergeDescendantWithAncestor.a21SubGraph"
    );
};

MergeDescendantWithAncestor.prototype.getA1SubGraphAfterMerge = function () {
    return Scenario.getTestData(
        "mergeDescendantWithAncestor.a1SubGraphAfterMerge"
    );
};


export default MergeDescendantWithAncestor;