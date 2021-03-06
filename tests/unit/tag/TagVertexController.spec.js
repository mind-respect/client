import Mock from '../mock/Mock'
import SingleAndTaggedToEventScenario from '../scenario/SingleAndTaggedToEventScenario'

describe("TagVertexControllerSpec", () => {
    describe("expand", () => {
        it("has right parent bubble for meta relation", async () => {
            let scenario = await new SingleAndTaggedToEventScenario();
            let single = scenario.getCenterInTree();
            await single.controller().showTags(true, false, true);
            let event = single.getNextBubble().getNextBubble();
            expect(
                event.getParentBubble().getParentBubble().getLabel()
            ).toBe("single tagged to event");
            await scenario.expandEventTag(event);
            expect(
                event.getParentBubble().getParentBubble().getLabel()
            ).toBe("single tagged to event");
        });
    });
});