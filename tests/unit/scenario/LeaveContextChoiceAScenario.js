import Scenario from './Scenario'

let LeaveContextChoiceAScenario = function () {
    this.dataKey = "leaveContext.choiceACenter";
    return this.init();
};

LeaveContextChoiceAScenario.prototype = new Scenario.Scenario();

LeaveContextChoiceAScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("choice a");
};

LeaveContextChoiceAScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("choice a");
};

export default LeaveContextChoiceAScenario;