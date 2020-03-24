import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import Selection from '@/Selection'
import TestUtil from '../util/TestUtil'
import CreationDateScenario from "../scenario/CreationDateScenario";
import RelationsAsTagScenario from "../scenario/RelationsAsTagScenario";
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import Command from '@/Command'
import AppController from '@/AppController'
import GraphServiceMock from '../mock/GraphServiceMock'
import SameLevelRelationsWithMoreThanOneCommonTagScenario
    from "../scenario/SameLevelRelationsWithMoreThanOneCommonTagScenario";
import SingleAndTaggedToEventScenario from '../scenario/SingleAndTaggedToEventScenario'
import GraphElementType from '@/graph-element/GraphElementType'
import TwoLevelGroupRelationScenario from "../scenario/TwoLevelGroupRelationScenario";
import GraphElementService from "../../../src/graph-element/GraphElementService";
import GraphElementController from '@/graph-element/GraphElementController'
import VertexController from '@/vertex/VertexController'
import ShareLevel from '@/vertex/ShareLevel'

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
            await b2.controller().remove(true);
            expect(
                Selection.getSingle().isSameBubble(b1)
            ).toBeTruthy();
        });

        it("selects the parent vertex after remove if it was the last vertex under a group relation", async () => {
            let scenario = await new RelationsAsTagScenario();
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
                return vertex.controller().removeDo();
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
            await r1.controller().removeDo();
            expect(
                Selection.isSelected(b1)
            ).toBeTruthy();
        });
        it("can still remove graph elements when a group relation is in the selection", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            groupRelation.selectTree();
            await Selection.controller().removeDo();
            expect(
                TestUtil.hasChildWithLabel(
                    center,
                    "Possession"
                )
            ).toBeFalsy();
        });
        it("can remove a vertex under a meta that is not center", async () => {
            let scenario = await new SingleAndTaggedToEventScenario();
            let single = scenario.getCenterInTree();
            await single.controller().showTags();
            let event = single.getNextBubble().getNextBubble();
            expect(
                event.getLabel()
            ).toBe("Event");
            expect(
                event.getGraphElementType()
            ).toBe(GraphElementType.Meta);
            event.getNumberOfChild();
            await scenario.expandEventTag(event);
            expect(
                event.getNumberOfChild()
            ).toBe(5);
            let vertexUnderMeta = event.getNextBubble().getNextBubble();
            expect(
                vertexUnderMeta.getGraphElementType()
            ).toBe(GraphElementType.Vertex);
            await vertexUnderMeta.controller().removeDo();
            expect(
                event.getNumberOfChild()
            ).toBe(4);
        });
        it("sets nb neighbors", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            expect(
                b1.getNbNeighbors().getTotal()
            ).toBe(
                2
            );
            let nbNeighborsAfterRemoved;
            jest.spyOn(GraphElementService, "setNbNeighbors").mockImplementation(async (graphElement) => {
                nbNeighborsAfterRemoved = graphElement.getNbNeighbors();
            });
            await TestUtil.getChildWithLabel(
                b1,
                "r1"
            ).getNextBubble().controller().removeDo();
            expect(
                nbNeighborsAfterRemoved.getTotal()
            ).toBe(
                1
            );
        });
        it("sets nb neighbors only once", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let nbNeighborsAfterRemoved;
            jest.clearAllMocks();
            jest.spyOn(GraphElementService, "setNbNeighbors").mockImplementation(async (graphElement) => {
                nbNeighborsAfterRemoved = graphElement.getNbNeighbors();
            });
            await new GraphElementController.GraphElementController([
                TestUtil.getChildWithLabel(
                    b1,
                    "r1"
                ).getNextBubble(),
                TestUtil.getChildWithLabel(
                    b1,
                    "r2"
                ).getNextBubble()
            ]).removeDo();
            expect(
                GraphElementService.setNbNeighbors.mock.calls.length
            ).toBe(1);
            expect(
                nbNeighborsAfterRemoved.getTotal()
            ).toBe(
                0
            );
        });
        it("sets nb neighbors to source and destination vertex when removing edge", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            jest.clearAllMocks();
            let r1 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            );
            let b2 = r1.getNextBubble();
            expect(
                b2.getNbNeighbors().getTotal()
            ).toBe(3);
            let graphElementsNbNeighborsIsSet = [];
            jest.spyOn(GraphElementService, "setNbNeighbors").mockImplementation(async (graphElement) => {
                graphElementsNbNeighborsIsSet.push(graphElement);
            });
            await r1.controller().removeDo();
            expect(
                GraphElementService.setNbNeighbors.mock.calls.length
            ).toBe(2);
            expect(
                graphElementsNbNeighborsIsSet[0].getUri()
            ).toBe(b1.getUri());
            expect(
                graphElementsNbNeighborsIsSet[1].getUri()
            ).toBe(b2.getUri());
            expect(
                graphElementsNbNeighborsIsSet[1].getNbNeighbors().getTotal()
            ).toBe(2);
        });
        it("sets nb neighbors considering removed children and relation", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            jest.clearAllMocks();
            let r1 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            );
            let b2 = r1.getNextBubble();
            expect(
                b2.getNbNeighbors().getTotal()
            ).toBe(3);
            await scenario.expandBubble2(b2);
            let childOfB2 = b2.getNextBubble().getNextBubble();
            let graphElementsNbNeighborsIsSet = [];
            jest.spyOn(GraphElementService, "setNbNeighbors").mockImplementation(async (graphElement) => {
                graphElementsNbNeighborsIsSet.push(graphElement);
            });
            await new GraphElementController.GraphElementController([
                r1,
                childOfB2
            ]).removeDo();
            expect(
                GraphElementService.setNbNeighbors.mock.calls.length
            ).toBe(2);
            expect(
                graphElementsNbNeighborsIsSet[1].getUri()
            ).toBe(b2.getUri());
            expect(
                graphElementsNbNeighborsIsSet[1].getNbNeighbors().getTotal()
            ).toBe(1);
        });
        it("changes nb neighbors of tags", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let b2 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            ).getNextBubble();
            let tag = TestUtil.dummyTag();
            tag.getNbNeighbors().incrementForShareLevel(ShareLevel.PRIVATE);
            tag.getNbNeighbors().incrementForShareLevel(ShareLevel.PRIVATE);
            b2.addIdentification(tag);
            let graphElementsNbNeighborsIsSet = [];
            jest.spyOn(GraphElementService, "setNbNeighbors").mockImplementation(async (graphElement) => {
                graphElementsNbNeighborsIsSet.push(graphElement);
            });
            await b2.controller().removeDo();
            expect(
                graphElementsNbNeighborsIsSet[1].getUri()
            ).toBe(tag.getUri());
            expect(
                graphElementsNbNeighborsIsSet[1].getNbNeighbors().getTotal()
            ).toBe(1);
        });
        it("changes nb neighbors of tags of related edges", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            );
            let b2 = r1.getNextBubble();
            let tag = TestUtil.dummyTag();
            tag.getNbNeighbors().incrementForShareLevel(ShareLevel.PRIVATE);
            tag.getNbNeighbors().incrementForShareLevel(ShareLevel.PRIVATE);
            r1.addIdentification(tag);
            let graphElementsNbNeighborsIsSet = [];
            jest.spyOn(GraphElementService, "setNbNeighbors").mockImplementation(async (graphElement) => {
                graphElementsNbNeighborsIsSet.push(graphElement);
            });
            await b2.controller().removeDo();
            expect(
                graphElementsNbNeighborsIsSet.length
            ).toBe(2);
            expect(
                graphElementsNbNeighborsIsSet[1].getUri()
            ).toBe(tag.getUri());
            expect(
                graphElementsNbNeighborsIsSet[1].getNbNeighbors().getTotal()
            ).toBe(1);
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
        b1Fork.controller().accept();
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
                b7.controller().collapseCanDo()
            ).toBeFalsy();
            await scenario.expandBubble7(b7);
            expect(
                b7.controller().collapseCanDo()
            ).toBeTruthy();
        });
        it("shows the expand button to bubbles having hidden relations", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            expect(
                b2.controller().expandCanDo()
            ).toBeTruthy();
        });
        it("does not show the expand bubbles button when there are no descendants to expand", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(
                b2
            );
            expect(
                b2.controller().expandCanDo()
            ).toBeFalsy();
        });
        it("does not show the collapse button to bubbles having the hidden relations container", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            expect(
                b2.canExpand()
            ).toBeTruthy();
            expect(
                b2.controller().collapseCanDo()
            ).toBeFalsy();
            await scenario.expandBubble2(
                b2
            );
            expect(
                b2.canExpand()
            ).toBeFalsy();
            expect(
                b2.controller().collapseCanDo()
            ).toBeTruthy();
        });
        it("returns true when center bubble has child vertices that are expanded", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            expect(
                b1.controller().collapseCanDo()
            ).toBeFalsy();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b1.controller().collapseCanDo()
            ).toBeTruthy();
        });
        it("returns true when center vertex has an expanded group relation child", async () => {
            let scenario = await new GroupRelationsScenario();
            let centerBubble = scenario.getCenterInTree();
            TestUtil.getChildWithLabel(
                centerBubble,
                "original relation"
            ).collapse();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.collapse();
            expect(
                centerBubble.controller().collapseCanDo()
            ).toBeFalsy();
            groupRelation.expand();
            expect(
                centerBubble.controller().collapseCanDo()
            ).toBeTruthy();
        });
    });
    describe("moveAbove", function () {
        it("prevents from moving above self", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            Command._reset();
            expect(
                Command.canUndo()
            ).toBeFalsy();
            let r1 = b2.getParentBubble();
            await b2.controller().moveAbove(r1);
            expect(
                Command.canUndo()
            ).toBeFalsy();
        });

        it("adds the group relation identifier to a vertex when moving around another vertex that is under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let otherBubbleEdge = scenario.getOtherRelationInTree();
            let otherBubble = otherBubbleEdge.getNextBubble();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            let groupRelationChild = groupRelation.getNextBubble();
            expect(
                otherBubbleEdge.hasIdentifications()
            ).toBeFalsy();
            await otherBubble.controller().moveAbove(
                groupRelationChild
            );
            expect(
                otherBubbleEdge.hasIdentifications()
            ).toBeTruthy();
        });
        it("removes the identifier of the relation under the group relation when moving above another bubble", async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            let relationUnderGroupRelation = TestUtil.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            expect(
                relationUnderGroupRelation.hasIdentification(
                    groupRelation.getIdentification()
                )
            ).toBeTruthy();
            let vertex = relationUnderGroupRelation.getNextBubble();
            await vertex.controller().moveAbove(
                scenario.getOtherRelationInTree().getNextBubble()
            );
            expect(
                relationUnderGroupRelation.hasIdentification(
                    groupRelation.getIdentification()
                )
            ).toBeFalsy();
        });
    });

    describe("moveBelow", function () {
        it("prevents from moving below self", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            Command._reset();
            expect(
                Command.canUndo()
            ).toBeFalsy();
            let r1 = b2.getParentBubble();
            await b2.controller().moveBelow(r1);
            expect(
                Command.canUndo()
            ).toBeFalsy();
        });
        it("can undo and redo", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(b7);
            Command._reset();
            let b72 = TestUtil.getChildWithLabel(
                b7,
                "r72"
            ).getNextBubble();
            let b73 = TestUtil.getChildWithLabel(
                b7,
                "r73"
            ).getNextBubble();
            expect(b73.getUpBubble().isSameBubble(
                b72
            )).toBeTruthy();
            await b72.controller().moveBelow(
                b73.getParentBubble()
            );
            expect(
                b72.getUpBubble().getLabel()
            ).toBe("b73");
            await AppController.undo();
            expect(
                b72.getUpBubble().getLabel()
            ).toBe("b71");
            await AppController.redo();
            expect(
                b72.getUpBubble().getLabel()
            ).toBe("b73");
        });

        it("can move a group relation below another vertex", async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            let otherVertex = scenario.getOtherRelationInTree().getNextBubble();
            expect(
                otherVertex.getParentVertex().getLabel()
            ).toBe("me")
            let triple = await otherVertex.controller().addChild();
            let deepVertex = triple.destination;
            expect(
                deepVertex.getDownBubble().text()
            ).not.toBe("Possession");
            expect(
                deepVertex.isVertex()
            ).toBeTruthy();
            await groupRelation.controller().moveBelow(
                deepVertex
            );
            expect(
                deepVertex.getDownBubble().text()
            ).toBe("Possession");
        });
    });
    describe("moveUnderParent", function () {
        it("can undo and redo", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let b2 = scenario.getBubble2InTree();
            let b3 = scenario.getBubble3InTree();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeTruthy();
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB3()
            );
            await b2.controller().moveUnderParent(b3);
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeFalsy();
            await AppController.undo();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeTruthy();
            await AppController.redo();
            expect(
                b2.getParentVertex().isSameBubble(
                    b1
                )
            ).toBeFalsy();
        });
        it("removes the identifier of the relation under the group relation when moving under another bubble", async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            let relationUnderGroupRelation = TestUtil.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            expect(
                relationUnderGroupRelation.hasIdentification(
                    groupRelation.getIdentification()
                )
            ).toBeTruthy();
            let vertex = relationUnderGroupRelation.getNextBubble();
            await vertex.controller().moveUnderParent(
                scenario.getOtherRelationInTree().getNextBubble()
            );
            expect(
                relationUnderGroupRelation.hasIdentification(
                    groupRelation.getIdentification()
                )
            ).toBeFalsy();
        });
        it("removes all the identifier to the relation under the group relation when moving under another bubble", async () => {
            let scenario = await new SameLevelRelationsWithMoreThanOneCommonTagScenario();
            let centerBubble = scenario.getCenterInTree();
            let groupRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "Creator"
            );
            let groupRelationUnderGroupRelation = TestUtil.getChildWithLabel(
                groupRelation,
                "Possession"
            );
            let relationWithTwoIdentifiers = groupRelationUnderGroupRelation.getNextBubble();
            expect(
                relationWithTwoIdentifiers.getIdentifiers().length
            ).toBe(2);
            let vertex = relationWithTwoIdentifiers.getNextBubble();
            let otherBubble = TestUtil.getChildWithLabel(
                centerBubble,
                "other relation"
            ).getNextBubble();
            expect(
                otherBubble.isVertex()
            ).toBeTruthy();
            await vertex.controller().moveUnderParent(
                otherBubble
            );
            expect(
                relationWithTwoIdentifiers.getIdentifiers().length
            ).toBe(0);
        });
        it("adds all the identifier to the relation when moving under a group relation", async () => {
            let scenario = await new SameLevelRelationsWithMoreThanOneCommonTagScenario();
            let centerBubble = scenario.getCenterInTree();
            let otherRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            expect(
                otherRelation.getIdentifiers().length
            ).toBe(0);
            let groupRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "Creator"
            );
            let groupRelationUnderGroupRelation = TestUtil.getChildWithLabel(
                groupRelation,
                "Possession"
            );
            var otherBubble = otherRelation.getNextBubble();
            await otherBubble.controller().moveUnderParent(
                groupRelationUnderGroupRelation
            );
            expect(
                otherRelation.getIdentifiers().length
            ).toBe(2);
        });

        it("does not add the identifiers related to the child group relations when moving under a group relation", async () => {
            let scenario = await new SameLevelRelationsWithMoreThanOneCommonTagScenario();
            let centerBubble = scenario.getCenterInTree();
            let otherRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            expect(
                otherRelation.getIdentifiers().length
            ).toBe(0);
            let groupRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "Creator"
            );
            let otherBubble = otherRelation.getNextBubble();
            await otherBubble.controller().moveUnderParent(
                groupRelation
            );
            expect(
                otherRelation.getIdentifiers().length
            ).toBe(1);
        });
    });
    describe("_canMoveUnderParent", function () {
        it("return false if it's parent vertex", async () => {
            let scenario = await new ThreeScenario();
            let bubble1 = scenario.getBubble1InTree();
            let bubble2 = scenario.getBubble2InTree();
            expect(
                bubble2.controller()._canMoveUnderParent(bubble1)
            ).toBe(false);
        });
        it("return false if it's parent relation", async () => {
            let scenario = await new ThreeScenario();
            let bubble2 = scenario.getBubble2InTree();
            expect(
                bubble2.controller()._canMoveUnderParent(bubble2.getParentBubble())
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
            await b73.controller().moveUpOneStep();
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
            await b72.controller().moveDownOneStep();
            expect(
                b72.getUpBubble().getLabel()
            ).toBe("b73");
        });
        it("can move under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let possesion = scenario.getPossessionGroupRelation();
            let book1 = possesion.getNextBubble().getNextBubble();
            expect(
                book1.getParentFork().isGroupRelation()
            ).toBeTruthy();
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 2");
            await book1.controller().moveDownOneStep();
            expect(
                book1.getParentFork().isGroupRelation()
            ).toBeTruthy();
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 3");
        });
        it("keeps under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let possession = scenario.getPossessionGroupRelation();
            await scenario.getOtherRelationInTree().getNextBubble().controller().moveAbove(possession);
            let book1 = possession.getNextBubble().getNextBubble();
            expect(
                book1.getParentFork().getLabel()
            ).toBe("Possession");
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 2");
            await book1.controller().moveUpOneStep();
            expect(
                book1.getParentFork().getLabel()
            ).toBe("Possession");
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 2");
        });
        it("moves around the group relation and does not go inside", async () => {
            let scenario = await new GroupRelationsScenario();
            let possession = scenario.getPossessionGroupRelation();
            let center = scenario.getCenterInTree();
            let otherVertex = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            expect(
                otherVertex.getLabel()
            ).toBe("other bubble");
            await otherVertex.controller().moveBelow(possession);
            otherVertex = possession.getDownBubble().getNextBubble();
            expect(
                otherVertex.getLabel()
            ).toBe("other bubble");
            expect(
                otherVertex.getParentFork().getLabel()
            ).toBe("me");
            expect(
                otherVertex.getUpBubble().getLabel()
            ).toBe("Possession");
            await otherVertex.controller().moveUpOneStep();
            expect(
                otherVertex.getParentFork().getLabel()
            ).toBe("me");
        })
    });
    describe("_moveToExecute", () => {

    });

    describe("becomeParent", () => {
    });

    describe("showTags", () => {
        it("shows tags as children", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getCenterInTree();
            let tag = TestUtil.dummyTag();
            tag.setLabel("new tag");
            center.addIdentification(
                tag
            );
            expect(
                center.getNumberOfChild()
            ).toBe(2);
            await center.controller().showTags();
            expect(
                center.getNumberOfChild()
            ).toBe(3);
            let newTag = TestUtil.getChildDeepWithLabel(
                center,
                "new tag"
            );
            expect(
                newTag
            ).toBeDefined();
        });
        it("has the right parent bubble for the meta relation", async () => {
            let scenario = await new SingleAndTaggedToEventScenario();
            let single = scenario.getCenterInTree();
            await single.controller().showTags();
            let metaRelation = single.getNextBubble();
            expect(
                metaRelation.getGraphElementType()
            ).toBe(GraphElementType.MetaRelation);
            expect(
                metaRelation.getParentBubble().getLabel()
            ).toBe("single tagged to event");
        });
        it("has the right parent bubble for meta", async () => {
            let scenario = await new SingleAndTaggedToEventScenario();
            let single = scenario.getCenterInTree();
            await single.controller().showTags();
            let event = single.getNextBubble().getNextBubble();
            expect(
                event.getParentBubble().getParentBubble().getLabel()
            ).toBe("single tagged to event");
        });
    });
    describe("setShareLevelDo", () => {
        it("does not make public already public vertices when making a collection public", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            b2.model().makePublic();
            let hasCalledService = false;
            let nbVerticesToMakePublic = 0;
            jest.spyOn(GraphElementService, "setCollectionShareLevel").mockImplementation((shareLevel, vertices) => {
                hasCalledService = true;
                nbVerticesToMakePublic = vertices.length;
                return Promise.resolve();
            });
            await new VertexController.VertexController([
                scenario.getBubble1InTree(),
                b2,
                scenario.getBubble3InTree()
            ]).setShareLevelDo(ShareLevel.PUBLIC);
            expect(
                hasCalledService
            ).toBeTruthy();
            expect(
                nbVerticesToMakePublic
            ).toBe(2);
        });
        it("does not make private already private vertices when making a collection private", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            b1.model().makePublic();
            let b3 = scenario.getBubble3InTree();
            b3.model().makePublic();
            let hasCalledService = false;
            let nbVerticesToMakePrivate = 0;
            jest.spyOn(GraphElementService, "setCollectionShareLevel").mockImplementation((shareLevel, vertices) => {
                hasCalledService = true;
                nbVerticesToMakePrivate = vertices.length;
                return Promise.resolve();
            });
            await new GraphElementController.GraphElementController([
                b1,
                scenario.getBubble2InTree(),
                b3
            ]).setShareLevelDo(ShareLevel.PRIVATE);
            expect(
                hasCalledService
            ).toBeTruthy();
            expect(
                nbVerticesToMakePrivate
            ).toBe(2);
        });
        it("can change the nb neighbors of the tags of a related edge", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            );
            let b2 = r1.getNextBubble();
            b1.setShareLevel(ShareLevel.PUBLIC);
            b2.setShareLevel(ShareLevel.PUBLIC);
            expect(
                r1.getShareLevel()
            ).toBe(ShareLevel.PUBLIC);
            let tag = TestUtil.dummyTag();
            tag.getNbNeighbors().incrementForShareLevel(ShareLevel.PUBLIC);
            r1.addIdentification(tag);
            let tagNbNeighbors = tag.getNbNeighbors();
            expect(
                tagNbNeighbors.getTotal()
            ).toBe(1);
            expect(
                tagNbNeighbors.getPublic()
            ).toBe(1);
            expect(
                tagNbNeighbors.getFriend()
            ).toBe(0);
            await b2.controller().setShareLevelDo(ShareLevel.FRIENDS);
            expect(
                r1.getShareLevel()
            ).toBe(ShareLevel.FRIENDS);
            tagNbNeighbors = tag.getNbNeighbors();
            expect(
                tagNbNeighbors.getTotal()
            ).toBe(1);
            expect(
                tagNbNeighbors.getPublic()
            ).toBe(0);
            expect(
                tagNbNeighbors.getFriend()
            ).toBe(1);
        });
    });
});