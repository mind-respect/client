import Scenario from './Scenario'


let AroundEventTagScenario = function () {
    this.dataKey = "centerMetaEventAndTodo.aroundEvent";
    return this.init();
};

AroundEventTagScenario.prototype = new Scenario.Scenario();

AroundEventTagScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("Event");
};

AroundEventTagScenario.prototype.getCenterBubbleUri = function () {
    return this.getIdentifierWithLabelInSubGraph(
        "Event",
        SubGraph.fromServerFormat(graph)
    ).getUri();
};

AroundEventTagScenario.prototype.getEventBubbleInTree = function () {
    return this.getBubbleWithLabelInTree("Event");
};

AroundEventTagScenario.prototype.getEvent1 = function () {
    return this.getBubbleWithLabelInTree("e1");
};

AroundEventTagScenario.prototype.getEvent2 = function () {
    return this.getBubbleWithLabelInTree("e2");
};

export default AroundEventTagScenario;