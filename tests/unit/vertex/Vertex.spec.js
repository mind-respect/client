import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import AroundEventTagScenario from "../scenario/AroundEventTagScenario"
import GroupRelationsScenario from "../scenario/GroupRelationsScenario"
import MindMapInfo from '@/MindMapInfo'
import Selection from '@/Selection'
import TestUtil from '../util/TestUtil'
import CreationDateScenario from "../scenario/CreationDateScenario";
import CircularityScenario from "../scenario/CircularityScenario";
import SingleChildScenario from "../scenario/SingleChildScenario";

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
            await scenario.getPossessionGroupRelation().controller().moveAbove(topBubble);
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
            let deepVertex = secondLevelGroupRelation.getNextChildrenEvenIfCollapsed()[0].getDestinationVertex();
            secondLevelGroupRelation.collapse();
            expect(
                secondLevelGroupRelation.isGroupRelation()
            ).toBeTruthy();
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
            await center.controller().addChild().then((tripleUi) => {
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
            ).toBe(1);
            let b4Index = childrenIndexes[
                b4Uri
                ];
            expect(
                b4Index.toTheLeft
            ).toBe(false);
            expect(
                b4Index.index
            ).toBe(2);
        });
    });
});