import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let InverseRelationScenario = function () {
    this.dataKey = "inverseRelation";
    return this.init();
};

InverseRelationScenario.prototype = new Scenario.Scenario();

InverseRelationScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("me");
};

InverseRelationScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("me");
};

export default InverseRelationScenario