import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import MindMapInfo from '@/MindMapInfo'
import EdgeController from '@/edge/EdgeController'
import TestUtil from '../util/TestUtil'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import Selection from '@/Selection'

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

    fit("unshrinks when moved away from group relation", async () => {
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
    it("reviews edit button display when moved away from group relation to another group relation", function () {
        var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
        var centerBubble = scenario.getCenterVertexInTree();
        var groupRelation = scenario.getPossessionAsGroupRelationInTree();
        groupRelation.expand();
        var relationUnderGroupRelation = groupRelation.getTopMostChildBubble().getBubbleUnder();
        expect(
            relationUnderGroupRelation.isRelation()
        ).toBeTruthy();
        relationUnderGroupRelation.setText("Possession");
        expect(
            relationUnderGroupRelation.isSetAsSameAsGroupRelation()
        ).toBeTruthy();
        var otherGroupRelation = TestUtils.getChildWithLabel(
            centerBubble,
            "original relation"
        );
        expect(
            otherGroupRelation.isGroupRelation()
        ).toBeTruthy();
        relationUnderGroupRelation.getTopMostChildBubble().getController().moveUnderParent(
            otherGroupRelation
        );
        expect(
            relationUnderGroupRelation.isSetAsSameAsGroupRelation()
        ).toBeFalsy();
    });
    it("sets the new group relation at the same index of the relation when adding a child", function () {
        var centerBubble = new Scenarios.threeBubblesGraph().getCenterBubbleInTree();
        centerBubble.getController().addChild();
        centerBubble.getController().addChild();
        var relation = centerBubble.getTopMostChildBubble();
        var indexInTypes = [GraphElementType.Relation, GraphElementType.GroupRelation];
        expect(
            relation._getIndexInTreeInTypes(indexInTypes)
        ).toBe(0);
        relation.getController().addChild();
        var newGroupRelation = TestUtils.getChildWithLabel(
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
    it("removes the parent group relation when removing the last relation under a group relation", function () {
        var centerBubble = new Scenarios.withRelationsAsIdentifierGraph().getCenterInTree();
        expect(
            TestUtils.hasChildWithLabel(
                centerBubble,
                "original some relation"
            )
        ).toBeTruthy();
        var groupRelation = TestUtils.getChildWithLabel(
            centerBubble,
            "original some relation"
        );
        groupRelation.visitClosestChildVertices(function (vertex) {
            vertex.remove();
        });
        expect(
            TestUtils.hasChildWithLabel(
                centerBubble,
                "original some relation"
            )
        ).toBeFalsy();
    });
    it("removes the parent group relation when moving away the last relation under a group relation", function () {
        var centerBubble = new Scenarios.withRelationsAsIdentifierGraph().getCenterInTree();
        var bubbleNotUnderAGroupRelation = TestUtils.getChildWithLabel(
            centerBubble,
            "some different relation"
        ).getTopMostChildBubble();
        expect(
            TestUtils.hasChildWithLabel(
                centerBubble,
                "original some relation"
            )
        ).toBeTruthy();
        var groupRelation = TestUtils.getChildWithLabel(
            centerBubble,
            "original some relation"
        );
        groupRelation.visitClosestChildVertices(function (vertex) {
            vertex.moveToParent(
                bubbleNotUnderAGroupRelation
            );
        });
        expect(
            TestUtils.hasChildWithLabel(
                centerBubble,
                "original some relation"
            )
        ).toBeFalsy();
    });
});