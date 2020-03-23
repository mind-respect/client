import Mock from './mock/Mock'
import ThreeScenario from "./scenario/ThreeScenario";
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'

describe("IdUri", () => {
    it("can return the graph element type from it's uri", async () => {
        let scenario = await new ThreeScenario();
        var bubble = scenario.getBubble1InTree();
        expect(
            IdUri.getGraphElementTypeFromUri(
                bubble.getUri()
            )
        ).toBe(GraphElementType.Vertex);
        expect(
            IdUri.getGraphElementTypeFromUri(
                bubble.getNextBubble().getUri()
            )
        ).toBe(GraphElementType.Relation);
    });

});