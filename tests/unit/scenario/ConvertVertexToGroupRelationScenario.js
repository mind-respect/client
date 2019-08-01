import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";

let ConvertVertexToGroupRelationScenario = function () {
    this.dataKey = "convertVertexToGroupRelation.b1Graph";
    return this.init();
};

ConvertVertexToGroupRelationScenario.prototype = new Scenario.Scenario();

ConvertVertexToGroupRelationScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

ConvertVertexToGroupRelationScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("b1");
};

ConvertVertexToGroupRelationScenario.prototype.getBubble1 = function () {
    return this.getVertexWithLabelInTree("b1");
};

ConvertVertexToGroupRelationScenario.prototype.getExpandedB2 = async function () {
    let b2 = this.getVertexWithLabelInTree("b2");
    GraphServiceMock.getForCentralBubbleUri(
        Scenario.getTestData(
            "convertVertexToGroupRelation.b2Graph"
        )
    );
    await b2.controller().expand();
    return b2;
};

export default ConvertVertexToGroupRelationScenario;