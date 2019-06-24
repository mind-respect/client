import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import MindMapInfo from '@/MindMapInfo'
import EdgeController from '@/edge/EdgeController'
import TestUtil from '../util/TestUtil'
import SimilarRelationsScenario from "../scenario/SimilarRelationsScenario";

describe("EdgeController", () => {
    describe("remove", function () {
        it("can", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            let numberOfChild = bubble1.getNumberOfChild();
            let relation1 = bubble1.getNextBubble();
            MindMapInfo.setIsAnonymous(false);
            MindMapInfo._setIsViewOnly(false);
            await new EdgeController.RelationController(
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
                bubble1.model().getNumberOfConnectedEdges()
            ).toBe(
                2
            );
            let relation1 = bubble1.getNextBubble();
            await relation1.getController().remove(true);
            expect(
                bubble1.model().getNumberOfConnectedEdges()
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
            await new EdgeController.RelationController(
                TestUtil.getChildWithLabel(bubble1, "r1")
            ).addChild();
            expect(
                TestUtil.getChildWithLabel(bubble1, "r1").isGroupRelation()
            ).toBeTruthy();
        });

        it("after adding a child, the new group relation has the original relation as an identifier", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            MindMapInfo._setIsViewOnly(false);
            let relation1 = TestUtil.getChildWithLabel(bubble1, "r1");
            let relation1Uri = relation1.getUri();
            await new EdgeController.RelationController(
                relation1
            ).addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(bubble1, "r1");
            let identifierExternalResourceUri = newGroupRelation.getIdentification().getExternalResourceUri();
            expect(
                identifierExternalResourceUri
            ).toBe(relation1Uri);
        });

        it("when a relation has an identifier adding a child changes to a group relation where the identifier is not the relation but the identifier", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            let relation1 = TestUtil.getChildWithLabel(bubble1, "r1");
            let tag = TestUtil.dummyIdentifier();
            tag.setLabel("moustache")
            relation1.model().addIdentification(tag);
            await new EdgeController.RelationController(
                relation1
            ).addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(bubble1, "moustache");
            let identifierExternalResourceUri = newGroupRelation.getIdentification().getExternalResourceUri();
            expect(
                identifierExternalResourceUri
            ).toBe(tag.getExternalResourceUri());
        });

        it("adds new relation under the group relation when adding a child to a relation under a group relation", async () => {
            let scenario = await new SimilarRelationsScenario();
            let centerVertex = scenario.getCenterInTree();
            expect(
                centerVertex.getNumberOfChild()
            ).toBe(
                4
            );
            let groupRelation = TestUtil.getChildWithLabel(
                centerVertex,
                "Possession"
            );
            groupRelation.expand();
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(3);
            let relationUnderGroupRelation = groupRelation.getNextBubble();
            await relationUnderGroupRelation.getController().addChild();
            expect(
                centerVertex.getNumberOfChild()
            ).toBe(4);
        });

        it("adds all the identifiers of the relation to the the new child relation when adding a child", async () => {
            let scenario = await new SimilarRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            let relationUnderGroupRelation = TestUtil.getChildWithLabel(
                groupRelation,
                "Possessed by book 2"
            );
            let tested = false;
            await relationUnderGroupRelation.getController().addChild().then((triple) => {
                expect(
                    triple.edge.model().getIdentifiers().length
                ).toBe(2);
                tested = true;
            });
            expect(
                tested
            ).toBeTruthy();
        });

        it("does not duplicate relations under the new group relation", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getBubble1InTree();
            let newRelation;
            await center.getController().addChild().then(function (tripleUi) {
                newRelation = tripleUi.edge;
            });
            await newRelation.getController().addChild();
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
        MindMapInfo._setIsViewOnly(false);
        new EdgeController.RelationController(
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
        MindMapInfo._setIsViewOnly(false);
        new EdgeController.RelationController(
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
        let changeSourceVertexSpy = Mock.getSpy(
            "EdgeService",
            "changeSourceVertex"
        );
        let changeDestinationVertexSpy = Mock.getSpy(
            "EdgeService",
            "changeDestinationVertex"
        );
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
        await r2.getController().replaceParentVertex(
            b2
        );
        expect(
            changeSourceVertexSpy.mock.calls.length
        ).toBe(1);
        expect(
            changeDestinationVertexSpy.mock.calls.length
        ).toBe(0);
        await r2.getController().reverse();
        await r2.getController().replaceParentVertex(
            b1
        );
        expect(
            changeSourceVertexSpy.mock.calls.length
        ).toBe(1);
        expect(
            changeDestinationVertexSpy.mock.calls.length
        ).toBe(1);
    });
    it("can add a child to a relation under a group relation", async () => {
        let scenario = await new SimilarRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let centerBubble = scenario.getCenterInTree();
        let centerBubbleNumberOfChild = centerBubble.getNumberOfChild();
        let relationUnderGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            relationUnderGroupRelation.isGroupRelation()
        ).toBeFalsy();
        await relationUnderGroupRelation.getController().addChild();
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
        let scenario = await new SimilarRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let relationUnderGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            relationUnderGroupRelation.isGroupRelation()
        ).toBeFalsy();
        await relationUnderGroupRelation.getController().addChild();
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
        it("excludes self identifier when adding a child and already having identifiers", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                centerBubble,
                "r1"
            );
            let identifier = TestUtil.dummyIdentifier();
            identifier.setLabel("some identifier");
            r1.model().addIdentification(
                identifier
            );
            await r1.getController().addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "some identifier"
            );
            expect(
                newGroupRelation.isGroupRelation()
            ).toBeTruthy();
            let newRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "some identifier"
            );
            expect(
                newGroupRelation.model().getIdentifiers().length
            ).toBe(1);
        });
        it("includes previous vertex in group relation model vertices", async () => {
            let scenario = await new SimilarRelationsScenario();
            let center = scenario.getCenterInTree();
            await scenario.getOtherRelationInTree().getController().addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            expect(
                Object.keys(
                    newGroupRelation.getVertices()
                ).length
            ).toBe(2);
        });
        xit("can add child to a relation under a group relation where the external uri is this relation's uri", async () => {
            let scenario = await new SimilarRelationsScenario();
            let center = scenario.getCenterInTree();
            await center.getController().addChild().then(async (tripleUi) => {
                let newEdge = tripleUi.edge;
                tripleUi.destination.getController().setLabel("top vertex");
                newEdge.getController().setLabel("parent group relation");
                return newEdge.getController().addChild();
            });
            let parentGroupRelation = TestUtil.getChildWithLabel(
                center,
                "parent group relation"
            );
            expect(parentGroupRelation.isGroupRelation()).toBeTruthy();
            let topMostEdge = parentGroupRelation.getNextBubble();
            await topMostEdge.getController().setLabel("top most edge");
            expect(
                topMostEdge.getUri()
            ).toBe(parentGroupRelation.getIdentification().getExternalResourceUri());
            expect(
                parentGroupRelation.getNumberOfChild()
            ).toBe(2);
            await topMostEdge.getController().addChild();
            expect(
                parentGroupRelation.getNumberOfChild()
            ).toBe(2);
            topMostEdge = TestUtil.getChildWithLabel(
                parentGroupRelation,
                "top most edge"
            );
            expect(
                topMostEdge.isGroupRelation()
            ).toBeTruthy();
            expect(
                topMostEdge.getNumberOfChild()
            ).toBe(2);
        });
    });
    describe("becomeParent", function () {
        it("adds it's identifiers to the moved edge when becoming a parent", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );

            let b3 = r2.getNextBubble();
            let r1 = TestUtil.getChildWithLabel(
                centerBubble,
                "r1"
            );
            r1.model().addIdentification(
                TestUtil.dummyIdentifier()
            );
            expect(
                r2.model().getIdentifiers().length
            ).toBe(0);
            await b3.getController().moveUnderParent(r1);
            expect(
                r2.model().getIdentifiers().length
            ).toBe(1);
        });
        it("adds the relation's identifier to the child relation", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );
            let b3 = r2.getNextBubble();
            let r1 = TestUtil.getChildWithLabel(
                centerBubble,
                "r1"
            );
            expect(
                r2.model().getIdentifiersIncludingSelf().length
            ).toBe(1);
            await b3.getController().moveUnderParent(r1);
            expect(
                r2.model().getIdentifiersIncludingSelf().length
            ).toBe(2);
        });

        xit("can become parent of a relation", async () => {
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
                r1.getController()._canMoveUnderParent(r2)
            ).toBeTruthy();
            await r1.getController().moveUnderParent(r2);
            await scenario.nextTickPromise(5);
            r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );
            expect(r2.isGroupRelation()).toBeTruthty();
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
        xit("can become parent of a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var center = scenario.getCenterInTree();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            var otherRelation = TestUtils.getChildWithLabel(
                center,
                "other relation"
            );
            groupRelation.expand();
            expect(
                TestUtils.hasChildWithLabel(
                    otherRelation,
                    "Possession"
                )
            ).toBeFalsy();
            groupRelation.getController().moveUnderParent(otherRelation);
            otherRelation = TestUtils.getChildWithLabel(
                center,
                "other relation"
            );
            expect(
                TestUtils.hasChildWithLabel(
                    otherRelation,
                    "Possession"
                )
            ).toBeTruthy();
        });
    });
});