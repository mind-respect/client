import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import SelectionHandler from '@/SelectionHandler'
import TestUtil from '../util/TestUtil'
import FriendlyResource from '@/friendly-resource/FriendlyResource'

describe("FriendlyResource", () => {
    it("includes label comment and uri when building server format from ui", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        bubble1.setComment("some comment");
        let serverFormat = FriendlyResource.buildServerFormatFromUi(
            bubble1
        );
        let facade = FriendlyResource.fromServerFormat(
            serverFormat
        );
        expect(
            facade.getLabel()
        ).toBe("b1");
        expect(
            facade.getComment()
        ).toBe("some comment");
        expect(
            facade.getUri()
        ).toBe(bubble1.getUri());
    });
    it("returns child with deepest depth", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        await scenario.expandBubble2(b2);
        b2.getNextBubble().getNextBubble().setLabel("long text");
        let b1 = scenario.getBubble1InTree();
        let deepestDescendant = b1.getDeepestDescendant();
        expect(
            deepestDescendant.getLabel()
        ).toBe("long text")
    });
});