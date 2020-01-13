import Mock from '../mock/Mock'
import GraphElementType from '@/graph-element/GraphElementType'
import AroundTodoTagScenario from "../scenario/AroundTodoTagScenario"
import SingleAndTaggedToEventScenario from "../scenario/SingleAndTaggedToEventScenario";

describe("TagRelationController", () => {
    describe("removeDo", () => {
        it("can when center is a tag", async () => {
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
        it("can when parent is a normal vertex", async () => {
            let scenario = await new SingleAndTaggedToEventScenario();
            let single = scenario.getCenterInTree();
            await single.controller().showTags();
            expect(
                single.getNumberOfChild()
            ).toBe(1);
            let metaRelation = single.getNextBubble();
            await metaRelation.controller().removeDo();
            expect(
                single.getNumberOfChild()
            ).toBe(0);
        });
    });
});