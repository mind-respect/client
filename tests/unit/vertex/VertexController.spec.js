import Mock from '../mock/Mock'
import ThreeScenario from "../scenarios/ThreeScenario"
import GraphWithSimilarRelationsScenario from '../scenarios/GraphWithSimilarRelationsScenario'
import TestUtil from '../util/TestUtil'

describe('VertexController', () => {
    beforeEach(() => {
        Mock.applyDefault();
    });
    describe("becomeParent", function () {
        it("increments number of child", async () => {
            let scenario = await new ThreeScenario();
            let bubble1 = scenario.getBubble1InTree();
            let bubble2 = scenario.getBubble2InTree();
            let newChild = await bubble1.getController().addChild().then(function (triple) {
                return triple.destination;
            });
            await bubble2.getController().moveUnderParent(newChild);
            expect(
                newChild.getModel().getNumberOfChild()
            ).toBe(1);
            newChild.collapse();
            expect(
                newChild.getModel().getNumberOfChild()
            ).toBe(1);
        });
        xit("can become parent of a group relation", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let center = scenario.getCenterVertexInTree();
            let groupRelation = scenario.getPossessionAsGroupRelation();
            let otherVertex = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            groupRelation.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    otherVertex,
                    "Possession"
                )
            ).toBeFalsy();
            await groupRelation.getController().moveUnderParent(otherVertex);
            otherVertex = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            expect(
                TestUtil.hasChildWithLabel(
                    otherVertex,
                    "Possession"
                )
            ).toBeTruthy();
        });
        xit("does not remove the relation's tag when moving a group relation", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let center = scenario.getCenterVertexInTree();
            let groupRelation = scenario.getPossessionAsGroupRelation();
            let otherVertex = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            groupRelation.expand();
            let groupRelationNumberOfChild = groupRelation.getNumberOfChild();
            await groupRelation.getController().moveUnderParent(otherVertex);
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(groupRelationNumberOfChild);
        });
    });
})
