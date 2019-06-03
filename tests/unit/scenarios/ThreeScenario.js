import Scenario from './Scenario'

let ThreeScenario = function () {
    this.dataKey = "threeBubblesGraph.getGraph";
    return this.init();
};

ThreeScenario.prototype = new Scenario.Scenario();

ThreeScenario.prototype.expandBubble2 = function (bubble2) {
    return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
        bubble2,
        this.getSubGraphForB2()
    );
};

ThreeScenario.prototype.expandBubble3 = function (bubble3) {
    return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
        bubble3,
        this.getSubGraphForB3()
    );
};

ThreeScenario.prototype.getBubble4InTree = function () {
    return this.getBubbleWithLabelInTree("b4");
};
ThreeScenario.prototype.getSubGraphForB2 = function () {
    return Scenario.getTestData(
        "threeBubblesGraph.subGraphForB2"
    );
};
ThreeScenario.prototype.getSubGraphForB3 = function () {
    return Scenario.getTestData(
        "threeBubblesGraph.subGraphForB3"
    );
};

ThreeScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

ThreeScenario.prototype.getCenterBubbleUri = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

ThreeScenario.prototype.getR1Uri = function () {
    return uriOfEdgeWithLabel(this.getGraph(), "r1");
};
ThreeScenario.prototype.getBubble1 = function () {
    return this.vertexWithLabelInServerGraph("b1")
};
ThreeScenario.prototype.getBubble1InTree = function () {
    return this.getBubbleWithLabelInTree("b1");
};
ThreeScenario.prototype.getBubble2InTree = function () {
    return this.getBubbleWithLabelInTree("b2");
};
ThreeScenario.prototype.getBubble3InTree = function () {
    return this.getBubbleWithLabelInTree("b3");
};
ThreeScenario.prototype.getRelation1InTree = function () {
    return this.getRelationWithLabelInTree(
        "r1"
    );
};
ThreeScenario.prototype.getBubble1Ui = function () {
    // return new VertexUiBuilder.VertexUiBuilder().create(
    //     this.getBubble1()
    // );
};
ThreeScenario.prototype.getBubble2 = function () {
    return this.vertexWithLabelInServerGraph("b2")
};

ThreeScenario.prototype.getCenterBubbleInTree = function () {
    return this.getBubbleWithLabelInTree("b1");
};


export default ThreeScenario