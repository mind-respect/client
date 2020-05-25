import Scenario from './Scenario'

let MergeCentersOtoScenario = function () {
    this.dataKey = "mergeCenters.oto1Subgraph";
    return this.init();
};

MergeCentersOtoScenario.prototype = new Scenario.Scenario();

MergeCentersOtoScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("oto 1");
};

MergeCentersOtoScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("oto 1");
};

MergeCentersOtoScenario.prototype.getGraphAfterMergeWithUrlu = function () {
    return Scenario.getTestData(
        "mergeCenters.oto1AfterMerge"
    );
};

export default MergeCentersOtoScenario;