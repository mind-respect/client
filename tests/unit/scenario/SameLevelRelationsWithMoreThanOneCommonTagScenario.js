import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let SameLevelRelationsWithMoreThanOneCommonTagScenario = function () {
    this.dataKey = "sameLevelRelationsWithMoreThanOneCommonTag";
    return this.init();
};

SameLevelRelationsWithMoreThanOneCommonTagScenario.prototype = new Scenario.Scenario();

SameLevelRelationsWithMoreThanOneCommonTagScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

SameLevelRelationsWithMoreThanOneCommonTagScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

export default SameLevelRelationsWithMoreThanOneCommonTagScenario