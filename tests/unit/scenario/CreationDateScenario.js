import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";

let CreationDateScenario = function () {
    this.dataKey = "creationDate.surroundBubble1Graph";
    return this.init();
};

CreationDateScenario.prototype = new Scenario.Scenario();

CreationDateScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("b1");
};

CreationDateScenario.prototype.getCenterBubbleUri = function () {
    return this.getCenter().getUri();
};
CreationDateScenario.prototype.getBubble1InTree = function () {
    return this.getVertexWithLabelInTree("b1");
};
CreationDateScenario.prototype.getBubble7InTree = function () {
    return this.getVertexWithLabelInTree("b7");
};
CreationDateScenario.prototype.expandBubble7 = function (bubble7) {
    GraphServiceMock.getForCentralBubbleUri(
        getSurroundBubble7Graph()
    );
    return bubble7.controller().expand();
};

CreationDateScenario.prototype.expandTodoGroupRelation = function (todoGroupRelation) {
    return this.expandBubbleWithKey(
        todoGroupRelation,
        "aroundTodoGroupRelation"
    );
};

function getSurroundBubble7Graph() {
    return Scenario.getTestData(
        "creationDate.surroundBubble7Graph"
    );
}

export default CreationDateScenario;