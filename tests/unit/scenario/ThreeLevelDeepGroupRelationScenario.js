import Scenario from './Scenario'

let ThreeLevelDeepGroupRelationScenario = function () {
    this.dataKey = "threeLevelDeepGroupRelation.fastChargingStationGraph";
    return this.init();
};

ThreeLevelDeepGroupRelationScenario.prototype = new Scenario.Scenario();

ThreeLevelDeepGroupRelationScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("fast charging station");
};

ThreeLevelDeepGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("fast charging station");
};

ThreeLevelDeepGroupRelationScenario.prototype.expandRegion = function (region) {
    return this.expandBubbleWithKey(
        region,
        "threeLevelDeepGroupRelation.aroundRegion"
    );
};

ThreeLevelDeepGroupRelationScenario.prototype.expandRegionA = function (region) {
    return this.expandBubbleWithKey(
        region,
        "threeLevelDeepGroupRelation.aroundSubRegionA"
    );
};

ThreeLevelDeepGroupRelationScenario.prototype.expandRegionB = function (region) {
    return this.expandBubbleWithKey(
        region,
        "threeLevelDeepGroupRelation.aroundSubRegionB"
    );
};

export default ThreeLevelDeepGroupRelationScenario