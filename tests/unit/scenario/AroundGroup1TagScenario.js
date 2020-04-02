import Scenario from './Scenario'

let AroundGroup1TagScenario = function () {
    this.dataKey = "twoLevelGroupRelation.aroundGroup1";
    return this.init();
};

AroundGroup1TagScenario.prototype = new Scenario.Scenario();

AroundGroup1TagScenario.prototype.getCenter = function () {
    return this.tagWithLabel("group1");
};

AroundGroup1TagScenario.prototype.getCenterInTree = function () {
    return this.tagWithLabelInTree("group1");
};

export default AroundGroup1TagScenario;