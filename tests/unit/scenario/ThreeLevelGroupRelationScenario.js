import Scenario from './Scenario'

let ThreeLevelGroupRelationScenario = function () {
    this.dataKey = "threeLevelGroupRelation";
    return this.init();
};

ThreeLevelGroupRelationScenario.prototype = new Scenario.Scenario();

ThreeLevelGroupRelationScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

ThreeLevelGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

export default ThreeLevelGroupRelationScenario;