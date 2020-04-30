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

TwoLevelGroupRelationScenario.prototype.expandGroup1 = function (group1) {
    return this.expandBubbleWithKey(
        group1,
        "twoLevelGroupRelation.aroundGroup1"
    );
};

TwoLevelGroupRelationScenario.prototype.expandGroup2 = function (group2) {
    return this.expandBubbleWithKey(
        group2,
        "twoLevelGroupRelation.aroundGroup2"
    );
};

export default TwoLevelGroupRelationScenario;