import Mock from '../mock/Mock'
import SingleAndTaggedToEventScenario from '../scenario/SingleAndTaggedToEventScenario'

describe("MetaControllerSpec", () => {
    describe("expand", () => {
        it("has right parent bubble for child meta relation", async () => {
            let scenario = await new SingleAndTaggedToEventScenario();
            let single = scenario.getCenterInTree();
            await single.controller().showTags();
            let meta = single.getNextBubble().getNextBubble();
            await scenario.expandEventTag(meta);
            let metaRelation = meta.getNextBubble();
            expect(
                metaRelation.getParentBubble().getLabel()
            ).toBe("Event")
        });
        it("has right parent bubble for meta relation", async () => {
            let scenario = await new SingleAndTaggedToEventScenario();
            let single = scenario.getCenterInTree();
            await single.controller().showTags();
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