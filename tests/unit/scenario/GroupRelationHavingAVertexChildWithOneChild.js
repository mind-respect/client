import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";

let GroupRelationHavingAVertexChildWithOneChild = function () {
    this.dataKey = "hiddenGroupRelations.b2Graph";
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
        "hiddenGroupRelations.shirt2Graph"
    );
};
GroupRelationHavingAVertexChildWithOneChild.prototype.getShirt2VertexUri = function () {
    return Scenario.getTestData(
        "hiddenGroupRelations.shirt2BubbleUri"
    );
};

GroupRelationHavingAVertexChildWithOneChild.prototype.expandTShirtGroupRelation = function (tShirtGroupRelation) {
    let multiple = {};
    multiple[tShirtGroupRelation.getUri()] =  Scenario.getTestData("hiddenGroupRelations.tShirtGroupRelationGraph");
    multiple[this.getShirt2VertexUri()] = this.getShirt2Graph();
    GraphServiceMock.getForCentralBubbleUriMultiple(multiple);
    return tShirtGroupRelation.controller().expand();
};

export default GroupRelationHavingAVertexChildWithOneChild;