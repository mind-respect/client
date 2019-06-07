import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import MindMapInfo from '@/MindMapInfo'

describe.only('Vertex', () => {
    beforeEach(() => {
        Mock.applyDefault();
    });
    describe("remove", function () {
        it("removes connected edges when removing a vertex", async () => {
            MindMapInfo._setIsViewOnly(false);
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
    it("can return relation with ui parent", async () => {
        let scenario = await new ThreeScenario();
        let bubble2 = scenario.getBubble2InTree();
        let relationWithParent = bubble2.getRelationWithUiParent();
        expect(
            relationWithParent.getUri()
        ).toBe(scenario.getRelation1InTree().getUri());
    });
    it("can visit immediate vertices child", async () => {
        let hasVisited = false;
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getCenterBubbleInTree();
        bubble1.visitClosestChildVertices(function (vertex) {
            expect(
                "b2" === vertex.text() ||
                "b3" === vertex.text()
            ).toBeTruthy();
            hasVisited = true;
        });
        expect(hasVisited).toBeTruthy();
    });
    /*todo*/
    xit("can remove a vertex even if it has duplicates", function () {
        MindMapInfo._setIsViewOnly(false);
        var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
        expect(
            TestUtils.isGraphElementUiRemoved(
                bubble1
            )
        ).toBeFalsy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                bubble1Duplicate
            )
        ).toBeFalsy();
        bubble1.remove();
        expect(
            TestUtils.isGraphElementUiRemoved(
                bubble1
            )
        ).toBeTruthy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                bubble1Duplicate
            )
        ).toBeTruthy();
    });

    it("does not have hidden relations if non owner and bubble does not have public neighbors", async () => {
        MindMapInfo._setIsViewOnly(false);
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        let b3 = scenario.getBubble3InTree();
        expect(
            b2.canExpand()
        ).toBeTruthy();
        expect(
            b3.canExpand()
        ).toBeTruthy();
        MindMapInfo._setIsViewOnly(true);
        expect(
            b2.canExpand()
        ).toBeFalsy();
        expect(
            b3.canExpand()
        ).toBeTruthy();
    });
    /*todo*/
    xit("returns one more hidden relations if immediate child of a meta", function () {
        var scenario = new Scenarios.aroundEventIdentifier();
        var eventCenter = scenario.getEventBubbleInTree();
        var event2 = TestUtils.getChildWithLabel(
            eventCenter,
            "e2"
        ).getTopMostChildBubble();
        event2.getHiddenRelationsContainer().show();
        expect(
            event2.getNumberOfHiddenRelations()
        ).toBe(2);
        MindMapInfo._setIsViewOnly(false);
        expect(
            event2.hasHiddenRelations()
        ).toBeTruthy();
        var event1 = TestUtils.getChildWithLabel(
            eventCenter,
            "e1"
        ).getTopMostChildBubble();
        event1.getHiddenRelationsContainer().show();
        expect(
            event1.getNumberOfHiddenRelations()
        ).toBe(3);
        expect(
            event1.hasHiddenRelations()
        ).toBeTruthy();
    });
    /*todo*/
    xit("adds to other instances", function () {
        var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        var b1 = graphWithCircularityScenario.getBubble1InTree();
        var b2 = TestUtils.getChildWithLabel(
            b1,
            "r1"
        ).getTopMostChildBubble();
        expect(
            b2.getNumberOfChild()
        ).toBe(0);
        var bubble3 = TestUtils.getChildWithLabel(
            b1,
            "r3"
        ).getTopMostChildBubble();
        graphWithCircularityScenario.expandBubble3(bubble3);
        var otherB2 = bubble3.getTopMostChildBubble().getTopMostChildBubble();
        expect(
            otherB2.text()
        ).toBe("b2");
        otherB2.getHiddenRelationsContainer().hide();
        otherB2.getController().addChild();
        expect(
            b2.getNumberOfChild()
        ).toBe(1);
    });
    describe("mergeTo", function () {
        /*todo*/
        xit("also changes uri of connected edges source and destination vertices", function () {
            var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var distantVertexUri = TestUtils.generateVertexUri();
            var r1 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            );
            expect(
                r1.getSourceVertex().getUri()
            ).not.toBe(distantVertexUri);
            b1.mergeTo(distantVertexUri);
            r1 = TestUtils.getChildWithLabel(
                b1,
                "r1"
            );
            expect(
                r1.getSourceVertex().getUri()
            ).toBe(distantVertexUri);
        });
    });
});