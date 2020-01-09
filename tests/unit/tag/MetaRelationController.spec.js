import Mock from '../mock/Mock'
import GraphElementType from '@/graph-element/GraphElementType'
import AroundTodoTagScenario from "../scenario/AroundTodoTagScenario"

describe("MetaRelationController", () => {
    describe("removeDo", () => {
        it("can", async () => {
            let scenario = await new AroundTodoTagScenario();
            let center = scenario.getCenterInTree();
            let metaRelation = center.getNextBubble();
            expect(
                metaRelation.getGraphElementType()
            ).toBe(GraphElementType.MetaRelation);
            let nbChild = center.getNumberOfChild();
            metaRelation.controller().removeDo();
            expect(
                center.getNumberOfChild()
            ).toBe(nbChild - 1);
        });
    });
});