import Mock from '../mock/Mock'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import RelationWithMultipleTagsScenario from "../scenario/RelationWithMultipleTagsScenario";
import ThreeScenario from "../scenario/ThreeScenario"
import GroupRelation from '@/group-relation/GroupRelation'
import TestUtil from '../util/TestUtil'
import Tag from '@/tag/Tag'
import ConvertVertexToGroupRelationScenario from "../scenario/ConvertVertexToGroupRelationScenario";
import GraphElementType from "../../../src/graph-element/GraphElementType";
import GroupRelationAsChildScenario from "../scenario/GroupRelationAsChildScenario";

describe("GroupRelation", function () {
    it("can have multiple identifiers", async () => {
        let scenario = await new RelationWithMultipleTagsScenario();
        let relationWithMultipleTags = scenario.getComputerScientistRelation();
        let groupRelation = GroupRelation.usingIdentifiers(
            relationWithMultipleTags.getIdentifiers()
        );
        expect(
            groupRelation.getIdentifiers().length
        ).toBe(2);
    });
    it("can integrate a group relation to a greater depth than 1", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionGroupRelation = scenario.getPossessionGroupRelation();
        await scenario.expandPossession(possessionGroupRelation);
        let possessionOfBook3Relation = TestUtil.getChildWithLabel(
            possessionGroupRelation,
            "Possession of book 3"
        );
        expect(
            possessionOfBook3Relation.isGroupRelation()
        ).toBeTruthy();
        await scenario.expandPossession3(possessionOfBook3Relation);
        expect(
            possessionOfBook3Relation.getNumberOfChild()
        ).toBe(2);
    });
    it("sets the right label for a group relation at a greater depth than 1", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionGroupRelation = scenario.getPossessionGroupRelation();
        await scenario.expandPossession(possessionGroupRelation);
        let possessionOfBook3Relation = TestUtil.getChildWithLabel(
            possessionGroupRelation,
            "Possession of book 3"
        );
        expect(
            possessionOfBook3Relation.isGroupRelation()
        ).toBeTruthy();
        expect(
            possessionOfBook3Relation.text()
        ).toBe("Possession of book 3");
    });
    it("has right number of children when new", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getCenterBubbleInTree();
        let r1 = bubble1.getNextBubble();
        await r1.controller().addChild();
        let groupRelation = bubble1.getNextBubble();
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            groupRelation.getNumberOfChild()
        ).toBe(2);
    });
    xit("sets the right label for a relation duplicate", function () {
        var twoSimilarGroupRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup();
        var impactOnTheIndividualRelation = twoSimilarGroupRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext();
        expect(
            impactOnTheIndividualRelation.text()
        ).toBe(
            "Impact on the individual"
        );
        var impactOnSocietyGroupRelation = twoSimilarGroupRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext();
        expect(
            impactOnSocietyGroupRelation.text()
        ).toBe(
            "Impact on society"
        );
    });

    it("can expand and collapse", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionInTree = scenario.getPossessionGroupRelation();
        possessionInTree.expand();
        expect(
            possessionInTree.isCollapsed
        ).toBeFalsy();
        possessionInTree.collapse();
        expect(
            possessionInTree.isCollapsed
        ).toBeTruthy();
        possessionInTree.expand();
        expect(
            possessionInTree.isCollapsed
        ).toBeFalsy();
    });

    it("does not duplicate children when expanding while already expanded", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionInTree = scenario.getPossessionGroupRelation();
        await scenario.expandPossession(possessionInTree);
        expect(
            possessionInTree.canExpandDescendants()
        ).toBeTruthy();
        expect(
            possessionInTree.getNumberOfChild()
        ).toBe(3);
        possessionInTree.expand();
        expect(
            possessionInTree.getNumberOfChild()
        ).toBe(3);
    });


    it("has the label of the identification", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        expect(
            groupRelation.getLabel()
        ).toBe(
            "Possession"
        );
    });

    //todo
    xit("adds the image of it's identification", function () {
        var scenario = new Scenarios.groupRelationWithImage();
        var component = scenario.getComponentGroupRelationInTree();
        expect(
            component.hasImages()
        ).toBeFalsy();
        var idea = scenario.getIdeaGroupRelationInTree();
        expect(
            idea.hasImages()
        ).toBeTruthy();
    });

    it("sets the group relation label and comment correctly when identifying a relation to a new relation that exists at the same level", async () => {
        let scenario = await new ThreeScenario();
        var centerBubble = scenario.getBubble1InTree();
        await centerBubble.controller().addChild();
        let newRelation = TestUtil.getChildWithLabel(centerBubble, "");
        await newRelation.controller().setLabel("new relation");
        newRelation.setComment("some comment");
        let identificationToNewRelation = Tag.fromFriendlyResource(
            newRelation
        );
        let relation1 = TestUtil.getChildWithLabel(centerBubble, "r1");
        await relation1.controller().moveUnderParent(newRelation);
        expect(
            TestUtil.hasChildWithLabel(
                centerBubble,
                "new relation"
            )
        ).toBeTruthy();
        let newGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "new relation"
        );
        expect(
            newGroupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            newGroupRelation.getComment()
        ).toBe("some comment");
    });

    it("sets identifications", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionInTree = scenario.getPossessionGroupRelation();
        expect(
            possessionInTree.hasIdentifications()
        ).toBeTruthy();
    });
    xit("can handle the case where it's a meta relation that is removed", async () => {
        let scenario = new Scenarios.aroundEventTag();
        let eventBubble = scenario.getEventBubbleInTree();
        let metaRelation = eventBubble.getNextBubble();
        metaRelation.remove();
        metaRelation.controller().removeTag(metaRelation.model())
        expect(
            true
        ).toBeTruthy();
    });

    describe("addChild", () => {
        it("adds before tags", async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            await scenario.expandPossession(groupRelation);
            expect(
                groupRelation.getIdentifiers().length
            ).toBe(1);
            expect(
                groupRelation.getNextChildren().length
            ).toBe(3);
            await groupRelation.controller().showTags(true, false, true);
            expect(
                groupRelation.getNextChildren().length
            ).toBe(4);
            let lastChild = groupRelation.getNextChildren()[3].getNextBubble();
            expect(
                lastChild.getGraphElementType()
            ).toBe(GraphElementType.Meta);
            await groupRelation.controller().addChild();
            let beforeLastChild = groupRelation.getNextChildren()[3].getNextBubble();
            lastChild = groupRelation.getNextChildren()[4].getNextBubble();
            expect(
                beforeLastChild.getGraphElementType()
            ).toBe(GraphElementType.Vertex);
            expect(
                lastChild.getGraphElementType()
            ).toBe(GraphElementType.Meta);
        });
    });

    describe("removeChild", () => {
        it("sets remaining relation having empty label with removed group relation's label", async () => {
            let scenario = await new ConvertVertexToGroupRelationScenario();
            let b2 = await scenario.getExpandedB2();
            await b2.controller().convertToGroupRelation();
            let center = scenario.getCenterInTree();
            b2 = TestUtil.getChildWithLabel(
                center,
                "b2"
            );
            await b2.getNextBubble().controller().removeDo();
            let relation1 = b2.getNextBubble();
            let relation2 = relation1.getDownBubble().getParentBubble();
            expect(
                relation2.getLabel()
            ).toBe("");
            await b2.getNextBubble().controller().removeDo();
            expect(TestUtil.hasChildWithLabel(
                center,
                "b2"
            )).toBeTruthy();
            b2 = TestUtil.getChildWithLabel(
                center,
                "b2"
            );
            expect(
                b2.isEdge()
            ).toBeTruthy();
        })
    });
    it("does not duplicate source vertex when center is one of the child of the group relation", async () => {
        let scenario = await new GroupRelationAsChildScenario();
        let center = await scenario.getCenterInTree();
        let rCenter = center.getNextBubble();
        expect(
            rCenter.getLabel()
        ).toBe("rc1");
        let groupRelation = rCenter.getNextBubble();
        expect(
            groupRelation.getGraphElementType()
        ).toBe(GraphElementType.GroupRelation);
        expect(
            groupRelation.getParentBubble().getLabel()
        ).toBe("rc1");
        await scenario.expandGroupRelation(groupRelation);
        expect(
            groupRelation.getNumberOfChild()
        ).toBe(3)
    });
});
