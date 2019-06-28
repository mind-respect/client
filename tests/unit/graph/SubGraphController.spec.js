import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import CurrentSubGraph from '@/graph/CurrentSubGraph'

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
        await vertexUnderB2.getController().moveUnderParent(b3);
        let r3 = b3.getNextBubble();
        expect(
            r3.getSourceVertex().getLabel()
        ).toBe("b3");
        expect(
            r3.getSourceVertex().getId()
        ).toBe(b3.getId());
        expect(
            CurrentSubGraph.get().getVertexWithUri(
                b3.getUri()
            ).getId()
        ).toBe(b3.getId());
    });
});