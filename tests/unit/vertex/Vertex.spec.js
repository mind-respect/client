import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import AroundEventTagScenario from "../scenario/AroundEventTagScenario"
import GroupRelationsScenario from "../scenario/GroupRelationsScenario"
import State from '@/State'
import Selection from '@/Selection'
import TestUtil from '../util/TestUtil'
import CreationDateScenario from "../scenario/CreationDateScenario";
import CircularityScenario from "../scenario/CircularityScenario";
import SingleChildScenario from "../scenario/SingleChildScenario";
import GraphElement from "../../../src/graph-element/GraphElement";
import GraphElementType from "../../../src/graph-element/GraphElementType";

describe('Vertex', () => {
    beforeEach(() => {
        Mock.applyDefault();
    });
    describe("remove", function () {
        it("removes connected edges when removing a vertex", async () => {
            State._setIsViewOnly(false);
            let threeBubbles = await new ThreeScenario();
            let bubble1 = threeBubbles.getBubble1InTree(),
                r1 = threeBubbles.getRelation1InTree();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(2);
            let bubble2 = r1.getNextBubble();
            bubble2.remove();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(1);
        });
    });
    describe("addChild", () => {
        it("adds before tags", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getCenterInTree();
            let newTriple = await center.controller().addChild();
            let newVertex = newTriple.getDestinationVertex();
            newVertex.addIdentification(TestUtil.dummyTag());
            await newVertex.controller().showTags(true, false, true);
            expect(
                newVertex.getNextChildren().length
            ).toBe(1);
            await newVertex.controller().addChild();
            let firstChild = newVertex.getNextChildren()[0].getNextBubble();
            let secondChild = newVertex.getNextChildren()[1].getNextBubble();
            expect(
                firstChild.getGraphElementType()
            ).toBe(GraphElementType.Vertex);
            expect(
                secondChild.getGraphElementType()
            ).toBe(GraphElementType.Meta);
        });
    });
    it("can visit immediate vertices child", async () => {
        let hasVisited = false;
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getCenterBubbleInTree();
        bubble1.getClosestChildVertices().forEach(function (vertex) {
            expect(
                "b2" === vertex.text() ||
                "b3" === vertex.text()
            ).toBeTruthy();
            hasVisited = true;
        });
        expect(hasVisited).toBeTruthy();
    });
    it("also removes duplicates when removing", async () => {
        let scenario = await new CircularityScenario();
        let b1 = scenario.getCenterInTree();
        let b2 = TestUtil.getChildWithLabel(
            b1,
            "r1"
        ).getNextBubble();
        await scenario.expandBubble2(b2);
        expect(
            TestUtil.hasChildWithLabel(
                b1,
                "r3"
            )
        ).toBeTruthy();
        expect(
            TestUtil.hasChildWithLabel(
                b2,
                "r2"
            )
        ).toBeTruthy();
        let b3 = TestUtil.getChildWithLabel(
            b2,
            "r2"
        ).getNextBubble();
        await b3.controller().removeDo();
        expect(
            TestUtil.hasChildWithLabel(
                b2,
                "r2"
            )
        ).toBeFalsy();
        expect(
            TestUtil.hasChildWithLabel(
                b1,
                "r3"
            )
        ).toBeFalsy();
    });

    it("does not have hidden relations if non owner and bubble does not have public neighbors", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        let b3 = scenario.getBubble3InTree();
        expect(
            b2.canExpand()
        ).toBeTruthy();
        expect(
            b3.canExpand()
        ).toBeTruthy();
        b2.getNbNeighbors().nbPrivate = 0;
        expect(
            b2.canExpand()
        ).toBeFalsy();
        expect(
            b3.canExpand()
        ).toBeTruthy();
    });
    it("adds duplicate button if has duplicate", async () => {
        let scenario = await new CircularityScenario();
        let bubble1 = scenario.getCenterInTree();
        expect(
            bubble1.getNbDuplicates() > 0
        ).toBeFalsy();
        let bubble2 = scenario.getBubble2InTree();
        await scenario.expandBubble2(bubble2);
        let bubble3 = bubble2.getNextBubble().getNextBubble();
        await scenario.expandBubble3(bubble3);
        expect(
            bubble1.getNbDuplicates() > 0
        ).toBeTruthy();
        expect(
            bubble1.getNbDuplicates() > 0
        ).toBeTruthy();
        let bubble1Duplicate = bubble3.getNextBubble().getNextBubble();
        expect(
            bubble1Duplicate.getNbDuplicates() > 0
        ).toBeTruthy();
    });

    it("returns one more nb child if immediate child of a meta", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventCenter = scenario.getEventBubbleInTree();
        let event2 = TestUtil.getChildDeepWithLabel(
            eventCenter,
            "e2"
        ).getNextBubble();
        expect(
            event2.getNumberOfChild()
        ).toBe(2);
        expect(
            event2.canExpand()
        ).toBeTruthy();
        let event1 = TestUtil.getChildDeepWithLabel(
            eventCenter,
            "e1"
        ).getNextBubble();
        expect(
            event1.getNumberOfChild()
        ).toBe(4);
        expect(
            event1.canExpand()
        ).toBeTruthy();
    });

    it("can remove a vertex under a meta bubble", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventBubble = scenario.getEventBubbleInTree();
        let vertex = eventBubble.getNextBubble().getNextBubble();
        let numberOfChild = eventBubble.getNumberOfChild();
        await vertex.controller().removeDo();
        expect(
            eventBubble.getNumberOfChild()
        ).toBe(numberOfChild - 1);
    });

    it("selects the parent vertex after it's removed if no siblings", async () => {
        let scenario = await new SingleChildScenario();
        let parent = scenario.getParentInTree();
        let child = parent.getNextBubble().getNextBubble();
        await child.controller().removeDo();
        await scenario.nextTickPromise();
        expect(
            Selection.isSingle()
        ).toBeTruthy();
        expect(
            Selection.getSingle().getUri()
        ).toBe(parent.getUri());
    });

});