import Scenario from './Scenario'

let AroundGroup1TagThreeLevelGroupRelationScenario = function () {
    this.dataKey = "threeLevelGroupRelation.aroundGroup1Tag";
    return this.init();
};

AroundGroup1TagThreeLevelGroupRelationScenario.prototype = new Scenario.Scenario();

AroundGroup1TagThreeLevelGroupRelationScenario.prototype.getCenter = function () {
    return this.tagWithLabel("group1");
};

AroundGroup1TagThreeLevelGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.tagWithLabelInTree("group1");
};

export default AroundGroup1TagThreeLevelGroupRelationScenario;