import Mock from '../mock/Mock'
import AroundTodoTagScenario from "../scenario/AroundTodoTagScenario"
import TestUtil from '../util/TestUtil'

describe("ForkController", () => {
    it("expands tag group vertices", async () => {
        let scenario = await new AroundTodoTagScenario();
        let toDoMetaBubble = scenario.getCenterInTree();
        toDoMetaBubble.controller().expand();
        let o1 = TestUtil.getChildDeepWithLabel(
            toDoMetaBubble,
            "o1"
        );
        expect(
            o1.getNextChildren().length
        ).toBe(1)
        let e1 = TestUtil.getChildDeepWithLabel(
            toDoMetaBubble,
            "e1"
        );
        expect(
            e1.getNextChildren().length
        ).toBe(2);
    });
});