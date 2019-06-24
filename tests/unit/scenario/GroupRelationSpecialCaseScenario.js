import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let GroupRelationSpecialCaseScenario = function () {
    this.dataKey = "groupRelationSpecialCase";
    return this.init();
};

GroupRelationSpecialCaseScenario.prototype = new Scenario.Scenario();

GroupRelationSpecialCaseScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

GroupRelationSpecialCaseScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

export default GroupRelationSpecialCaseScenario