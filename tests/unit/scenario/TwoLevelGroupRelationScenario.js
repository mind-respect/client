import Scenario from './Scenario'

let TwoLevelGroupRelationScenario = function () {
    this.dataKey = "twoLevelGroupRelation.getGraph";
    return this.init();
};

TwoLevelGroupRelationScenario.prototype = new Scenario.Scenario();

TwoLevelGroupRelationScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

TwoLevelGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

export default TwoLevelGroupRelationScenario;