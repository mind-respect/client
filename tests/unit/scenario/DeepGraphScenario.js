import Scenario from "./Scenario";

let DeepGraphScenario = function () {
    this.dataKey = "deepGraph";
    return this.init();
};

DeepGraphScenario.prototype = new Scenario.Scenario();


DeepGraphScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

DeepGraphScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("b1");
};

export default DeepGraphScenario;