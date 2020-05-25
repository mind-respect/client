import Scenario from './Scenario'

let MergeCentersUrluScenario = function () {
    this.dataKey = "mergeCenters.urlu1Subgraph";
    return this.init();
};

MergeCentersUrluScenario.prototype = new Scenario.Scenario();

MergeCentersUrluScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("urlu 1");
};

MergeCentersUrluScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("urlu 1");
};

export default MergeCentersUrluScenario;