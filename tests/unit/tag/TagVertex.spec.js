import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import TestUtil from '../util/TestUtil'
import GraphElementType from '@/graph-element/GraphElementType'

describe("TagVertex", () => {
    it("removes tag in bubbles when removing tag", async () => {
        let scenario = await new ThreeScenario();
        let center = scenario.getCenterInTree();
        let b3 = TestUtil.getChildDeepWithLabel(
            center,
            "b3"
        );
        await scenario.expandBubble3(b3);
        await b3.controller().showTags();
        let tagRelation = b3.getClosestChildrenOfType(GraphElementType.MetaRelation)[0];
        expect(
            tagRelation.getGraphElementType()
        ).toBe(GraphElementType.MetaRelation);
        let tagVertex = tagRelation.getNextBubble();
        expect(
            b3.getIdentifiers().length
        ).toBe(1);
        await tagVertex.controller().removeDo();
        expect(
            b3.getIdentifiers().length
        ).toBe(0);
    });
});