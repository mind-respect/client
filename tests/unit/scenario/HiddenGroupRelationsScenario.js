import Scenario from './Scenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'
import GraphServiceMock from "../mock/GraphServiceMock";

let HiddenGroupRelationsScenario = function () {
    this.dataKey = "hiddenGroupRelations.b1Graph";
    return this.init();
};

HiddenGroupRelationsScenario.prototype = new Scenario.Scenario();

HiddenGroupRelationsScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

HiddenGroupRelationsScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("b1");
};

HiddenGroupRelationsScenario.prototype.getCenterBubbleUri = function () {
    return this.getBubble1().getUri();
};

HiddenGroupRelationsScenario.prototype.getB2SurroundGraph = function () {
    return Scenario.getTestData(
        "hiddenGroupRelations.b2Graph"
    );
};
HiddenGroupRelationsScenario.prototype.expandBubble2 = function (bubble2) {
    let multiple = {};
    let b2Graph = this.getB2SurroundGraph()
    multiple[bubble2.getUri()] = b2Graph;
    let shirt2 = Scenario.vertexWithLabelInGraph("shirt2", b2Graph);
    multiple[shirt2.getUri()] = Scenario.getTestData("hiddenGroupRelations.shirt2Graph");
    GraphServiceMock.getForCentralBubbleUriMultiple(multiple);
    return bubble2.getController().expand();
};
HiddenGroupRelationsScenario.prototype.getB2GraphWhenConnectedToDistantBubble = function () {
    return Scenario.getTestData(
        "hiddenGroupRelations.b2GraphWhenConnectedToDistantBubble"
    );
};
HiddenGroupRelationsScenario.prototype.getDistantBubbleGraphWhenConnectedToBubble1 = function () {
    return Scenario.getTestData(
        "hiddenGroupRelations.distantBubbleGraphWhenConnectedToBubble1"
    );
};

HiddenGroupRelationsScenario.prototype.getDistantBubbleUri = function () {
    return Scenario.getTestData(
        "hiddenGroupRelations.distantBubbleUri"
    );
};
HiddenGroupRelationsScenario.prototype.getBubble1 = function () {
    return this.vertexWithLabelInServerGraph("b1");
};
HiddenGroupRelationsScenario.prototype.getBubble2 = function () {
    return this.vertexWithLabelInServerGraph("b2");
};
HiddenGroupRelationsScenario.prototype.getBubble1InTree = function () {
    return this.getVertexWithLabelInTree("b1");
};
HiddenGroupRelationsScenario.prototype.getBubble2InTree = function () {
    return this.getVertexWithLabelInTree("b2");
};

export default HiddenGroupRelationsScenario