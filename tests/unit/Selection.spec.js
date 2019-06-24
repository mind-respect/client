import Mock from './mock/Mock'
import ThreeScenario from "./scenario/ThreeScenario";
import Selection from '@/Selection'
import VertexController from '@/vertex/VertexController'
import EdgeController from '@/edge/EdgeController'
import GraphElementController from '@/graph-element/GraphElementController'
import TestUtil from './util/TestUtil'

describe("Selection", () => {
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

    //todo
    xit("gets only vertices if selected bubble is vertex", function () {
        var scenario = new Scenarios.threeBubblesGraph();
        var center = scenario.getBubble1InTree();
        expect(
            SelectionHandler.getNbSelectedRelations()
        ).toBe(0);
        expect(
            SelectionHandler.getNbSelectedVertices()
        ).toBe(0);
        center.selectTree();
        expect(
            SelectionHandler.getNbSelectedRelations()
        ).toBe(0);
        expect(
            SelectionHandler.getNbSelectedVertices()
        ).toBe(3);
    });

    describe("getController", () => {
        it("returns VertexController when made of multiple vertices", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let b2 = scenario.getBubble2InTree();
            Selection.addVertex(b1);
            Selection.addVertex(b2);
            expect(
                Selection.getController() instanceof VertexController.VertexController
            ).toBeTruthy();
        });
        it("returns EdgeController when made of multiple relations", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            );
            let r2 = TestUtil.getChildWithLabel(
                b1,
                "r2"
            );
            Selection.reset();
            Selection.add(r1);
            Selection.add(r2);
            expect(
                Selection.getController() instanceof EdgeController.RelationController
            ).toBeTruthy();
        });
        it("returns GraphElementController when made of different graph elements", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            );
            Selection.add(b1);
            Selection.add(r1);
            expect(
                Selection.getController() instanceof GraphElementController.GraphElementController
            ).toBeTruthy();
        });
    });
});