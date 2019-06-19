import Mock from '../mock/Mock'
import GraphWithSimilarRelationsScenario from "../scenario/GraphWithSimilarRelationsScenario";
import RelationWithMultipleIdentifiersScenario from "../scenario/RelationWithMultipleIdentifiersScenario";
import ThreeScenario from "../scenario/ThreeScenario"
import GroupRelation from '@/group-relation/GroupRelation'
import TestUtil from '../util/TestUtil'

describe("GroupRelation", function () {
    // scenario = new Scenarios.GraphWithSimilarRelationsScenario();
    // graph = scenario.getGraph();
    // centerVertex = scenario.getCenterVertex();
    // possession = scenario.getPossession();
    // groupRelation = GroupRelation.usingIdentification(possession);

    it("has identification", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
        let possession = scenario.getPossession();
        let groupRelation = GroupRelation.usingIdentification(
            possession
        );
        expect(groupRelation.getIdentification().getUri()).toBe(
            possession.getUri()
        );
    });
    it("can tell if it has multiple vertices", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
        let groupRelation = GroupRelation.usingIdentification(
            scenario.getPossession()
        );
        groupRelation.addTuple({
            vertex: scenario.getBook1(),
            edge: TestUtil.generateEdge()
        });
        expect(
            groupRelation.hasMultipleVertices()
        ).toBeFalsy();
        groupRelation.addTuple({
            vertex: scenario.getBook2(),
            edge: TestUtil.generateEdge()
        });
        expect(
            groupRelation.hasMultipleVertices()
        ).toBeTruthy();
    });
    it("can return the number of vertices", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
        let groupRelation = GroupRelation.usingIdentification(
            scenario.getPossession()
        );
        groupRelation.addTuple({
            vertex: scenario.getBook1(),
            edge: TestUtil.generateEdge()
        });
        expect(
            groupRelation.getNumberOfVertices()
        ).toBe(1);
        groupRelation.addTuple({
            vertex: scenario.getBook2(),
            edge: TestUtil.generateEdge()
        });
        expect(
            groupRelation.getNumberOfVertices()
        ).toBe(2);
    });
    it("can have multiple identifiers", async () => {
        let scenario = await new RelationWithMultipleIdentifiersScenario();
        let relationWithMultipleIdentifiers = scenario.getComputerScientistRelation();
        let groupRelation = GroupRelation.usingIdentifiers(
            relationWithMultipleIdentifiers.getIdentifiers()
        );
        expect(
            groupRelation.getIdentifiers().length
        ).toBe(2);
    });
    it("can integrate a group relation to a greater depth than 1", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
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
        let scenario = await new GraphWithSimilarRelationsScenario();
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
        await r1.getController().addChild();
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
        let scenario = await new GraphWithSimilarRelationsScenario();
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
        let scenario = await new GraphWithSimilarRelationsScenario();
        let possessionInTree = scenario.getPossessionGroupRelation();
        possessionInTree.getController().expand();
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

});
