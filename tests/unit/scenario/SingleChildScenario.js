import Scenario from './Scenario'

let SingleChildScenario = function () {
    this.dataKey = "three.subGraphForParent";
    return this.init();
};

SingleChildScenario.prototype = new Scenario.Scenario();

SingleChildScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("parent");
};

SingleChildScenario.prototype.getCenterBubbleUri = function () {
    return this.vertexWithLabelInServerGraph("parent");
};

SingleChildScenario.prototype.getParentInTree = function () {
    return this.getVertexWithLabelInTree("parent");
};

SingleChildScenario.prototype.getB1RelatedToParentGraph = function () {
    return Scenario.getTestData(
        "three.subGraphOfB1RelatedToParent"
    );
};

SingleChildScenario.prototype.getSubGraphOfB1OnceMergedWithSingleChild = function () {
    return Scenario.getTestData(
        "three.subGraphOfB1OnceMergedWithSingleChild"
    );
};
SingleChildScenario.prototype.getB1Uri = function () {
    return this.vertexWithLabelInServerGraph("b1", this.getB1RelatedToParentGraph()).getUri();
};

export default SingleChildScenario