import Scenario from './Scenario'

let RelationWithMultipleIdentifiersScenario = function () {
    this.dataKey = "relationWithMultipleIdentifiers";
    return this.init();
};

RelationWithMultipleIdentifiersScenario.prototype = new Scenario.Scenario();

RelationWithMultipleIdentifiersScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("Team");
};

RelationWithMultipleIdentifiersScenario.prototype.getCenterBubble = function () {
    return this.getVertexWithLabelInTree("Team");
};

RelationWithMultipleIdentifiersScenario.prototype.getCenterBubbleUri = function () {
    return this.getCenter().getUri();
};

RelationWithMultipleIdentifiersScenario.prototype.getComputerScientistRelation = function() {
    return this.getRelationWithLabelInTree("computer scientist");
};

export default RelationWithMultipleIdentifiersScenario;