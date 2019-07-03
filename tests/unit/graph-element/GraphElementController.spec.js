import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import Selection from '@/Selection'
import TestUtil from '../util/TestUtil'
import CreationDateScenario from "../scenario/CreationDateScenario";
import RelationAsIdentifierScenario from "../scenario/RelationsAsIdentifierScenario";
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";

describe('GraphElementController', () => {
    describe("removeDo", () => {
        it("selects the parent vertex when removed", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let b2 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            ).getNextBubble();
            Selection.setToSingle(b2);
            expect(
                Selection.getSingle().isSameBubble(b1)
            ).toBeFalsy();
            await b2.getController().remove(true);
            expect(
                Selection.getSingle().isSameBubble(b1)
            ).toBeTruthy();
        });

        it("selects the parent vertex after remove if it was the last vertex under a group relation", async () => {
            let scenario = await new RelationAsIdentifierScenario();
            Selection.reset();
            let centerBubble = scenario.getCenterInTree();
            expect(
                Selection.isSelected(centerBubble)
            ).toBeFalsy();
            let groupRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "original some relation"
            );
            await Promise.all(groupRelation.getClosestChildVertices().map((vertex) => {
                return vertex.getController().removeDo();
            }));
            expect(
                Selection.isSelected(centerBubble)
            ).toBeTruthy();
        });
        it("selects the parent vertex when relation is removed", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            );
            Selection.setToSingle(r1);
            expect(
                Selection.isSelected(b1)
            ).toBeFalsy();
            await r1.getController().removeDo();
            expect(
                Selection.isSelected(b1)
            ).toBeTruthy();
        });
    });
    xit("updates model label when accepting comparison", function () {
        var scenario = new Scenarios.threeBubblesGraphFork();
        var b1Fork = scenario.getBubble1InTree();
        TestUtils.enterCompareFlowWithGraph(
            SubGraph.fromServerFormat(
                new Scenarios.threeBubblesGraph().getGraph()
            )
        );
        b1Fork.setText("potatoe");
        b1Fork.getLabel().blur();
        expect(
            b1Fork.getModel().getLabel()
        ).toBe("potatoe");
        b1Fork.getController().accept();
        expect(
            b1Fork.getModel().getLabel()
        ).toBe("b1");
    });
    describe("collapseCanDo", function () {
        it("does not show collapse button to leaves", async () => {
            let scenario = await new CreationDateScenario();
            let b1 = scenario.getBubble1InTree();
            let b7 = TestUtil.getChildWithLabel(
                b1,
                "r6"
            ).getNextBubble();
            expect(
                b7.getController().collapseCanDo()
            ).toBeFalsy();
            await scenario.expandBubble7(b7);
            expect(
                b7.getController().collapseCanDo()
            ).toBeTruthy();
        });
        it("shows the expand button to bubbles having hidden relations", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            expect(
                b2.getController().expandCanDo()
            ).toBeTruthy();
        });
        it("does not show the expand bubbles button when there are no descendants to expand", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(
                b2
            );
            expect(
                b2.getController().expandCanDo()
            ).toBeFalsy();
        });
        it("does not show the collapse button to bubbles having the hidden relations container", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            expect(
                b2.canExpand()
            ).toBeTruthy();
            expect(
                b2.getController().collapseCanDo()
            ).toBeFalsy();
            await scenario.expandBubble2(
                b2
            );
            expect(
                b2.canExpand()
            ).toBeFalsy();
            expect(
                b2.getController().collapseCanDo()
            ).toBeTruthy();
        });
        fit("returns true when center bubble has child vertices that are expanded", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            expect(
                b1.getController().collapseCanDo()
            ).toBeFalsy();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b1.getController().collapseCanDo()
            ).toBeTruthy();
        });
        it("returns true when center vertex has an expanded group relation child", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerBubble = scenario.getCenterInTree();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            expect(
                centerBubble.getController().collapseCanDo()
            ).toBeFalsy();
            groupRelation.expand();
            expect(
                centerBubble.getController().collapseCanDo()
            ).toBeTruthy();
        });
    });
    describe("moveAbove", function () {
        it("can move a vertex above a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var otherBubble = scenario.getOtherRelationInTree().getTopMostChildBubble();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            otherBubble.getController().moveAbove(
                groupRelation
            );
            var grandParent = otherBubble.getParentBubble().getParentBubble();
            expect(
                grandParent.isSameUri(
                    scenario.getCenterInTree()
                )
            ).toBeTruthy();
        });

        it("prevents from moving above self", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            Command._reset();
            expect(
                Command.canUndo()
            ).toBeFalsy();
            var r1 = b2.getParentBubble();
            b2.getController().moveAbove(r1);
            expect(
                Command.canUndo()
            ).toBeFalsy();
        });

        it("adds the group relation identifier to a vertex when moving around another vertex that is under a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var otherBubbleEdge = scenario.getOtherRelationInTree();
            var otherBubble = otherBubbleEdge.getTopMostChildBubble();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var groupRelationChild = groupRelation.getTopMostChildBubble();
            expect(
                otherBubbleEdge.getModel().hasIdentifications()
            ).toBeFalsy();
            otherBubble.getController().moveAbove(
                groupRelationChild
            );
            expect(
                otherBubbleEdge.getModel().hasIdentifications()
            ).toBeTruthy();
        });
        it("removes the identifier of the relation under the group relation when moving above another bubble", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var relationUnderGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            expect(
                relationUnderGroupRelation.getModel().hasIdentification(
                    groupRelation.getModel().getIdentification()
                )
            ).toBeTruthy();
            var vertex = relationUnderGroupRelation.getTopMostChildBubble();
            vertex.getController().moveAbove(
                scenario.getOtherRelationInTree().getTopMostChildBubble()
            );
            expect(
                relationUnderGroupRelation.getModel().hasIdentification(
                    groupRelation.getModel().getIdentification()
                )
            ).toBeFalsy();
        });
    });

    describe("moveBelow", function () {
        it("prevents from moving below self", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            Command._reset();
            expect(
                Command.canUndo()
            ).toBeFalsy();
            var r1 = b2.getParentBubble();
            b2.getController().moveBelow(r1);
            expect(
                Command.canUndo()
            ).toBeFalsy();
        });
        it("can undo and redo", function () {
            var scenario = new Scenarios.creationDateScenario();
            var b7 = scenario.getBubble7InTree();
            scenario.expandBubble7(b7);
            Command._reset();
            var b72 = TestUtils.getChildWithLabel(
                b7,
                "r72"
            ).getTopMostChildBubble();
            var b73 = TestUtils.getChildWithLabel(
                b7,
                "r73"
            ).getTopMostChildBubble();
            expect(b73.getBubbleAbove().isSameBubble(
                b72
            )).toBeTruthy();
            b72.getController().moveBelow(
                b73.getParentBubble()
            );
            expect(b72.getBubbleAbove().isSameBubble(
                b73
            )).toBeTruthy();
            AppController.undo();
            expect(b73.getBubbleAbove().isSameBubble(
                b72
            )).toBeTruthy();
            AppController.redo();
            expect(b72.getBubbleAbove().isSameBubble(
                b73
            )).toBeTruthy();
        });

        it("can move a group relation below another vertex", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var otherVertex = scenario.getOtherRelationInTree().getTopMostChildBubble();
            var deepVertex;
            otherVertex.getController().addChild().then(function (tripleUi) {
                deepVertex = tripleUi.destinationVertex();
            });
            expect(
                deepVertex.getBubbleUnder().text()
            ).toBe("");
            groupRelation.getController().moveBelow(
                deepVertex
            );
            expect(
                deepVertex.getBubbleUnder().text()
            ).toBe("Possession");
        });
    });
    describe("moveUnderParent", function () {
        it("can undo and redo", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b1 = scenario.getBubble1InTree();
            var b2 = scenario.getBubble2InTree();
            var b3 = scenario.getBubble3InTree();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeTruthy();
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB3()
            );
            b2.getController().moveUnderParent(b3);
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeFalsy();
            AppController.undo();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeTruthy();
            AppController.redo();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeFalsy();
        });
        it("removes the identifier of the relation under the group relation when moving under another bubble", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var relationUnderGroupRelation = TestUtils.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            expect(
                relationUnderGroupRelation.getModel().hasIdentification(
                    groupRelation.getModel().getIdentification()
                )
            ).toBeTruthy();
            var vertex = relationUnderGroupRelation.getTopMostChildBubble();
            vertex.getController().moveUnderParent(
                scenario.getOtherRelationInTree().getTopMostChildBubble()
            );
            expect(
                relationUnderGroupRelation.getModel().hasIdentification(
                    groupRelation.getModel().getIdentification()
                )
            ).toBeFalsy();
        });
        it("removes all the identifier to the relation under the group relation when moving under another bubble", function () {
            var scenario = new Scenarios.sameLevelRelationsWithMoreThanOneCommonMetaScenario();
            var centerBubble = scenario.getCenterBubbleInTree();
            var groupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Creator"
            );
            var groupRelationUnderGroupRelation = groupRelation.getTopMostChildBubble();
            var relationWithTwoIdentifiers = groupRelationUnderGroupRelation.getTopMostChildBubble();
            expect(
                relationWithTwoIdentifiers.getModel().getIdentifiers().length
            ).toBe(2);
            var vertex = relationWithTwoIdentifiers.getTopMostChildBubble();
            var otherBubble = TestUtils.getChildWithLabel(
                centerBubble,
                "other relation"
            ).getTopMostChildBubble();
            expect(
                otherBubble.isVertex()
            ).toBeTruthy();
            vertex.getController().moveUnderParent(
                otherBubble
            );
            expect(
                relationWithTwoIdentifiers.getModel().getIdentifiers().length
            ).toBe(0);
        });
        it("adds all the identifier to the relation when moving under a group relation", function () {
            var scenario = new Scenarios.sameLevelRelationsWithMoreThanOneCommonMetaScenario();
            var centerBubble = scenario.getCenterBubbleInTree();
            var otherRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            expect(
                otherRelation.getModel().getIdentifiers().length
            ).toBe(0);
            var groupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Creator"
            );
            var groupRelationUnderGroupRelation = groupRelation.getTopMostChildBubble();
            var otherBubble = otherRelation.getTopMostChildBubble();
            otherBubble.getController().moveUnderParent(
                groupRelationUnderGroupRelation
            );
            expect(
                otherRelation.getModel().getIdentifiers().length
            ).toBe(2);
        });
        it("does not add the identifiers related to the child group relations when moving under a group relation", function () {
            var scenario = new Scenarios.sameLevelRelationsWithMoreThanOneCommonMetaScenario();
            var centerBubble = scenario.getCenterBubbleInTree();
            var otherRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            expect(
                otherRelation.getModel().getIdentifiers().length
            ).toBe(0);
            var groupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Creator"
            );
            var otherBubble = otherRelation.getTopMostChildBubble();
            otherBubble.getController().moveUnderParent(
                groupRelation
            );
            expect(
                otherRelation.getModel().getIdentifiers().length
            ).toBe(1);
        });
    });
    describe("_canMoveUnderParent", function () {
        it("return false if it's parent vertex", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble1 = scenario.getBubble1InTree();
            var bubble2 = scenario.getBubble2InTree();
            expect(
                bubble2.getController()._canMoveUnderParent(bubble1)
            ).toBe(false);
        });
        it("return false if it's parent relation", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var bubble2 = scenario.getBubble2InTree();
            expect(
                bubble2.getController()._canMoveUnderParent(bubble2.getParentBubble())
            ).toBe(false);
        });
    });
    describe("moveUpOneStep moveDownOneStep", () => {
        it("can move one step up", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(b7);
            let b73 = TestUtil.getChildWithLabel(
                b7,
                "r73"
            ).getNextBubble();
            expect(
                b73.getDownBubble().getLabel()
            ).toBe("b74");
            await b73.getController().moveUpOneStep();
            expect(
                b73.getDownBubble().getLabel()
            ).toBe("b72");
        });
        it("can move one step down", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(b7);
            let b72 = TestUtil.getChildWithLabel(
                b7,
                "r72"
            ).getNextBubble();
            expect(
                b72.getUpBubble().getLabel()
            ).toBe("b71");
            await b72.getController().moveDownOneStep();
            expect(
                b72.getUpBubble().getLabel()
            ).toBe("b73");
        });
        it("can move under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let possesion = scenario.getPossessionGroupRelation();
            let book1 = possesion.getNextBubble().getNextBubble();
            expect(
                book1.getParentVertexOrGroupRelation().isGroupRelation()
            ).toBeTruthy();
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 2");
            await book1.getController().moveDownOneStep();
            expect(
                book1.getParentVertexOrGroupRelation().isGroupRelation()
            ).toBeTruthy();
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 3");
        })
    });
    describe("_moveToExecute", () => {

    });
});