import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import PublicPrivateScenario from "../scenario/PublicPrivateScenario";
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
        let b2 = scenario.getBubble2InTree();
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
        let b2 = scenario.getBubble2InTree();
        expect(
            edge1.getNextBubble().getUri()
        ).toBe(b2.getUri());
    });

    it("can get child vertex in display even if inverse", async () => {
        let scenario = await new ThreeScenario();
        let edge1 = scenario.getRelation1InTree();
        let b2 = scenario.getBubble2InTree();
        edge1.inverse();
        expect(
            edge1.getNextBubble().getUri()
        ).toBe(b2.getUri());
    });

    it("can get child vertex in display even if inverse", async () => {
        let scenario = await new ThreeScenario();
        let edge1 = scenario.getRelation1InTree();
        let b2 = scenario.getBubble2InTree();
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
        expect(
            relationUnderGroupRelation.isInverse()
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
            relation.getIndexInTree(indexInTypes)
        ).toBe(0);
        let relationText = relation.getLabel();
        await relation.getController().addChild();
        let newGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            relationText
        );
        expect(
            newGroupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            newGroupRelation.getIndexInTree(indexInTypes)
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
    it("sets to private if both source and destination vertex are private", async () => {
        let scenario = await new ThreeScenario();
        let b1 = scenario.getBubble1InTree();
        let b2 = scenario.getBubble2InTree();
        expect(
            b1.isPublic()
        ).toBeFalsy();
        expect(
            b2.isPublic()
        ).toBeFalsy();
        let relation1 = TestUtil.getChildWithLabel(b1, "r1");
        expect(
            relation1.isPublic()
        ).toBeFalsy();
    });
    it("sets to public if both source and destination vertex are public", async () => {
        let scenario = await new PublicPrivateScenario();
        let bubble1 = scenario.getBubble1();
        let relation1 = TestUtil.getChildWithLabel(bubble1, "r1");
        expect(
            relation1.isPublic()
        ).toBeTruthy();
    });
    it("sets to private if source or destination vertex is private", async () => {
        let scenario = await new PublicPrivateScenario();
        let bubble1 = scenario.getBubble1();
        let relation2 = TestUtil.getChildWithLabel(bubble1, "r2");
        expect(
            relation2.isPublic()
        ).toBeFalsy();
    });
    it("makes outgoing edge private when making vertex private", async () => {
        let scenario = await new PublicPrivateScenario();
        let bubble1 = scenario.getBubble1();
        let relation1 = TestUtil.getChildWithLabel(bubble1, "r1");
        expect(
            relation1.isPublic()
        ).toBeTruthy();
        bubble1.makePrivate();
        expect(
            relation1.isPublic()
        ).toBeFalsy();
    });
    it("makes incoming edge private when making vertex private", async () => {
        let scenario = await new PublicPrivateScenario();
        let bubble2 = scenario.getBubble2();
        let relation1 = bubble2.getParentBubble();
        expect(
            relation1.isPublic()
        ).toBeTruthy();
        bubble2.makePrivate();
        expect(
            relation1.isPublic()
        ).toBeFalsy();
    });
    it("makes edge public when making both vertices public", async () => {
        let scenario = await new PublicPrivateScenario();
        let bubble1 = scenario.getBubble1();
        bubble1.makePrivate();
        let relation2 = TestUtil.getChildWithLabel(bubble1, "r2");
        let bubble2 = relation2.getNextBubble();
        expect(
            relation2.isPublic()
        ).toBeFalsy();
        bubble2.makePublic();
        expect(
            relation2.isPublic()
        ).toBeFalsy();
        bubble1.makePublic();
        expect(
            relation2.isPublic()
        ).toBeTruthy();
    });
});