import Mock from './mock/Mock'
import ThreeScenario from "./scenario/ThreeScenario";
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'

describe("IdUri", () => {
    it("can give schema short id from uri", function () {
        expect(
            IdUri.getGraphElementShortIdFromUri(
                "/service/users/foo/graph/schema/40e520f2-be43-4de8-8843-cf9c2e6dff92"
            )
        ).toBe("40e520f2-be43-4de8-8843-cf9c2e6dff92");
    });
    it("can convert schema id to not owned schema uri", function () {
        expect(
            IdUri.convertGraphElementUriToNonOwnedUri(
                "/service/users/foo/graph/schema/40e520f2-be43-4de8-8843-cf9c2e6dff92"
            )
        ).toBe(
            "/service/users/foo/non_owned/schema/40e520f2-be43-4de8-8843-cf9c2e6dff92"
        );
    });
    it("can get schema uri out of a schema property uri", function () {
        expect(
            IdUri.schemaUriOfProperty(
                "/service/users/oasivdj/graph/schema/d15066c1-b438-42fe-a340-e939560be6ae/property/ca7255c8-52b8-4bef-b18c-441ee24d763f"
            )
        ).toBe(
            "/service/users/oasivdj/graph/schema/d15066c1-b438-42fe-a340-e939560be6ae"
        );
    });
    xit("can tell if a uri is a schema uri", async () => {
        var schemaScenario = new Scenarios.getKaraokeSchemaGraph();
        expect(
            IdUri.isSchemaUri(
                schemaScenario.getSchema().getUri()
            )
        ).toBeTruthy();
        expect(
            IdUri.isSchemaUri(
                schemaScenario.getLocationProperty().getUri()
            )
        ).toBeFalsy();
        var threeBubblesScenario = new Scenarios.threeBubblesGraph();
        expect(
            IdUri.isSchemaUri(
                threeBubblesScenario.getBubble1().getUri()
            )
        ).toBeFalsy();
    });

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
        // var schema = new Scenarios.getProjectSchema().getSchemaInTree();
        // expect(
        //     IdUri.getGraphElementTypeFromUri(
        //         schema.getUri()
        //     )
        // ).toBe(GraphElementType.Schema);
        // expect(
        //     IdUri.getGraphElementTypeFromUri(
        //         schema.getTopMostChildBubble().getUri()
        //     )
        // ).toBe(GraphElementType.Property);
    });
    it("returns the schema url for when getting the html url of a property", function () {
        expect(
            IdUri.htmlUrlForBubbleUri(
                "/service/users/b/graph/schema/58365a48-db89-4dfc-9255-3a229f34fefb/property/6995642f-a8b0-4b9f-b183-68c6f32c80ea"
            )
        ).toBe(
            "/user/b/graph/schema/58365a48-db89-4dfc-9255-3a229f34fefb"
        );
    });
});