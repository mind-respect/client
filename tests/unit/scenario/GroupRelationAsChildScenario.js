import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";
import Center1MergeTwoChildHavingChildrenScenario from "./Center1MergeTwoChildHavingChildrenScenario";

let GroupRelationAsChildScenario = function () {
    this.dataKey = "groupRelationAsChild.graph";
    return this.init();
};

GroupRelationAsChildScenario.prototype = new Scenario.Scenario();

GroupRelationAsChildScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center");
};

GroupRelationAsChildScenario.prototype.getCenterBubbleUri = function () {
    return this.getCenter().getUri();
};

GroupRelationAsChildScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center");
};

GroupRelationAsChildScenario.prototype.expandGroupRelation = function (groupRelation) {
    GraphServiceMock.getForCentralBubbleUri(
        Scenario.getTestData(
            "groupRelationAsChild.aroundGroupRelation"
        )
    );
    return groupRelation.controller().expand(true, true, true);
};

export default GroupRelationAsChildScenario;