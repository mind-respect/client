import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import AroundEventTagScenario from "../scenario/AroundEventTagScenario"
import GroupRelationsScenario from "../scenario/GroupRelationsScenario"
import MindMapInfo from '@/MindMapInfo'
import Selection from '@/Selection'
import TestUtil from '../util/TestUtil'
import RelationAsIdentifierScenario from "../scenario/RelationsAsIdentifierScenario";
import CreationDateScenario from "../scenario/CreationDateScenario";

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
        let scenario = await new GroupRelationsScenario();
        let otherBubble = scenario.getOtherRelationInTree().getNextBubble();
        await otherBubble.getController().remove();
        expect(
            Selection.getSingle().isVertex()
        ).toBeTruthy();
    });

    //todo
    xit("selects the group relation after it's removed if right under a relation and group relation", async () => {
        let scenario = await new GroupRelationsScenario();
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
            Selection.getSingle().isGroupRelation()
        ).toBeTruthy();
    });

    describe("buildChildrenIndex", function () {
        it("is in right order", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(
                b7
            );
            let b71 = TestUtil.getChildWithLabel(
                b7,
                "r71"
            ).getNextBubble();
            let b72 = TestUtil.getChildWithLabel(
                b7,
                "r72"
            ).getNextBubble();
            let childrenIndexes = b7.buildChildrenIndex();
            expect(
                childrenIndexes[b71.getUri()].index
            ).toBe(0);
            expect(
                childrenIndexes[b72.getUri()].index
            ).toBe(1);
        });
        it("includes child vertices of inverse relations", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(
                b7
            );
            let r71 = TestUtil.getChildWithLabel(
                b7,
                "r71"
            );
            r71.inverse();
            let childrenIndexes = b7.buildChildrenIndex();
            let b71 = r71.getNextBubble();
            expect(
                childrenIndexes.hasOwnProperty(b71.getUri())
            ).toBeTruthy()
        });
        it("includes child vertices of inverse relations under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let parentVertex = scenario.getCenterInTree();
            let inverseRelation = TestUtil.getChildWithLabel(
                scenario.getPossessionGroupRelation(),
                "Possessed by book 2"
            );
            expect(
                inverseRelation.isInverse()
            ).toBeTruthy();
            expect(
                parentVertex.buildChildrenIndex().hasOwnProperty(
                    inverseRelation.getSourceVertex().getUri()
                )
            ).toBeTruthy();
        });
        it("does not have duplicate indexes when moving a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let topBubble = scenario.getOtherRelationInTree().getNextBubble();
            await scenario.getPossessionGroupRelation().getController().moveAbove(topBubble);
            let detailedIndex = center.buildChildrenIndex();
            let indexArray = Object.values(detailedIndex).map((entry) => {
                return entry.index;
            });
            let indexAsSet = [...new Set(indexArray)];
            expect(
                indexArray.length
            ).toBe(indexAsSet.length)
        });
        it("includes child vertices under group relations", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = TestUtil.getChildWithLabel(
                center,
                "Possession"
            );
            groupRelation.expand();
            let groupRelationUnder = groupRelation.getNextBubble();
            groupRelationUnder.expand();
            let vertexUnderDeepGroupRelation = groupRelationUnder.getNextBubble().getNextBubble();
            expect(
                vertexUnderDeepGroupRelation.isVertex()
            ).toBeTruthy();
            let vertexUnderGroupRelation = groupRelationUnder.getDownBubble().getNextBubble();
            expect(
                vertexUnderGroupRelation.isVertex()
            ).toBeTruthy();
            let childrenIndexes = center.buildChildrenIndex();
            expect(
                childrenIndexes.hasOwnProperty(vertexUnderGroupRelation.getUri())
            ).toBeTruthy();
            expect(
                childrenIndexes.hasOwnProperty(vertexUnderDeepGroupRelation.getUri())
            ).toBeTruthy();
        });
        it("includes child vertices under collapsed group relations", async () => {
            let scenario = await new GroupRelationsScenario();
            let centerVertex = scenario.getCenterInTree();
            let possession = TestUtil.getChildWithLabel(centerVertex, "Possession");
            let secondLevelGroupRelation = TestUtil.getChildWithLabel(
                possession,
                "Possession of book 3"
            );
            possession.collapse();
            secondLevelGroupRelation.collapse();
            expect(
                secondLevelGroupRelation.isGroupRelation()
            ).toBeTruthy();
            let deepVertex = secondLevelGroupRelation.getAnyVertex();
            let childrenIndexes = centerVertex.buildChildrenIndex();
            expect(
                Object.keys(childrenIndexes).length
            ).toBe(8);
            expect(
                childrenIndexes.hasOwnProperty(deepVertex.getUri())
            ).toBeTruthy()
        });
        it("gives right order for center vertices", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getBubble1InTree();
            let b4Uri;
            await center.getController().addChild().then((tripleUi) => {
                b4Uri = tripleUi.destination.getUri();
                tripleUi.destination.setLabel("b4");
            });
            let b2 = scenario.getBubble2InTree();
            let b3 = scenario.getBubble3InTree();
            let childrenIndexes = center.buildChildrenIndex();
            let b2Index = childrenIndexes[
                b2.getUri()
                ];
            expect(
                b2Index.index
            ).toBe(0);
            expect(
                b2Index.toTheLeft
            ).toBe(false);
            let b3Index = childrenIndexes[
                b3.getUri()
                ];
            expect(
                b3Index.toTheLeft
            ).toBe(true);
            expect(
                b3Index.index
            ).toBe(2);
            let b4Index = childrenIndexes[
                b4Uri
                ];
            expect(
                b4Index.toTheLeft
            ).toBe(false);
            expect(
                b4Index.index
            ).toBe(1);
        });
    });
});