import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import ThreeLevelGroupRelationScenario from "../scenario/ThreeLevelGroupRelationScenario";
import TestUtil from "../util/TestUtil";

describe("SubGraphController", () => {
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
        let group2 = TestUtil.getChildWithLabel(group1, "group2");
        group2.expand();
        expect(
            group2.getNumberOfChild()
        ).toBe(4);
        let group3 = TestUtil.getChildWithLabel(group2, "group3");
        group3.expand();
        expect(
            group3.getNumberOfChild()
        ).toBe(3);
    });
});