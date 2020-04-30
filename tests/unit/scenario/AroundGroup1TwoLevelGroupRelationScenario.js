import Scenario from './Scenario'

let AroundGroup1TwoLevelGroupRelationScenario = function () {
    this.dataKey = "twoLevelGroupRelation.aroundGroup1Tag";
    return this.init();
};

AroundGroup1TwoLevelGroupRelationScenario.prototype = new Scenario.Scenario();

AroundGroup1TwoLevelGroupRelationScenario.prototype.getCenter = function () {
    return this.tagWithLabel("group1");
};

AroundGroup1TwoLevelGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.tagWithLabelInTree("group1");
};

export default AroundGroup1TwoLevelGroupRelationScenario;