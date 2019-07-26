import Mock from '../mock/Mock'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import ThreeScenario from "../scenario/ThreeScenario";
import GroupRelationHavingAVertexChildWithOneChild from '../scenario/GroupRelationHavingAVertexChildWithOneChild'
import GraphServiceMock from '../mock/GraphServiceMock'
import TestUtil from '../util/TestUtil'
import RelationAsIdentifierScenario from "../scenario/RelationsAsIdentifierScenario";


describe("GroupRelationController", () => {
    it("can identify", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionInTree = scenario.getPossessionGroupRelation();
        expect(
            possessionInTree.getController().identifyCanDo()
        ).toBeTruthy();
    });
    describe("addChild", function () {
        it("gives all it's identifiers to the new relation when adding a child", async () => {
            let scenario = await new GroupRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.model().addIdentification(
                TestUtil.dummyIdentifier()
            );
            let triple = await possessionInTree.getController().addChild();
            expect(
                triple.edge.getIdentifiers().length
            ).toBe(2);
        });
        it("makes new child public if parent vertex is public", async () => {
            let scenario = await new GroupRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.getParentVertex().makePublic();
            possessionInTree.addIdentification(
                TestUtil.dummyIdentifier()
            );
            let triple = await possessionInTree.getController().addChild();
            expect(
                triple.destination.isPublic()
            ).toBeTruthy();
        });
        it("adds new child at the bottom of the others when not expanded", async () => {
            let scenario = await new GroupRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.collapse();
            expect(
                possessionInTree.canExpand()
            ).toBeTruthy();
            let newChildVertex;
            let nbChild = possessionInTree.getNumberOfChild();
            let triple = await possessionInTree.getController().addChild();
            newChildVertex = triple.destination;
            expect(
                possessionInTree.getNumberOfChild()
            ).toBe(nbChild + 1);
            expect(
                newChildVertex.getIndexInTree()
            ).toBe(
                possessionInTree.getNumberOfChild() - 1
            );
        });
        it('adds new sibling under a vertex under a group relation', async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            let book1 = groupRelation.getNextBubble().getNextBubble();
            expect(
                book1.getLabel()
            ).toBe("book 1");
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 2");
            await book1.getController().addSibling();
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("");
        })
    });

    describe("expand", function () {
        it("also expands child bubbles having only one child", async () => {
            let scenario = await new GroupRelationHavingAVertexChildWithOneChild();
            let tshirtGroupRelation = scenario.getTshirtGroupRelationInTree();
            GraphServiceMock.getForCentralBubbleUriAndGraph(
                scenario.getShirt2VertexUri(),
                scenario.getShirt2Graph()
            );
            tshirtGroupRelation.expand();
            let shirt2 = TestUtil.getChildWithLabel(
                tshirtGroupRelation,
                "shirt2"
            ).getNextBubble();
            expect(
                shirt2.isVertex()
            ).toBeTruthy();
            expect(
                shirt2.getNumberOfChild()
            ).toBe(1);
        });
    });
    describe("becomeParent", function () {
        it("can become parent of an edge", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            groupRelation.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "other relation"
                )
            ).toBeFalsy();
            await otherRelation.getController().moveUnderParent(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "other relation"
                )
            ).toBeTruthy();
        });
        it("can become parent of a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherGroupRelation = TestUtil.getChildWithLabel(
                center,
                "original relation"
            );
            groupRelation.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "original relation"
                )
            ).toBeFalsy();
            expect(
                otherGroupRelation.getController()._canMoveUnderParent(groupRelation)
            ).toBeTruthy();
            await otherGroupRelation.getController().moveUnderParent(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "original relation"
                )
            ).toBeTruthy();
        });
    });
    describe("becomeExParent", () => {
        it("can exclude the original relation", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getCenterInTree();
            let r1 = TestUtil.getChildWithLabel(
                center,
                "r1"
            );
            await r1.getController().addChild();
            let g1 = TestUtil.getChildWithLabel(
                center,
                "r1"
            );
            expect(
                g1.isGroupRelation()
            ).toBeTruthy();
            r1 = g1.getNextBubble();
            r1.setLabel("original r1 relation");
            await r1.getController().moveAbove(scenario.getBubble3InTree());
            r1 = TestUtil.getChildWithLabel(
                center,
                "original r1 relation"
            );
            expect(
                r1.isGroupRelation()
            ).toBeFalsy();
        });
    });
});