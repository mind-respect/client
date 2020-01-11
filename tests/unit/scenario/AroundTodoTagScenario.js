import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";


let AroundTodoTagScenario = function () {
    this.dataKey = "centerTagEventAndTodo.aroundTodo";
    return this.init();
};

AroundTodoTagScenario.prototype = new Scenario.Scenario();

AroundTodoTagScenario.prototype.getCenter = function () {
    return this.tagWithLabel("To do");
};

AroundTodoTagScenario.prototype.getCenterInTree = function () {
    return this.tagWithLabelInTree("To do");
};

AroundTodoTagScenario.prototype.expandE3 = function (e3) {
    GraphServiceMock.getForCentralBubbleUri(
        Scenario.getTestData(
            "centerTagEventAndTodo.aroundE3"
        )
    );
    return e3.controller().expand();
};

export default AroundTodoTagScenario;