import Mock from '../mock/Mock'
import GraphElementType from '@/graph-element/GraphElementType'
import AroundTodoTagScenario from "../scenario/AroundTodoTagScenario"
import SingleAndTaggedToEventScenario from "../scenario/SingleAndTaggedToEventScenario";
import TestUtil from "../util/TestUtil";
import AroundEventTagScenario from "../scenario/AroundEventTagScenario";
import GraphElementService from "../../../src/graph-element/GraphElementService";
import TagService from "../../../src/tag/TagService";

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
            let tagRelation = single.getNextBubble();
            let removeTagOfBubbleUri = {};
            jest.spyOn(TagService, "remove").mockImplementation(async (bubbleUri, tag) => {
                removeTagOfBubbleUri[bubbleUri] = tag.getUri();
            });
            await tagRelation.controller().removeDo();
            expect(
                single.getNumberOfChild()
            ).toBe(0);
            let tagVertex = tagRelation.getNextBubble();
            expect(
                tagVertex.getGraphElementType()
            ).toBe(GraphElementType.Meta);
            expect(
                removeTagOfBubbleUri[tagRelation.getParentBubble().getUri()]
            ).toBe(tagVertex.getUri())
        });
        it("can for tag group vertex", async () => {
            let scenario = await new AroundTodoTagScenario();
            let toDoTagBubble = scenario.getCenterInTree();
            let o1 = TestUtil.getChildDeepWithLabel(
                toDoTagBubble,
                "o1"
            );
            expect(
                o1.getGraphElementType()
            ).toBe(GraphElementType.MetaGroupVertex);
            expect(
                toDoTagBubble.getNumberOfChild()
            ).toBe(2);
            let tagRelation = o1.getParentBubble();
            await tagRelation.controller().removeDo();
            expect(
                toDoTagBubble.getNumberOfChild()
            ).toBe(1);
            let e1 = TestUtil.getChildDeepWithLabel(
                toDoTagBubble,
                "e1"
            );
            expect(
                e1.getGraphElementType()
            ).toBe(GraphElementType.MetaGroupVertex);
            let e1TagRelation = e1.getParentBubble();
            let removeTagOfBubbleUri = {};
            jest.spyOn(TagService, "remove").mockImplementation(async (bubbleUri, tag) => {
                removeTagOfBubbleUri[bubbleUri] = tag.getUri();
            });
            await e1TagRelation.controller().removeDo();
            expect(
                Object.values(removeTagOfBubbleUri).length
            ).toBe(2);
            expect(
                toDoTagBubble.getNumberOfChild()
            ).toBe(0);
        });
        it("can when center tag and tag relation before simple vertex", async () => {
            let scenario = await new AroundEventTagScenario();
            let center = scenario.getEventBubbleInTree();
            let tagRelation = center.getNextBubble();
            expect(
                center.getNumberOfChild()
            ).toBe(3);
            expect(
                tagRelation.getNextBubble().getGraphElementType()
            ).toBe(GraphElementType.Vertex);
            let removeTagOfBubbleUri = {};
            jest.spyOn(TagService, "remove").mockImplementation(async (bubbleUri, tag) => {
                removeTagOfBubbleUri[bubbleUri] = tag.getUri();
            });
            await tagRelation.controller().removeDo();
            expect(
                removeTagOfBubbleUri[tagRelation.getNextBubble().getUri()]
            ).toBe(center.getUri())
        });
    });
});