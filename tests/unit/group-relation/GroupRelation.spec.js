import Mock from '../mock/Mock'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import RelationWithMultipleTagsScenario from "../scenario/RelationWithMultipleTagsScenario";
import RelationsAsTagScenario from '../scenario/RelationsAsTagScenario'
import ThreeScenario from "../scenario/ThreeScenario"
import GroupRelation from '@/group-relation/GroupRelation'
import TestUtil from '../util/TestUtil'
import Tag from '@/tag/Tag'
import IdUri from '@/IdUri'
import CreationDateScenario from "../scenario/CreationDateScenario";
import ConvertVertexToGroupRelationScenario from "../scenario/ConvertVertexToGroupRelationScenario";
import GraphElementType from '@/graph-element/GraphElementType'

describe("GroupRelation", function () {
    // scenario = new Scenarios.GraphWithSimilarRelationsScenario();
    // graph = scenario.getGraph();
    // centerVertex = scenario.getCenterVertex();
    // possession = scenario.getPossession();
    // groupRelation = GroupRelation.usingIdentification(possession);

    it("has identification", async () => {
        let scenario = await new GroupRelationsScenario();
        let possession = scenario.getPossession();
        let groupRelation = GroupRelation.usingIdentification(
            possession
        );
        expect(groupRelation.getIdentification().getUri()).toBe(
            possession.getUri()
        );
    });
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
        possessionGroupRelation.expand();
        let possessionOfBook3Relation = TestUtil.getChildWithLabel(
            possessionGroupRelation,
            "Possession of book 3"
        );
        expect(
            possessionOfBook3Relation.isGroupRelation()
        ).toBeTruthy();
        possessionOfBook3Relation.expand();
        expect(
            possessionOfBook3Relation.getNumberOfChild()
        ).toBe(2);
    });
    it("sets the right label for a group relation at a greater depth than 1", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionGroupRelation = scenario.getPossessionGroupRelation();
        possessionGroupRelation.expand();
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
        possessionInTree.expand();
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

    it('moves a relation under a "group relation" if newly added identification is related to a group relation', async () => {
        let scenario = await new GroupRelationsScenario();
        let centerBubble = scenario.getCenterInTree();
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(4);
        let possessionGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "Possession"
        );
        possessionGroupRelation.expand();
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(3);
        let otherRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "other relation"
        );
        let dummyIdentifier = Tag.withUriAndLabel(
            TestUtil.generateVertexUri(),
            "dummy identification"
        );
        await otherRelation.controller().addIdentification(dummyIdentifier);
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(4);
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(3);

        await otherRelation.controller().addIdentification(
            possessionGroupRelation.getIdentification()
        );
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(3);
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(4);
    });

    it("moves a relation to the group-relation's parent if the identification related to the group-relation is removed from the relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let centerBubble = scenario.getCenterInTree();
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(4);
        let possessionGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "Possession"
        );
        possessionGroupRelation.expand();
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(3);
        let otherRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "other relation"
        );
        let dummyIdentifier = Tag.withUriAndLabel(
            TestUtil.generateVertexUri(),
            "dummy identification"
        );
        await otherRelation.controller().addIdentification(dummyIdentifier);
        await otherRelation.controller().removeIdentifier(dummyIdentifier);
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(4);
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(3);
        let possessionRelation = TestUtil.getChildWithLabel(
            possessionGroupRelation,
            "Possession of book 1"
        );
        possessionRelation.controller().removeIdentifier(
            possessionGroupRelation.getIdentification()
        );
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(5);
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(2);
    });

    it("does not move a relation to the group relation's parent if the group relation is not related to the removed identification", async () => {
        let scenario = await new GroupRelationsScenario();
        let centerBubble = scenario.getCenterInTree();

        let possessionGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "Possession"
        );
        possessionGroupRelation.expand();
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(3);
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(4);
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(3);
        let possessionRelation = possessionGroupRelation.getNextBubble();
        let dummyIdentifier = Tag.withUriAndLabel(
            TestUtil.generateVertexUri(),
            "dummy identification"
        );
        possessionRelation.addIdentification(dummyIdentifier);
        possessionRelation.removeIdentifier(dummyIdentifier);
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(4);
        expect(
            possessionGroupRelation.getNumberOfChild()
        ).toBe(3);
    });


    it("creates a group-relation when adding an identification to a relation shared with another relation at the same level", async () => {
        let scenario = await new ThreeScenario();
        let centerBubble = scenario.getBubble1InTree();
        expect(TestUtil.hasChildWithLabel(
            centerBubble,
            "r1"
        )).toBeTruthy();
        expect(TestUtil.hasChildWithLabel(
            centerBubble,
            "r2"
        )).toBeTruthy();
        expect(TestUtil.hasChildWithLabel(
            centerBubble,
            "some identification"
        )).toBeFalsy();

        let someIdentification = Tag.withUriAndLabel(
            TestUtil.generateVertexUri(),
            "some identification"
        );
        let relation1 = TestUtil.getChildWithLabel(centerBubble, "r1");
        await relation1.controller().addIdentification(someIdentification);
        let relation2 = TestUtil.getChildWithLabel(centerBubble, "r2");
        await relation2.controller().addIdentification(someIdentification);
        expect(TestUtil.hasChildWithLabel(
            centerBubble,
            "some identification"
        )).toBeTruthy();
        let newGroupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "some identification"
        );
        expect(
            newGroupRelation.getNumberOfChild()
        ).toBe(2);
        expect(TestUtil.hasChildWithLabel(
            centerBubble,
            "r1"
        )).toBeFalsy();
        expect(TestUtil.hasChildWithLabel(
            centerBubble,
            "r2"
        )).toBeFalsy();
    });

    it("creates a group-relation when identifying a relation to a relation that exists at the same level", async () => {
        let scenario = await new ThreeScenario();
        let centerBubble = scenario.getBubble1InTree();
        expect(TestUtil.hasChildWithLabel(
            centerBubble,
            "r1"
        )).toBeTruthy();
        let r2 = TestUtil.getChildWithLabel(
            centerBubble,
            "r2"
        );
        expect(
            r2.isGroupRelation()
        ).toBeFalsy();
        let identificationToRelation2 = Tag.fromFriendlyResource(
            r2.model()
        );
        let relation1 = TestUtil.getChildWithLabel(centerBubble, "r1");
        await relation1.controller().addIdentification(identificationToRelation2);
        r2 = TestUtil.getChildWithLabel(centerBubble, "r2");
        expect(
            r2.isGroupRelation()
        ).toBeTruthy();
        expect(TestUtil.hasChildWithLabel(
            centerBubble,
            "r1"
        )).toBeFalsy();
        r2.expand();
        expect(TestUtil.hasChildWithLabel(
            r2,
            "r1"
        )).toBeTruthy();
        expect(TestUtil.hasChildWithLabel(
            r2,
            ""
        )).toBeTruthy();
    });

    //todo
    xit("sets the uri of the new group relation with the edge identifier and not the edge uri itself", async () => {
        let scenario = await new ThreeScenario();
        let centerBubble = scenario.getBubble1InTree();
        let r2ChildOfCenterBubble = TestUtil.getChildWithLabel(
            centerBubble,
            "r2"
        );
        let identificationToRelation2 = Tag.fromFriendlyResource(
            r2ChildOfCenterBubble.model()
        );
        let relation1 = TestUtil.getChildWithLabel(centerBubble, "r1");
        identificationToRelation2.makeSameAs();
        await relation1.controller().addIdentification(
            identificationToRelation2
        );
        r2ChildOfCenterBubble = TestUtil.getChildWithLabel(centerBubble, "r2");
        expect(
            r2ChildOfCenterBubble.isGroupRelation()
        ).toBeTruthy();
        expect(
            IdUri.getGraphElementTypeFromUri(
                r2ChildOfCenterBubble.getUri()
            )
        ).toBe(GraphElementType.Meta);
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
        await relation1.controller().addIdentification(identificationToNewRelation);
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

    it("expands the group relation if there's few siblings", async () => {
        let scenario = await new CreationDateScenario();
        let center = scenario.getBubble1InTree();
        let groupRelation = TestUtil.getChildWithLabel(
            center,
            "To do"
        );
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            center.getNumberOfChild(groupRelation.isToTheLeft())
        ).toBeGreaterThan(GroupRelation.EXPAND_UNDER_NB_SIBLINGS);
        expect(
            groupRelation.isExpanded
        ).toBeFalsy();
        let otherScenario = await new RelationsAsTagScenario();
        let centerWithLessRelations = otherScenario.getCenterInTree();
        expect(
            centerWithLessRelations.getNumberOfChild()
        ).toBeLessThan(3);
        let groupRelationInFewRelationsContext = TestUtil.getChildWithLabel(
            centerWithLessRelations,
            "original some relation"
        );
        expect(
            groupRelationInFewRelationsContext.isGroupRelation()
        ).toBeTruthy();
        expect(
            groupRelationInFewRelationsContext.isExpanded
        ).toBeTruthy();
    });

    xit("shows in label buttons", function () {
        loadFixtures("graph-element-menu.html");
        var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
        var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
        expect(
            possessionInTree.getInLabelButtonsContainer().find(
                "button"
            ).length
        ).toBeGreaterThan(0);
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
        metaRelation.controller().removeIdentifier(metaRelation.model())
        expect(
            true
        ).toBeTruthy();
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
            b2.removeChild(b2.getNextBubble());
            expect(
                b2.getNextBubble().getDownBubble().getLabel()
            ).toBe("");
            b2.removeChild(b2.getNextBubble());
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
    })
});
