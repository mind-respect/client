import Scenario from './Scenario'

let MergeAncestorWithDescendant = function () {
    this.dataKey = "mergeAncestorWithDescendant.centerSubGraph";
    return this.init();
};

MergeAncestorWithDescendant.prototype = new Scenario.Scenario();

MergeAncestorWithDescendant.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

MergeAncestorWithDescendant.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

MergeAncestorWithDescendant.prototype.expandA1 = function (a1) {
    return this.expandBubbleWithKey(
        a1,
        "mergeAncestorWithDescendant.a1SubGraph"
    );
};

MergeAncestorWithDescendant.prototype.expandA2 = function (a2) {
    return this.expandBubbleWithKey(
        a2,
        "mergeAncestorWithDescendant.a2SubGraph"
    );
};

MergeAncestorWithDescendant.prototype.expandA21 = function (a21) {
    return this.expandBubbleWithKey(
        a21,
        "mergeAncestorWithDescendant.a21SubGraph"
    );
};

MergeAncestorWithDescendant.prototype.getA21SubGraphAfterMerge = function () {
    return Scenario.getTestData(
        "mergeAncestorWithDescendant.a21SubGraphAfterMerge"
    );
};


export default MergeAncestorWithDescendant;