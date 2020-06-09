import Scenario from "./Scenario";

let DuplicateScenario = function () {
    this.dataKey = "duplicate.centerGraph";
    return this.init();
};

DuplicateScenario.prototype = new Scenario.Scenario();


DuplicateScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

DuplicateScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

DuplicateScenario.prototype.expandA1 = function (a1) {
    return this.expandBubbleWithKey(a1, "duplicate.a1Graph");
};

DuplicateScenario.prototype.expandA2 = function (a2) {
    return this.expandBubbleWithKey(a2, "duplicate.a2Graph");
};

export default DuplicateScenario;