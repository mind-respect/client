import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import AroundEventTagScenario from "../scenario/AroundEventTagScenario"
import GraphWithSimilarRelationsScenario from "../scenario/GraphWithSimilarRelationsScenario"
import MindMapInfo from '@/MindMapInfo'
import SelectionHandler from '@/SelectionHandler'
import TestUtil from '../util/TestUtil'
import RelationAsIdentifierScenario from "../scenario/RelationsAsIdentifierScenario";

describe('Vertex', () => {
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
    xit("removes suggestions related to an identification when identification removed", function () {
        var vertexWithEventRelatedSuggestions = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
        expect(
            vertexWithEventRelatedSuggestions.getSuggestions().length
        ).toBe(2);
        vertexWithEventRelatedSuggestions.addSuggestions([
                new Scenarios.getKaraokeSchemaGraph().getInviteesPropertyAsSuggestion()
            ]
        );
        expect(
            vertexWithEventRelatedSuggestions.getSuggestions().length
        ).toBe(3);
        vertexWithEventRelatedSuggestions.removeIdentifier(
            vertexWithEventRelatedSuggestions.getModel().getIdentifiers()[0]
        );
        expect(
            vertexWithEventRelatedSuggestions.getSuggestions().length
        ).toBe(1);
    });

    xit("shows suggestions when new suggestions are added", function () {
        var bubble2 = new Scenarios.threeBubblesGraph().getBubble2InTree();
        expect(
            bubble2.hasChildren()
        ).toBeFalsy();
        var suggestions = [
            new Scenarios.getKaraokeSchemaGraph().getLocationPropertyAsSuggestion()
        ];
        bubble2.addSuggestions(
            suggestions
        );
        expect(
            bubble2.hasChildren()
        ).toBeTruthy();
    });

    xit("can remove a vertex under a meta bubble", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventBubble = scenario.getEventBubbleInTree();
        let vertex = eventBubble.getNextBubble().getNextBubble();
        let numberOfChild = eventBubble.getNumberOfChild();
        vertex.remove();
        expect(
            eventBubble.getNumberOfChild()
        ).toBe(numberOfChild - 1);
    });

    it("selects the parent vertex after it's removed if right under a relation and vertex", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
        let otherBubble = scenario.getOtherRelationInTree().getNextBubble();
        await otherBubble.getController().remove();
        expect(
            SelectionHandler.getSingle().isVertex()
        ).toBeTruthy();
    });

    //todo
    xit("selects the group relation after it's removed if right under a relation and group relation", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let vertexUnderGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possessed by book 2"
        ).getNextBubble();
        expect(
            vertexUnderGroupRelation.isVertex()
        ).toBeTruthy();
        await vertexUnderGroupRelation.getController().remove();
        expect(
            SelectionHandler.getSingle().isGroupRelation()
        ).toBeTruthy();
    });

    describe("buildChildrenIndex", function () {
        it("is in right order", function () {
            var scenario = new Scenarios.creationDateScenario();
            var b7 = scenario.getBubble7InTree();
            scenario.expandBubble7(
                b7
            );
            var childrenIndexes = b7.buildChildrenIndex();
            var b71 = TestUtils.getChildWithLabel(
                b7,
                "r71"
            ).getTopMostChildBubble();
            var b72 = TestUtils.getChildWithLabel(
                b7,
                "r72"
            ).getTopMostChildBubble();
            expect(
                childrenIndexes[b71.getUri()].index
            ).toBe(0);
            expect(
                childrenIndexes[b72.getUri()].index
            ).toBe(1);
        });
        it("includes child vertices of inverse relations", function () {
            var scenario = new Scenarios.creationDateScenario();
            var b7 = scenario.getBubble7InTree();
            scenario.expandBubble7(
                b7
            );
            var childrenIndexes = b7.buildChildrenIndex();
            var r71 = TestUtils.getChildWithLabel(
                b7,
                "r71"
            );
            r71.inverse();
            var b71 = r71.getTopMostChildBubble();
            expect(
                childrenIndexes.hasOwnProperty(b71.getUri())
            ).toBeTruthy()
        });
        it("includes child vertices under group relations", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var center = scenario.getCenterVertexInTree();
            var groupRelation = TestUtils.getChildWithLabel(
                center,
                "Possession"
            );
            groupRelation.expand();
            var groupRelationUnder = groupRelation.getTopMostChildBubble();
            groupRelationUnder.expand();
            var vertexUnderDeepGroupRelation = groupRelationUnder.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                vertexUnderDeepGroupRelation.isVertex()
            ).toBeTruthy();
            var vertexUnderGroupRelation = groupRelationUnder.getBubbleUnder().getTopMostChildBubble();
            expect(
                vertexUnderGroupRelation.isVertex()
            ).toBeTruthy();
            var childrenIndexes = center.buildChildrenIndex();
            expect(
                childrenIndexes.hasOwnProperty(vertexUnderGroupRelation.getUri())
            ).toBeTruthy();
            expect(
                childrenIndexes.hasOwnProperty(vertexUnderDeepGroupRelation.getUri())
            ).toBeTruthy();
        });
        it("includes child vertices under collapsed group relations", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerVertex = scenario.getCenterVertexInTree();
            var possession = TestUtils.getChildWithLabel(centerVertex, "Possession");
            expect(
                possession.getNumberOfChild()
            ).toBe(0);
            var secondLevelGroupRelation = possession.getTopMostChildBubble();
            expect(
                secondLevelGroupRelation.getNumberOfChild()
            ).toBe(0);
            expect(
                secondLevelGroupRelation.isGroupRelation()
            ).toBeTruthy();
            var deepVertex = secondLevelGroupRelation.getModel().getAnyVertex();
            var childrenIndexes = centerVertex.buildChildrenIndex();
            expect(
                Object.keys(childrenIndexes).length
            ).toBe(8);
            expect(
                childrenIndexes.hasOwnProperty(deepVertex.getUri())
            ).toBeTruthy()
        });
        it("gives right order for center vertices", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var center = scenario.getBubble1InTree();
            var b4Uri;
            center.getController().addChild().then(function (tripleUi) {
                b4Uri = tripleUi.destinationVertex().getUri();
                tripleUi.destinationVertex().getModel().setLabel("b4");
            });
            var childrenIndexes = center.buildChildrenIndex();
            expect(
                childrenIndexes[
                    scenario.uriOfVertexWithLabel("b2")
                    ].index
            ).toBe(0);
            expect(
                childrenIndexes[
                    scenario.uriOfVertexWithLabel("b3")
                    ].index
            ).toBe(1);
            expect(
                childrenIndexes[
                    b4Uri
                    ].index
            ).toBe(2);
        });
    });
});