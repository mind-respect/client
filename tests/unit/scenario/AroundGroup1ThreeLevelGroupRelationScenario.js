import Scenario from './Scenario'

let AroundGroup1ThreeLevelGroupRelationScenario = function () {
    this.dataKey = "threeLevelGroupRelation.aroundGroup1";
    return this.init();
};

AroundGroup1ThreeLevelGroupRelationScenario.prototype = new Scenario.Scenario();

AroundGroup1ThreeLevelGroupRelationScenario.prototype.getCenter = function () {
    return this.tagWithLabel("group1");
};

AroundGroup1ThreeLevelGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.tagWithLabelInTree("group1");
};

export default AroundGroup1ThreeLevelGroupRelationScenario;