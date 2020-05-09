import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let GroupRelationsScenario = function () {
    this.dataKey = "groupRelations.aroundBook1";
    return this.init();
};

GroupRelationsScenario.prototype = new Scenario.Scenario();
GroupRelationsScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("book 1");
};

GroupRelationsScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("book 1");
};

GroupRelationsScenario.prototype.getCenterBubbleUri = function () {
    return this.vertexWithLabelInServerGraph("book 1").uri().getUri();
};


GroupRelationsScenario.prototype.expandPossession = function (possession) {
    return this.expandBubbleWithKey(
        possession,
        "groupRelations.aroundPossessionOfBook1"
    );
};

export default GroupRelationsScenario