import Scenario from './Scenario'

let RelationWithMultipleTagsScenario = function () {
    this.dataKey = "relationWithMultipleTags";
    return this.init();
};

RelationWithMultipleTagsScenario.prototype = new Scenario.Scenario();

RelationWithMultipleTagsScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("Team");
};

RelationWithMultipleTagsScenario.prototype.getCenterBubble = function () {
    return this.getVertexWithLabelInTree("Team");
};

RelationWithMultipleTagsScenario.prototype.getCenterBubbleUri = function () {
    return this.getCenter().getUri();
};

RelationWithMultipleTagsScenario.prototype.getComputerScientistRelation = function() {
    return this.getRelationWithLabelInTree("computer scientist");
};

export default RelationWithMultipleTagsScenario;