import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";

let RelationAsIdentifierScenario = function () {
    this.dataKey = "relationsAsIdentifier.graph";
    return this.init();
};

RelationAsIdentifierScenario.prototype = new Scenario.Scenario();

RelationAsIdentifierScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

RelationAsIdentifierScenario.prototype.getCenterBubbleUri = function () {
    return this.getCenter().getUri();
};

RelationAsIdentifierScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

RelationAsIdentifierScenario.prototype.getB4InTree = function () {
    return this.getVertexWithLabelInTree("b4");
};

export default RelationAsIdentifierScenario;