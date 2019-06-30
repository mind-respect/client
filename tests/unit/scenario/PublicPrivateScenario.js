import Scenario from './Scenario'

let PublicPrivateScenario = function () {
    this.dataKey = "publicPrivate";
    return this.init();
};

PublicPrivateScenario.prototype = new Scenario.Scenario();

PublicPrivateScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

PublicPrivateScenario.prototype.getBubble1 = function () {
    return this.getVertexWithLabelInTree("b1");
};

PublicPrivateScenario.prototype.getBubble2 = function () {
    return this.getVertexWithLabelInTree("b2");
};

export default PublicPrivateScenario;