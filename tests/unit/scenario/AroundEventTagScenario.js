import Scenario from './Scenario'


let AroundEventTagScenario = function () {
    this.dataKey = "centerTagEventAndTodo.aroundEvent";
    return this.init();
};

AroundEventTagScenario.prototype = new Scenario.Scenario();

AroundEventTagScenario.prototype.getCenter = function () {
    return this.tagWithLabel("Event");
};

AroundEventTagScenario.prototype.getCenterBubbleUri = function () {
    return this.getCenter().getUri();
};

AroundEventTagScenario.prototype.getEventBubbleInTree = function () {
    return this.tagWithLabelInTree("Event");
};

export default AroundEventTagScenario;