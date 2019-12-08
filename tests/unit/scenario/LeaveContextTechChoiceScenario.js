import Scenario from './Scenario'

let LeaveContextTechChoiceScenario = function () {
    this.dataKey = "leaveContext.techChoiceCenter";
    return this.init();
};

LeaveContextTechChoiceScenario.prototype = new Scenario.Scenario();

LeaveContextTechChoiceScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("tech choice");
};

LeaveContextTechChoiceScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("tech choice");
};

export default LeaveContextTechChoiceScenario;