import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let GroupRelationsScenario = function () {
    this.dataKey = "groupRelations.graph";
    return this.init();
};

GroupRelationsScenario.prototype = new Scenario.Scenario();
GroupRelationsScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("me");
};

GroupRelationsScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("me");
};

GroupRelationsScenario.prototype.getCenterBubbleUri = function () {
    return this.vertexWithLabelInServerGraph("me").uri().getUri();
};

GroupRelationsScenario.prototype.getPossession = function () {
    return this.relationTagWithLabel(
        "Possession"
    );
};
GroupRelationsScenario.prototype.getPossessionGroupRelation = function () {
    return TestUtil.getChildWithLabelAndType(
        this.getCenterInTree(),
        "Possession",
        GraphElementType.GroupRelation
    );
};

GroupRelationsScenario.prototype.getBook1 = function () {
    return this.vertexWithLabelInServerGraph("book 1");
};

GroupRelationsScenario.prototype.getBook2 = function () {
    return this.vertexWithLabelInServerGraph("book 2");

};

GroupRelationsScenario.prototype.getRelationWithBook1InTree = function () {
    return this.getRelationWithLabelInTree(
        "Possession of book 1"
    );
};
GroupRelationsScenario.prototype.getRelationWithBook2InTree = function () {
    return this.getRelationWithLabelInTree(
        "Possessed by book 2"
    );
};
GroupRelationsScenario.prototype.getOtherRelation = function () {
    return this.edgeWithLabelInServerGraph(
        "other relation"
    );
};
GroupRelationsScenario.prototype.getOtherRelationInTree = function () {
    return this.getRelationWithLabelInTree(
        "other relation"
    );
};
GroupRelationsScenario.prototype.expandPossession = function (possession) {
    return this.expandBubbleWithKey(
        possession,
        "groupRelations.aroundPossessionOfBook1"
    );
};

GroupRelationsScenario.prototype.expandPossession3 = function (possession) {
    return this.expandBubbleWithKey(
        possession,
        "groupRelations.aroundPossessionOfBook3"
    );
};

export default GroupRelationsScenario