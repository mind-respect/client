import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import ThreeLevelGroupRelationScenario from "../scenario/ThreeLevelGroupRelationScenario";
import TestUtil from "../util/TestUtil";
import DeepGraphScenario from "../scenario/DeepGraphScenario";

describe("SubGraphLoader", () => {
    it("keeps the id of the parent vertex when it exists", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        await scenario.expandBubble2(b2);
        expect(
            b2.isToTheLeft()
        ).toBeFalsy();
        let b3 = scenario.getBubble3InTree();
        await scenario.expandBubble3(b3);
        let vertexUnderB2 = b2.getNextBubble().getNextBubble();
        await vertexUnderB2.controller().moveUnderParent(b3);
        let r3 = b3.getNextBubble();
        let b4 = r3.getNextBubble();
        expect(
            r3.getSourceVertex().getLabel()
        ).toBe("b3");
        expect(
            r3.getDestinationVertex().getId()
        ).toBe(b4.getId());
        expect(
            CurrentSubGraph.get().getVertexWithUri(
                b3.getUri()
            ).getId()
        ).toBe(b3.getId());
    });
    it("prevents duplicates when three level group relation", async () => {
        let scenario = await new ThreeLevelGroupRelationScenario();
        let center = scenario.getCenterInTree();
        let group1 = TestUtil.getChildWithLabel(center, "group1");
        expect(
            group1.getNumberOfChild()
        ).toBe(4);
        await scenario.expandGroup1(group1);
        let group2 = TestUtil.getChildWithLabel(group1, "group2");
        await scenario.expandGroup2(group2);
        expect(
            group2.getNumberOfChild()
        ).toBe(4);
        let group3 = TestUtil.getChildWithLabel(group2, "group3");
        await scenario.expandGroup3(group3);
        expect(
            group3.getNumberOfChild()
        ).toBe(3);
    });
    it("can initialize using a deep graph, with more than one depth", async () => {
        let scenario = await new DeepGraphScenario();
        let center = scenario.getCenterInTree();
        TestUtil.logChildren(center);
        expect(center.getNumberOfChild()).toBe(2);
    });
});