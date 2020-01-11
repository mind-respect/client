import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";

let RelationAsTagScenario = function () {
    this.dataKey = "relationsAsTag.graph";
    return this.init();
};

RelationAsTagScenario.prototype = new Scenario.Scenario();

RelationAsTagScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

RelationAsTagScenario.prototype.getCenterBubbleUri = function () {
    return this.getCenter().getUri();
};

RelationAsTagScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

RelationAsTagScenario.prototype.getB4InTree = function () {
    return this.getVertexWithLabelInTree("b4");
};

export default RelationAsTagScenario;