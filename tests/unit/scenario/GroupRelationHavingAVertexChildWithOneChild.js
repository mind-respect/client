import Scenario from './Scenario'

let GroupRelationHavingAVertexChildWithOneChild = function () {
    this.dataKey = "graphWithHiddenSimilarRelations.b2Graph";
    return this.init();
};


GroupRelationHavingAVertexChildWithOneChild.prototype = new Scenario.Scenario();

GroupRelationHavingAVertexChildWithOneChild.prototype.getBubble2InTree = function () {
    return this.getVertexWithLabelInTree("b2");
};

GroupRelationHavingAVertexChildWithOneChild.prototype.getTshirtGroupRelationInTree = function () {
    return this.getGroupRelationWithLabelInTree("T-shirt");
};

GroupRelationHavingAVertexChildWithOneChild.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b2");
};

GroupRelationHavingAVertexChildWithOneChild.prototype.getCenterBubbleUri = function () {
    return this.getCenter().uri().getUri();
};
GroupRelationHavingAVertexChildWithOneChild.prototype.getShirt2Graph = function () {
    return Scenario.getTestData(
        "graphWithHiddenSimilarRelations.shirt2Graph"
    );
};
GroupRelationHavingAVertexChildWithOneChild.prototype.getShirt2VertexUri = function () {
    return Scenario.getTestData(
        "graphWithHiddenSimilarRelations.shirt2BubbleUri"
    );
};

export default GroupRelationHavingAVertexChildWithOneChild;