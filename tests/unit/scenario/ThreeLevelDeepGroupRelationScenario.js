import Scenario from './Scenario'

let ThreeLevelDeepGroupRelationScenario = function () {
    this.dataKey = "threeLevelDeepGroupRelation";
    return this.init();
};

ThreeLevelDeepGroupRelationScenario.prototype = new Scenario.Scenario();

ThreeLevelDeepGroupRelationScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("fast charging station");
};

ThreeLevelDeepGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("fast charging station");
};

export default ThreeLevelDeepGroupRelationScenario