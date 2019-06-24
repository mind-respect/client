import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

let RelationIn2GroupRelationsScenario = function () {
    this.dataKey = "projectSchema.someProjectGraph";
    return this.init();
};

RelationIn2GroupRelationsScenario.prototype = new Scenario.Scenario();

RelationIn2GroupRelationsScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("some project");
};

RelationIn2GroupRelationsScenario.prototype.getSomeProjectInTree = RelationIn2GroupRelationsScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("some project");
};


RelationIn2GroupRelationsScenario.prototype.getImpact3RelationInTheImpactOnTheIndividualContext = function () {
    return TestUtil.getChildWithLabel(
        this.getSomeProjectInTree(),
        "impact 3"
    );
};

RelationIn2GroupRelationsScenario.prototype.getImpact3RelationInTheImpactOnSocietyContext = function () {
    let child = this.getSomeProjectInTree().getNextChildren().filter((child) => {
        if (child.isGroupRelation()) {
            return child;
        }
    });
    return TestUtil.getChildWithLabel(
        child,
        "impact 3"
    );
};

export default RelationIn2GroupRelationsScenario