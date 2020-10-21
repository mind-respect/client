import Mock from './mock/Mock'
import ThreeScenario from "./scenario/ThreeScenario";
import Selection from '@/Selection'
import VertexController from '@/vertex/VertexController'
import RelationController from '@/relation/RelationController'
import GraphElementController from '@/graph-element/GraphElementController'
import TestUtil from './util/TestUtil'
import GroupRelationsScenario from "./scenario/GroupRelationsScenario";
import GraphElementType from '@/graph-element/GraphElementType'

describe("Selection", () => {
    it("can tell if only one vertex is selected", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        Selection.removeAll();
        expect(
            Selection.isSingle()
        ).toBeFalsy();
        Selection.add(b2);
        expect(
            Selection.isSingle()
        ).toBeTruthy();
    });

    it("gets only vertices if selected bubble is vertex", async () => {
        let scenario = await new ThreeScenario();
        let center = scenario.getBubble1InTree();
        Selection.setToSingle(center);
        await scenario.nextTickPromise();
        expect(
            Selection.getSelectedElements().filter((selected) => {
                return selected.isEdge();
            }).length
        ).toBe(0);
        expect(
            Selection.getSelectedElements().filter((selected) => {
                return selected.isVertex();
            }).length
        ).toBe(1);
        center.selectTree();
        expect(
            Selection.getSelectedElements().filter((selected) => {
                return selected.isEdge();
            }).length
        ).toBe(0);
        expect(
            Selection.getSelectedElements().filter((selected) => {
                return selected.isVertex();
            }).length
        ).toBe(3);
    });

    describe("getController", () => {
        it("returns VertexController when made of multiple vertices", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let b2 = scenario.getBubble2InTree();
            Selection.add(b1);
            Selection.add(b2);
            expect(
                Selection.controller() instanceof VertexController.VertexController
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
                Selection.controller() instanceof RelationController.RelationController
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
                Selection.controller() instanceof GraphElementController.GraphElementController
            ).toBeTruthy();
        });
    });
    describe("isContinuous", () => {
        it('returns true if continuous', async () => {
            let scenario = await new ThreeScenario();
            let b3 = scenario.getBubble3InTree();
            await scenario.expandBubble3(b3);
            Selection.setToSingle(b3);
            b3.getClosestChildVertices().forEach((child) => {
                Selection.add(child);
            });
            expect(
                Selection.getNbSelected()
            ).toBe(3);
            expect(Selection.isContinuous()).toBeTruthy();
        });
        it('returns false if not continuous', async () => {
            let scenario = await new ThreeScenario();
            let b3 = scenario.getBubble3InTree();
            await scenario.expandBubble3(b3);
            Selection.setToSingle(b3);
            b3.getClosestChildVertices().forEach((child) => {
                Selection.add(child);
            });
            Selection.add(scenario.getBubble2InTree());
            expect(
                Selection.getNbSelected()
            ).toBe(4);
            expect(Selection.isContinuous()).toBeFalsy();
        });
        it('works with group relation in the mix', async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = TestUtil.getChildWithLabel(
                center,
                "Possession"
            );
            expect(
                groupRelation.getGraphElementType()
            ).toBe(GraphElementType.GroupRelation);
            Selection.setToSingle(center);
            Selection.add(groupRelation);
            expect(Selection.isContinuous()).toBeTruthy();
            await scenario.expandPossession(groupRelation);
            Selection.setToSingle(center);
            Selection.add(groupRelation);
            expect(Selection.isContinuous()).toBeTruthy();
            let vertexUnderGroupRelation = groupRelation.getNextBubble().getNextBubble();
            expect(
                vertexUnderGroupRelation.getGraphElementType()
            ).toBe(GraphElementType.Vertex);
            Selection.add(vertexUnderGroupRelation);
            expect(
                Selection.getNbSelected()
            ).toBe(3);
            expect(Selection.isContinuous()).toBeTruthy();
        });
    });
});