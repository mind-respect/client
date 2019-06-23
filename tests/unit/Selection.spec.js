import Mock from './mock/Mock'
import ThreeScenario from "./scenario/ThreeScenario";
import Selection from '@/Selection'

describe("Selection", function () {
    it("can tell if only one vertex is selected", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        Selection.removeAll();
        expect(
            Selection.isSingle()
        ).toBeFalsy();
        Selection.addVertex(b2);
        expect(
            Selection.isSingle()
        ).toBeTruthy();
    });
});