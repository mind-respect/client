import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import Selection from '@/Selection'
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
    describe("moveTo", () => {
        it("changes direction when moving to the other side", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b2.isToTheLeft()
            ).toBeFalsy();
            let b3 = scenario.getBubble3InTree();
            expect(
                b3.isToTheLeft()
            ).toBeTruthy();
            let deepChild = b2.getNextBubble().getNextBubble();
            expect(
                deepChild.isToTheLeft()
            ).toBeFalsy();
            await deepChild.getController().moveAbove(b3);
            expect(
                deepChild.isToTheLeft()
            ).toBeTruthy();
        });
        it("preserves the direction of the edge when moving", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b2.isToTheLeft()
            ).toBeFalsy();
            let b3 = scenario.getBubble3InTree();
            expect(
                b3.isToTheLeft()
            ).toBeTruthy();
            let deepChild = b2.getNextBubble().getNextBubble();
            expect(
                deepChild.getParentBubble().isInverse()
            ).toBeFalsy();
            await deepChild.getController().moveAbove(b3);
            expect(
                deepChild.getParentBubble().isInverse()
            ).toBeFalsy();
        });
        it("prevents duplicates when moving to the other side", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getCenterInTree();
            let numberOfChild = center.getNumberOfChild();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b2.isToTheLeft()
            ).toBeFalsy();
            let b3 = scenario.getBubble3InTree();
            expect(
                b3.isToTheLeft()
            ).toBeTruthy();
            await b2.getController().moveAbove(b3);
            expect(
                center.getNumberOfChild()
            ).toBe(numberOfChild);
        });
    })
});