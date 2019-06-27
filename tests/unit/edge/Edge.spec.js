import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import MindMapInfo from '@/MindMapInfo'
import EdgeController from '@/edge/EdgeController'
import TestUtil from '../util/TestUtil'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import Selection from '@/Selection'
import GraphElementType from '@/graph-element/GraphElementType'
import RelationAsIdentifierScenario from "../scenario/RelationsAsIdentifierScenario";

describe("Edge", () => {
    it("can inverse", async () => {
        let scenario = await new ThreeScenario();
        let edge1 = scenario.getRelation1InTree();
        expect(
            edge1.isInverse()
        ).toBeFalsy();
        let centerBubble = scenario.getCenterBubbleInTree();
        expect(
            edge1.getSourceVertex().getUri()
        ).toBe(centerBubble.getUri());
        let b2 = scenario.getBubble2();
        expect(
            edge1.getDestinationVertex().getUri()
        ).toBe(b2.getUri());
        edge1.inverse();
        expect(
            edge1.isInverse()
        ).toBeTruthy();
        expect(
            edge1.getSourceVertex().getUri()
        ).toBe(b2.getUri());
        expect(
            edge1.getDestinationVertex().getUri()
        ).toBe(centerBubble.getUri());
    });
    it("can get child vertex in display", async () => {
        let scenario = await new ThreeScenario();
        let edge1 = scenario.getRelation1InTree();
        let b2 = scenario.getBubble2();
        expect(
            edge1.getNextBubble().getUri()
        ).toBe(b2.getUri());
    });

    it("can get child vertex in display even if inverse", async () => {
        let scenario = await new ThreeScenario();
        let edge1 = scenario.getRelation1InTree();
        let b2 = scenario.getBubble2();
        edge1.inverse();
        expect(
            edge1.getNextBubble().getUri()
        ).toBe(b2.getUri());
    });

    it("can get child vertex in display even if inverse", async () => {
        let scenario = await new ThreeScenario();
        let edge1 = scenario.getRelation1InTree();
        let b2 = scenario.getBubble2();
        edge1.inverse();
        expect(
            edge1.getNextBubble().getUri()
        ).toBe(b2.getUri());
    });

    it("unshrinks when moved away from group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let relationUnderGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        await relationUnderGroupRelation.getController().setLabel(
            groupRelation.text()
        );
        expect(
            relationUnderGroupRelation.isShrinked()
        ).toBeTruthy();
        let otherBubble = scenario.getOtherRelationInTree().getNextBubble();
        await relationUnderGroupRelation.getNextBubble().getController().moveUnderParent(
            otherBubble
        );
        expect(
            relationUnderGroupRelation.isShrinked()
        ).toBeFalsy();
    });
    it("reviews isShrinked when moved away from group relation to another group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let centerBubble = scenario.getCenterInTree();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let relationUnderGroupRelation = groupRelation.getNextBubble().getDownBubble();
        expect(
            relationUnderGroupRelation.isRelation()
        ).toBeTruthy();
        relationUnderGroupRelation.setLabel("Possession");
        expect(
            relationUnderGroupRelation.isShrinked()
        ).toBeTruthy();
        let otherGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "original relation"
        );
        expect(
            otherGroupRelation.isGroupRelation()
        ).toBeTruthy();
        await relationUnderGroupRelation.getNextBubble().getController().moveUnderParent(
            otherGroupRelation
        );
        expect(
            relationUnderGroupRelation.isShrinked()
        ).toBeFalsy();
    });

    it("sets the new group relation at the same index of the relation when adding a child", async () => {
        let scenario = await new ThreeScenario();
        let centerBubble = scenario.getCenterBubbleInTree();
        await centerBubble.getController().addChild();
        await centerBubble.getController().addChild();
        let relation = centerBubble.getNextBubble();
        let indexInTypes = [GraphElementType.Relation, GraphElementType.GroupRelation];
        expect(
            relation._getIndexInTreeInTypes(indexInTypes)
        ).toBe(0);
        await relation.getController().addChild();
        let newGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            relation.text()
        );
        expect(
            newGroupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            newGroupRelation._getIndexInTreeInTypes(indexInTypes)
        ).toBe(0);
    });

    it("removes the parent group relation when removing the last relation under a group relation", async () => {
        let scenario = await new RelationAsIdentifierScenario();
        let centerBubble = scenario.getCenterInTree();
        expect(
            TestUtil.hasChildWithLabel(
                centerBubble,
                "original some relation"
            )
        ).toBeTruthy();
        let groupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "original some relation"
        );
        groupRelation.visitClosestChildVertices(function (vertex) {
            vertex.remove();
        });
        expect(
            TestUtil.hasChildWithLabel(
                centerBubble,
                "original some relation"
            )
        ).toBeFalsy();
    });

    it("removes the parent group relation when moving away the last relation under a group relation", async () => {
        let scenario = await new RelationAsIdentifierScenario();
        let centerBubble = scenario.getCenterInTree();
        let bubbleNotUnderAGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "some different relation"
        ).getNextBubble();

        let originalSomeRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "original some relation"
        );
        expect(
            originalSomeRelation.isGroupRelation()
        ).toBeTruthy();
        let groupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "original some relation"
        );
        await Promise.all(groupRelation.getClosestChildVertices().map((vertex) => {
            return vertex.getController().moveUnderParent(bubbleNotUnderAGroupRelation);
        }));
        expect(
            TestUtil.hasChildWithLabel(
                centerBubble,
                "original some relation"
            )
        ).toBeFalsy();
    });
});