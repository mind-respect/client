import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";
import ThreeScenario from "./ThreeScenario";

let ThreeScenarioB2Center = function () {
    this.dataKey = "three.subGraphForB2";
    return this.init();
};

ThreeScenarioB2Center.prototype = new Scenario.Scenario();

ThreeScenarioB2Center.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b2");
};
ThreeScenarioB2Center.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("b2");
};

ThreeScenarioB2Center.prototype.expandBubble1 = function (bubble1) {
    GraphServiceMock.getForCentralBubbleUri(
        Scenario.getTestData(
            "three.getGraph"
        )
    );
    return bubble1.controller().expand(true, true);
};

export default ThreeScenarioB2Center