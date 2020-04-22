import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";
import ThreeScenario from "./ThreeScenario";

let ThreeLevelGroupRelationScenario = function () {
    this.dataKey = "threeLevelGroupRelation.getGraph";
    return this.init();
};

ThreeLevelGroupRelationScenario.prototype = new Scenario.Scenario();

ThreeLevelGroupRelationScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

ThreeLevelGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

ThreeLevelGroupRelationScenario.prototype.expandGroup1 = function (group1) {
    return this.expandBubbleWithKey(
        group1,
        "threeLevelGroupRelation.aroundGroup1"
    );
};

ThreeLevelGroupRelationScenario.prototype.expandGroup2 = function (group2) {
    return this.expandBubbleWithKey(
        group2,
        "threeLevelGroupRelation.aroundGroup2"
    );
};

ThreeLevelGroupRelationScenario.prototype.expandGroup3 = function (group3) {
    return this.expandBubbleWithKey(
        group3,
        "threeLevelGroupRelation.aroundGroup3"
    );
};

export default ThreeLevelGroupRelationScenario;