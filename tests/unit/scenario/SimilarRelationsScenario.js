import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let SimilarRelationsScenario = function () {
    this.dataKey = "similarRelations.graph";
    return this.init();
};

SimilarRelationsScenario.prototype = new Scenario.Scenario();
SimilarRelationsScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("me");
};

SimilarRelationsScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("me");
};

SimilarRelationsScenario.prototype.getCenterBubbleUri = function () {
    return this.vertexWithLabelInServerGraph("me").uri().getUri();
};

SimilarRelationsScenario.prototype.getPossession = function () {
    return this.relationTagWithLabel(
        "Possession"
    );
};
SimilarRelationsScenario.prototype.getPossessionGroupRelation = function () {
    return TestUtil.getChildWithLabelAndType(
        this.getCenterInTree(),
        "Possession",
        GraphElementType.GroupRelation
    );
};

SimilarRelationsScenario.prototype.getBook1 = function () {
    return this.vertexWithLabelInServerGraph("book 1");
};

SimilarRelationsScenario.prototype.getBook2 = function () {
    return this.vertexWithLabelInServerGraph("book 2");

};

SimilarRelationsScenario.prototype.getRelationWithBook1InTree = function () {
    return this.getRelationWithLabelInTree(
        "Possession of book 1"
    );
};
SimilarRelationsScenario.prototype.getRelationWithBook2InTree = function () {
    return this.getRelationWithLabelInTree(
        "Possessed by book 2"
    );
};
SimilarRelationsScenario.prototype.getOtherRelation = function () {
    return this.edgeWithLabelInServerGraph(
        "other relation"
    );
};
SimilarRelationsScenario.prototype.getOtherRelationInTree = function () {
    return this.getRelationWithLabelInTree(
        "other relation"
    );
};

export default SimilarRelationsScenario