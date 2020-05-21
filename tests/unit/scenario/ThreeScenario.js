import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";

let ThreeScenario = function () {
    this.dataKey = "three.getGraph";
    return this.init();
};

ThreeScenario.prototype = new Scenario.Scenario();

ThreeScenario.prototype.expandBubble2 = function (bubble2) {
    GraphServiceMock.getForCentralBubbleUri(
        this.getSubGraphForB2()
    );
    return bubble2.controller().expand();
};

ThreeScenario.prototype.expandBubble3 = function (bubble3) {
    GraphServiceMock.getForCentralBubbleUri(
        this.getSubGraphForB3()
    );
    return bubble3.controller().expand();
};

ThreeScenario.prototype.getBubble4InTree = function () {
    return this.getVertexWithLabelInTree("b4");
};
ThreeScenario.prototype.getSubGraphForB2 = function () {
    return Scenario.getTestData(
        "three.subGraphForB2"
    );
};
ThreeScenario.prototype.getSubGraphForB3 = function () {
    return Scenario.getTestData(
        "three.subGraphForB3"
    );
};

ThreeScenario.prototype.getB3SubGraphMergedWithB21 = function () {
    return Scenario.getTestData(
        "three.b3SubGraphMergedWithB21"
    );
};



ThreeScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

ThreeScenario.prototype.getCenterBubbleUri = function () {
    return this.vertexWithLabelInServerGraph("b1").getUri();
};

ThreeScenario.prototype.getBubble1 = function () {
    return this.vertexWithLabelInServerGraph("b1")
};
ThreeScenario.prototype.getCenterInTree = ThreeScenario.prototype.getBubble1InTree = function () {
    return this.getVertexWithLabelInTree("b1");
};
ThreeScenario.prototype.getBubble2InTree = function () {
    return this.getVertexWithLabelInTree("b2");
};
ThreeScenario.prototype.getBubble3InTree = function () {
    return this.getVertexWithLabelInTree("b3");
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
    return this.getVertexWithLabelInTree("b1");
};


export default ThreeScenario