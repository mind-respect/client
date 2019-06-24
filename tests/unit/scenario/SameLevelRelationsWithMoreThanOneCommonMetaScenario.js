import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let SameLevelRelationsWithMoreThanOneCommonMetaScenario = function () {
    this.dataKey = "sameLevelRelationsWithMoreThanOneCommonMeta";
    return this.init();
};

SameLevelRelationsWithMoreThanOneCommonMetaScenario.prototype = new Scenario.Scenario();

SameLevelRelationsWithMoreThanOneCommonMetaScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

SameLevelRelationsWithMoreThanOneCommonMetaScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

export default SameLevelRelationsWithMoreThanOneCommonMetaScenario