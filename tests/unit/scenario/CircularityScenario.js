import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";


let CircularityScenario = function () {
    this.dataKey = "circularity.b1Graph";
    return this.init();
};

CircularityScenario.prototype = new Scenario.Scenario();

CircularityScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

CircularityScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("b1");
};

CircularityScenario.prototype.expandBubble2 = function (bubble2) {
    GraphServiceMock.getForCentralBubbleUri(
        Scenario.getTestData(
            "circularity.b2Graph"
        )
    );
    return bubble2.getController().expand();
};

CircularityScenario.prototype.expandBubble3 = function (bubble3) {
    GraphServiceMock.getForCentralBubbleUri(
        Scenario.getTestData(
            "circularity.b3Graph"
        )
    );
    return bubble3.getController().expand();
};

CircularityScenario.prototype.getBubble1Duplicate = async function () {
    let bubble2 = this.getBubble2InTree();
    await this.expandBubble2(bubble2);
    let bubble3 = bubble2.getNextBubble().getNextBubble();
    await this.expandBubble3(bubble3);
    return bubble3.getNextBubble().getNextBubble();
};


CircularityScenario.prototype.getBubble2InTree = function () {
    return this.getVertexWithLabelInTree(
        "b2"
    );
};

export default CircularityScenario;