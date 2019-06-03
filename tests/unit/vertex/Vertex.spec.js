import Mock from '../mock/Mock'
import ThreeScenario from "../scenarios/ThreeScenario";
import MindMapInfo from '@/MindMapInfo'

describe.only('Vertex', () => {
    beforeEach(() => {
        Mock.applyDefault();
    });
    describe("remove", function () {
        it("removes connected edges when removing a vertex", async () => {
            let threeBubbles = await new ThreeScenario();
            MindMapInfo._setIsViewOnly(false);
            let bubble1 = threeBubbles.getBubble1InTree(),
                r1 = threeBubbles.getRelation1InTree();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(2);
            let bubble2 = r1.getNextBubble();
            bubble2.remove();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(1);
        });
    });
});