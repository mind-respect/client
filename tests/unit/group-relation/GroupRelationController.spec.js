import Mock from '../mock/Mock'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import ThreeScenario from "../scenario/ThreeScenario";
import GroupRelationHavingAVertexChildWithOneChild from '../scenario/GroupRelationHavingAVertexChildWithOneChild'
import TestUtil from '../util/TestUtil'
import GraphElementType from "../../../src/graph-element/GraphElementType";


describe("GroupRelationController", () => {
    it("can show tags", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionInTree = scenario.getPossessionGroupRelation();
        expect(
            possessionInTree.controller().showTagsCanDo()
        ).toBeTruthy();
    });
    describe("addChild", function () {
        it("makes new child public if parent vertex is public", async () => {
            let scenario = await new GroupRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.getParentVertex().makePublic();
            possessionInTree.addIdentification(
                TestUtil.dummyTag()
            );
            let triple = await possessionInTree.controller().addChild();
            expect(
                triple.destination.isPublic()
            ).toBeTruthy();
        });
        it("adds new child at the bottom of the others when not expanded", async () => {
            let scenario = await new GroupRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            await scenario.expandPossession(possessionInTree);
            possessionInTree.collapse();
            expect(
                possessionInTree.canExpand()
            ).toBeTruthy();
            let newChildVertex;
            let nbChild = possessionInTree.getNumberOfChild();
            let triple = await possessionInTree.controller().addChild();
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
            await scenario.expandPossession(groupRelation);
            let book1 = groupRelation.getNextBubble().getNextBubble();
            expect(
                book1.getLabel()
            ).toBe("book 1");
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 2");
            await book1.controller().addSibling();
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("");
        })
    });

    describe("expand", function () {
        it("also expands child bubbles having only one child", async () => {
            let scenario = await new GroupRelationHavingAVertexChildWithOneChild();
            let tshirtGroupRelation = scenario.getTshirtGroupRelationInTree();
            await scenario.expandTShirtGroupRelation(tshirtGroupRelation);
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
            let color = shirt2.getNextBubble();
            expect(
                color.getLabel()
            ).toBe("color")
            expect(
                color.getNextBubble().getLabel()
            ).toBe("red")
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
            await scenario.expandPossession(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "other relation"
                )
            ).toBeFalsy();
            await otherRelation.controller().moveUnderParent(groupRelation);
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
            await scenario.expandPossession(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "original relation"
                )
            ).toBeFalsy();
            expect(
                otherGroupRelation.controller()._canMoveUnderParent(groupRelation)
            ).toBeTruthy();
            await otherGroupRelation.controller().moveUnderParent(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "original relation"
                )
            ).toBeTruthy();
        });
    });
    describe("becomeExParent", function () {
        it("converts to relation if only one child left", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                center,
                "r1"
            );
            await r1.controller().addChild();
            let groupRelation = TestUtil.getChildWithLabel(
                center,
                "r1"
            );
            let b2 = groupRelation.getNextBubble().getNextBubble();
            expect(
                b2.getLabel()
            ).toBe("b2");
            await b2.controller().moveAbove(groupRelation);
            r1 = TestUtil.getChildWithLabel(
                center,
                "r1"
            );
            expect(
                r1.getGraphElementType()
            ).toBe(GraphElementType.Relation);
        });
    });
});