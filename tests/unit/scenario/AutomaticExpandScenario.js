import Scenario from './Scenario'

let AutomaticExpandScenario = function () {
    this.dataKey = "automaticExpand.centerGraph";
    return this.init();
};

AutomaticExpandScenario.prototype = new Scenario.Scenario();

AutomaticExpandScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

AutomaticExpandScenario.prototype.getCenterBubbleUri = function () {
    return this.vertexWithLabelInServerGraph("b1").getUri()
};

AutomaticExpandScenario.prototype.getB1InTree = function () {
    return this.getBubbleWithLabelInTree("b1");
};

AutomaticExpandScenario.prototype.getB3InTree = function () {
    return this.getBubbleWithLabelInTree("b3");
};

AutomaticExpandScenario.prototype.getB2SubGraph = function () {
    return Scenario.getTestData(
        "automaticExpand.b2SubGraph"
    );
};

AutomaticExpandScenario.prototype.getB3SubGraph = function () {
    return Scenario.getTestData(
        "automaticExpand.b3SubGraph"
    );
};

AutomaticExpandScenario.prototype.getB31SubGraph = function () {
    return Scenario.getTestData(
        "automaticExpand.b31SubGraph"
    );
};

AutomaticExpandScenario.prototype.getB31Uri = function () {
    return this.vertexWithLabelInServerGraph("b31", this.getB31SubGraph()).getUri();
};

export default AutomaticExpandScenario