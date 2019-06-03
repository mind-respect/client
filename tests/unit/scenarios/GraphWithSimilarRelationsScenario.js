import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let GraphWithSimilarRelationsScenario = function () {
    this.dataKey = "graphWithSimilarRelations.graph";
    return this.init();
};

GraphWithSimilarRelationsScenario.prototype = new Scenario.Scenario();
GraphWithSimilarRelationsScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("me");
};

GraphWithSimilarRelationsScenario.prototype.getCenterVertexInTree = function () {
    return this.getBubbleWithLabelInTree("me");
};

GraphWithSimilarRelationsScenario.prototype.getCenterBubbleUri = function () {
    return this.vertexWithLabelInServerGraph("me").uri().getUri();
};

GraphWithSimilarRelationsScenario.prototype.getPossession = function () {
    return this.relationTagWithLabel(
        "Possession"
    );
};
GraphWithSimilarRelationsScenario.prototype.getPossessionAsGroupRelation = function () {
    return TestUtil.getChildWithLabelAndType(
        this.getCenterVertexInTree(),
        "Possession",
        GraphElementType.GroupRelation
    );
};

GraphWithSimilarRelationsScenario.prototype.getBook1 = function () {
    return this.vertexWithLabelInServerGraph("book 1");
};

GraphWithSimilarRelationsScenario.prototype.getBook2 = function () {
    return this.vertexWithLabelInServerGraph("book 2");

};

GraphWithSimilarRelationsScenario.prototype.getRelationWithBook1InTree = function () {
    return this.getRelationWithLabelInTree(
        "Possession of book 1"
    );
};
GraphWithSimilarRelationsScenario.prototype.getRelationWithBook2InTree = function () {
    return this.getRelationWithLabelInTree(
        "Possessed by book 2"
    );
};
GraphWithSimilarRelationsScenario.prototype.getOtherRelation = function () {
    return this.edgeWithLabelInServerGraph(
        "other relation"
    );
};
GraphWithSimilarRelationsScenario.prototype.getOtherRelationInTree = function () {
    return this.getRelationWithLabelInTree(
        "other relation"
    );
};

export default GraphWithSimilarRelationsScenario