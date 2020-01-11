import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";

let SingleAndTaggedToEventScenario = function () {
    this.dataKey = "centerTagEventAndTodo.singleTaggedToEvent";
    return this.init();
};

SingleAndTaggedToEventScenario.prototype = new Scenario.Scenario();

SingleAndTaggedToEventScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("single tagged to event");
};

SingleAndTaggedToEventScenario.prototype.getCenterBubbleUri = function () {
    return this.getCenter().getUri();
};

SingleAndTaggedToEventScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("single tagged to event");
};

SingleAndTaggedToEventScenario.prototype.expandEventTag = function (eventTag) {
    GraphServiceMock.getForCentralBubbleUri(
        Scenario.getTestData(
            "centerTagEventAndTodo.aroundEvent"
        )
    );
    return eventTag.controller().expand();
};

export default SingleAndTaggedToEventScenario;