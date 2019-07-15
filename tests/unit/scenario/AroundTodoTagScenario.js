import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";


let AroundTodoTagScenario = function () {
    this.dataKey = "centerMetaEventAndTodo.aroundTodo";
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
            "centerMetaEventAndTodo.aroundE3"
        )
    );
    return e3.getController().expand();
};

export default AroundTodoTagScenario;