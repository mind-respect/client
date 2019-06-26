import Scenario from "./Scenario";

let DistantGraphScenario = function () {
    this.dataKey = "hiddenGroupRelations.distantBubbleGraph";
    return this.init();
};

DistantGraphScenario.prototype = new Scenario.Scenario();


DistantGraphScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("distant bubble");
};

DistantGraphScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("distant bubble");
};

export default DistantGraphScenario;