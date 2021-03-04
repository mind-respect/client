import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import State from '@/State'
import RelationController from '@/relation/RelationController'
import TestUtil from '../util/TestUtil'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import IdUri from '@/IdUri'
import ConvertVertexToGroupRelationScenario from "../scenario/ConvertVertexToGroupRelationScenario";
import LeaveContextChoiceAScenario from "../scenario/LeaveContextChoiceAScenario";
import LeaveContextTechChoiceScenario from "../scenario/LeaveContextTechChoiceScenario";
import TwoLevelGroupRelationScenario from "../scenario/TwoLevelGroupRelationScenario";
import CurrentSubGraph from "../../../src/graph/CurrentSubGraph";
import GraphElementType from "../../../src/graph-element/GraphElementType";

describe("RelationController", () => {
    describe("remove", function () {
        it("can", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            let numberOfChild = bubble1.getNumberOfChild();
            let relation1 = bubble1.getNextBubble();
            State.setIsAnonymous(false);
            State._setIsViewOnly(false);
            await new RelationController.RelationController(
                relation1
            ).removeDo();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild - 1);
        });
        it("decrements number of connected relations to the parent", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            expect(
                bubble1.getNbNeighbors().getTotal()
            ).toBe(
                2
            );
            let relation1 = bubble1.getNextBubble();
            await relation1.controller().remove(true);
            expect(
                bubble1.getNbNeighbors().getTotal()
            ).toBe(
                1
            );
        });
    });
    describe("addChild", function () {
        it("changes to a group relation when adding a child", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            expect(
                TestUtil.getChildWithLabel(bubble1, "r1").isGroupRelation()
            ).toBeFalsy();
            await new RelationController.RelationController(
                TestUtil.getChildWithLabel(bubble1, "r1")
            ).addChild();
            expect(
                TestUtil.getChildWithLabel(bubble1, "r1").isGroupRelation()
            ).toBeTruthy();
        });

        it("adds new relation under the group relation when adding a child to a relation under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let centerVertex = scenario.getCenterInTree();
            expect(
                centerVertex.getNumberOfChild()
            ).toBe(4);
            let groupRelation = TestUtil.getChildWithLabel(
                centerVertex,
                "Possession"
            );
            await scenario.expandPossession(groupRelation);
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(3);
            let relationUnderGroupRelation = groupRelation.getNextBubble();
            expect(
                relationUnderGroupRelation.getGraphElementType()
            ).toBe(GraphElementType.Relation);
            await relationUnderGroupRelation.controller().addChild();
            // expect(
            //     centerVertex.getNumberOfChild()
            // ).toBe(4);
        });

        it("does not duplicate relations under the new group relation", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getBubble1InTree();
            let newRelation;
            await center.controller().addChild().then(function (tripleUi) {
                newRelation = tripleUi.edge;
            });
            await newRelation.controller().addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(
                center,
                ""
            );
            expect(
                newGroupRelation.isGroupRelation()
            ).toBeTruthy();
            expect(
                newGroupRelation.getNumberOfChild()
            ).toBe(2);
        });
        it("keeps shown tags under new relation", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                center,
                "r1"
            );
            let tag = TestUtil.dummyTag();
            tag.setLabel("some tag");
            await r1.controller().addIdentification(tag);
            await r1.controller().showTags(true, false, true);
            await r1.controller().addChild();
            let groupRelation = TestUtil.getChildWithLabel(
                center,
                "some tag"
            );
            expect(
                groupRelation.getGraphElementType()
            ).toBe(GraphElementType.GroupRelation);
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(3);
            let lastChild = groupRelation.getNextChildren()[groupRelation.getNumberOfChild() - 1];
            expect(
                lastChild.getGraphElementType()
            ).toBe(GraphElementType.Meta);
        });
        it("can when is inverse", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                bubble1,
                "r1"
            );
            await r1.controller().reverse();
            await r1.controller().addChild();
            r1 = TestUtil.getChildWithLabel(
                bubble1,
                "r1"
            );
            expect(
                r1.getGraphElementType()
            ).toBe(GraphElementType.GroupRelation);
            let b2 = r1.getNextBubble().getNextBubble();
            expect(
                b2.getLabel()
            ).toBe("b2");
        });
    });

    //todo
    xit("removes only one relation when removing a relation to a duplicated bubble", async () => {
        let graphWithCircularityScenario = await new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var bubble3 = TestUtils.getChildWithLabel(
            bubble1,
            "r3"
        ).getTopMostChildBubble();
        graphWithCircularityScenario.expandBubble3(bubble3);
        var aRelationToSameBubble = bubble3.getTopMostChildBubble();
        expect(
            aRelationToSameBubble.text()
        ).toBe("r2");
        var anotherRelationToTheSameBubble = TestUtils.getChildWithLabel(
            bubble1,
            "r1"
        );
        expect(
            TestUtils.isGraphElementUiRemoved(
                aRelationToSameBubble
            )
        ).toBeFalsy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                anotherRelationToTheSameBubble
            )
        ).toBeFalsy();
        State._setIsViewOnly(false);
        new RelationController.RelationController(
            aRelationToSameBubble
        ).remove(true);
        expect(
            TestUtils.isGraphElementUiRemoved(
                aRelationToSameBubble
            )
        ).toBeTruthy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                anotherRelationToTheSameBubble
            )
        ).toBeFalsy();
    });
    //todo
    xit("removes other instances of duplicated relation when removing", function () {
        var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var aRelation = TestUtils.getChildWithLabel(
            bubble1,
            "r3"
        );
        var bubble2 = TestUtils.getChildWithLabel(
            bubble1,
            "r1"
        ).getTopMostChildBubble();
        graphWithCircularityScenario.expandBubble2(bubble2);
        var bubble3 = bubble2.getTopMostChildBubble().getTopMostChildBubble();
        graphWithCircularityScenario.expandBubble3(bubble3);
        var sameRelation = bubble3.getTopMostChildBubble();
        expect(
            aRelation.text()
        ).toBe("r3");
        expect(
            sameRelation.text()
        ).toBe("r3");
        expect(
            TestUtils.isGraphElementUiRemoved(
                aRelation
            )
        ).toBeFalsy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                sameRelation
            )
        ).toBeFalsy();
        State._setIsViewOnly(false);
        new RelationController.RelationController(
            aRelation
        ).remove(true);
        expect(
            TestUtils.isGraphElementUiRemoved(
                aRelation
            )
        ).toBeTruthy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                sameRelation
            )
        ).toBeTruthy();
    });

    it("changes destination vertex if relation is inverse when changing end vertex", async () => {
        let changeSourceSpy = Mock.getSpy(
            "EdgeService",
            "changeSource"
        );
        changeSourceSpy.mockClear();
        let changeDestinationSpy = Mock.getSpy(
            "EdgeService",
            "changeDestination"
        );
        changeDestinationSpy.mockClear();
        let scenario = await new ThreeScenario();
        let b1 = scenario.getBubble1InTree();
        let r1 = TestUtil.getChildWithLabel(
            b1,
            "r1"
        );
        let b2 = r1.getNextBubble();
        let r2 = TestUtil.getChildWithLabel(
            b1,
            "r2"
        );
        await scenario.expandBubble2(b2);
        await r2.controller().replaceParentFork(
            b2
        );
        expect(
            changeSourceSpy.mock.calls.length
        ).toBe(1);
        expect(
            changeDestinationSpy.mock.calls.length
        ).toBe(0);
        await r2.controller().reverse();
        await r2.controller().replaceParentFork(
            b1
        );
        expect(
            changeSourceSpy.mock.calls.length
        ).toBe(1);
        expect(
            changeDestinationSpy.mock.calls.length
        ).toBe(1);
    });
    it("can add a child to a relation under a group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        await scenario.expandPossession(groupRelation);
        let centerBubble = scenario.getCenterInTree();
        let centerBubbleNumberOfChild = centerBubble.getNumberOfChild();
        let relationUnderGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            relationUnderGroupRelation.isGroupRelation()
        ).toBeFalsy();
        await relationUnderGroupRelation.controller().addChild();
        let newGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            newGroupRelation.text()
        ).toBe("Possession of book 1");
        expect(
            newGroupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(centerBubbleNumberOfChild);
    });
    it("does not hide the new group relation when adding a child to a relation under a group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        await scenario.expandPossession(groupRelation);
        let relationUnderGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            relationUnderGroupRelation.isGroupRelation()
        ).toBeFalsy();
        await relationUnderGroupRelation.controller().addChild();
        let newGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            newGroupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            newGroupRelation.isShrinked()
        ).toBeFalsy();
    });
    describe("addChild", function () {
        it("includes previous vertex in group relation model vertices", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            await scenario.getOtherRelationInTree().controller().addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            expect(
                newGroupRelation.getNumberOfChild()
            ).toBe(2);
        });
    });
    describe("becomeParent", function () {
        it("can become parent of a relation", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );
            expect(
                r2.getNumberOfChild()
            ).toBe(1);
            let r1 = TestUtil.getChildWithLabel(
                centerBubble,
                "r1"
            );
            expect(
                r1.controller()._canMoveUnderParent(r2)
            ).toBeTruthy();
            await r1.controller().moveUnderParent(r2);
            r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );
            expect(r2.isGroupRelation()).toBeTruthy();
            expect(
                r2.getNumberOfChild()
            ).toBe(2);
            r1 = TestUtil.getChildWithLabel(
                r2,
                "r1"
            );
            expect(
                r1.getParentBubble().getLabel()
            ).toBe("r2");
        });
        it("can become parent of a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            await scenario.expandPossession(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    otherRelation,
                    "Possession"
                )
            ).toBeFalsy();
            await groupRelation.controller().moveUnderParent(otherRelation);
            otherRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            expect(
                TestUtil.hasChildWithLabel(
                    otherRelation,
                    "Possession"
                )
            ).toBeTruthy();
        });
        it("can become parent of one of its descendant", async () => {
            let scenario = await new ConvertVertexToGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let relation = center.getNextBubble().getParentBubble();
            expect(
                relation.isEdge()
            ).toBeTruthy();
            expect(
                relation.getNumberOfChild()
            ).toBe(1);
            let b2 = await scenario.getExpandedB2();
            let deepVertex = b2.getNextBubble().getNextBubble();
            expect(
                deepVertex.getLabel()
            ).toBe("b3");
            await deepVertex.controller().moveUnderParent(relation);
            expect(
                center.getNumberOfChild()
            ).toBe(1);
            let groupRelation = center.getNextBubble();
            expect(
                groupRelation.isGroupRelation()
            ).toBeTruthy();
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(2);
            b2 = groupRelation.getNextBubble();
            expect(
                b2.getLabel()
            ).toBe("b2");
            let b3 = b2.getDownBubble();
            expect(
                b3.getLabel()
            ).toBe("b3");
        });
    });
    describe("leaveContextDo", function () {
        it("removes the edge when copied and tagged bubble is parent vertex", async () => {
            let scenario = await new LeaveContextChoiceAScenario();
            let center = scenario.getCenterInTree();
            let techChoice = TestUtil.getChildDeepWithLabel(center, "tech choice");
            let relation = techChoice.getParentBubble();
            relation.setLabel("rel label");
            expect(relation.isEdge()).toBeTruthy();
            expect(
                TestUtil.hasChildWithLabel(center, "rel label")
            ).toBeTruthy();
            await relation.controller().leaveContextDo();
            expect(
                TestUtil.hasChildWithLabel(center, "rel label")
            ).toBeFalsy();
        });
        it("changes destination vertex to a tag when it's children", async () => {
            let scenario = await new LeaveContextTechChoiceScenario();
            let center = scenario.getCenterInTree();
            let choiceA = TestUtil.getChildDeepWithLabel(center, "choice a");
            let relation = choiceA.getParentBubble();
            relation.setLabel("rel label");
            expect(relation.isEdge()).toBeTruthy();
            expect(
                TestUtil.hasChildWithLabel(center, "rel label")
            ).toBeTruthy();
            expect(
                choiceA.getIdentifiers().length
            ).toBe(0);
            expect(
                choiceA.getNumberOfChild()
            ).toBe(2);
            await relation.controller().leaveContextDo();
            expect(
                TestUtil.hasChildWithLabel(center, "rel label")
            ).toBeTruthy();
            choiceA = TestUtil.getChildDeepWithLabel(center, "choice a");
            expect(
                choiceA.getIdentifiers().length
            ).toBe(1);
            expect(
                choiceA.getNumberOfChild()
            ).toBe(0);
        });
        it("increments number of references of tag to parent when destination vertex is removed", async () => {
            let scenario = await new LeaveContextChoiceAScenario();
            let center = scenario.getCenterInTree();
            let techChoice = TestUtil.getChildDeepWithLabel(center, "tech choice");
            let relation = techChoice.getParentBubble();
            relation.setLabel("rel label");
            expect(relation.isEdge()).toBeTruthy();
            expect(
                center.getIdentifiersIncludingSelf()[0].getNbNeighbors().getTotal()
            ).toBe(0);
            Mock.spies["TagService"].add.mockImplementation((graphElement, tag) => {
                tag.setUri(
                    TestUtil.generateIdentificationUri()
                );
                tag.getNbNeighbors().nbPrivate++;
                return Promise.resolve(
                    [tag]
                );
            })
            await relation.controller().leaveContextDo();
            expect(
                center.getIdentifiersIncludingSelf()[0].getNbNeighbors().getTotal()
            ).toBe(1);
        });
        it("prevents remove original and adding new vertex when relation is inverse", async () => {
            let scenario = await new LeaveContextChoiceAScenario();
            let center = scenario.getCenterInTree();
            let techChoice = TestUtil.getChildDeepWithLabel(center, "tech choice");
            let relation = techChoice.getParentBubble();
            relation.setLabel("rel label");
            expect(
                relation.isInverse()
            ).toBeTruthy();
            expect(relation.isEdge()).toBeTruthy();
            expect(
                CurrentSubGraph.get().hasUri(center.getUri())
            ).toBeTruthy();
            expect(
                Object.values(CurrentSubGraph.get().getVertices()).length
            ).toBe(4);
            await relation.controller().leaveContextDo();
            expect(
                CurrentSubGraph.get().hasUri(center.getUri())
            ).toBeTruthy();
            expect(
                Object.values(CurrentSubGraph.get().getVertices()).length
            ).toBe(3);
        });
        it("adds new vertex in current sub graph", async () => {
            let scenario = await new LeaveContextChoiceAScenario();
            let center = scenario.getCenterInTree();
            let techChoice = TestUtil.getChildDeepWithLabel(center, "tech choice");
            let relation = techChoice.getParentBubble();
            relation.inverse();
            await relation.controller().leaveContextDo();
            let newDestinationVertex = relation.getNextBubble();
            expect(
                CurrentSubGraph.get().hasUri(
                    newDestinationVertex.getUri()
                )
            ).toBeTruthy();
        });
    });
});