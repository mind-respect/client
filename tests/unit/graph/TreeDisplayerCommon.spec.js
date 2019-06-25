import Mock from '../mock/Mock'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import TreeDisplayerCommon from '@/graph/TreeDisplayerCommon'
import RelationWithMultipleIdentifiersScenario from "../scenario/RelationWithMultipleIdentifiersScenario";
import Identification from '@/identifier/Identification'
import InverseRelationScenario from "../scenario/InverseRelationScenario";
import RelationIn2GroupRelationsScenario from "../scenario/RelationIn2GroupRelationsScenario";
import TestUtil from '../util/TestUtil'
import GroupRelationSpecialCaseScenario from "../scenario/GroupRelationSpecialCaseScenario";
import SameLevelRelationsWithMoreThanOneCommonMetaScenario
    from "../scenario/SameLevelRelationsWithMoreThanOneCommonMetaScenario";

describe("TreeDisplayerCommon", function () {
    let similarRelationsScenario,
        graph,
        centerVertex,
        possession;
    it("groups similar relations", async () => {
        await defineSimilarRelationsScenarioVariables();
        expect(centerVertex.groupRelationRoots).toBeUndefined();
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            graph,
            centerVertex.getUri()
        );
        centerVertex = graph.vertices[centerVertex.getUri()];
        expect(centerVertex.groupRelationRoots).toBeDefined();
        expect(
            groupRelationsHaveIdentifier(
                centerVertex.groupRelationRoots,
                possession
            )
        ).toBeTruthy();
        let numberOfRelations = Object.keys(graph.edges);
        expect(numberOfRelations.length).toBe(8);
        let numberOfGroupedRelations = Object.keys(centerVertex.groupRelationRoots);
        expect(numberOfGroupedRelations.length).toBe(4);
    });

    it("creates only one group relation when different relations have multiple identifiers that are the same", async () => {
        await defineSimilarRelationsScenarioVariables();
        let relationWithMultipleIdentifiersScenario = await new RelationWithMultipleIdentifiersScenario();
        let graph = relationWithMultipleIdentifiersScenario.getGraph();
        let centerVertexUri = relationWithMultipleIdentifiersScenario.getCenterBubbleUri();
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            graph,
            centerVertexUri
        );
        let teamVertex = graph.vertices[centerVertexUri];
        let numberOfSimilarRelations = Object.keys(teamVertex.groupRelationRoots).length;
        expect(
            numberOfSimilarRelations
        ).toBe(3);
    });

    it("relations with no identifications are grouped by relation uri", async () => {
        await defineSimilarRelationsScenarioVariables();
        let otherRelation = similarRelationsScenario.getOtherRelation();
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            graph,
            centerVertex.getUri()
        );
        centerVertex = graph.vertices[centerVertex.getUri()];
        expect(
            groupRelationsHaveIdentifier(
                centerVertex.groupRelationRoots,
                Identification.fromFriendlyResource(
                    otherRelation
                )
            )
        ).toBeTruthy();
    });

    it("vertices include inverse relations", async () => {
        let scenario = await new InverseRelationScenario();
        let graph = scenario.getGraph();
        let centerVertex = scenario.getCenterInTree();
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            graph,
            centerVertex.getUri()
        );
        centerVertex = graph.vertices[centerVertex.getUri()];
        let objectKeys = Object.keys(centerVertex.groupRelationRoots);
        expect(objectKeys.length).toBe(2);
    });

    xit("relations are set even when graph is deep", async () => {
        var deepGraphScenario = new Scenarios.deepGraph();
        var graph = deepGraphScenario.getGraph(),
            centerVertex = deepGraphScenario.getCenterVertex();
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            graph,
            centerVertex.getUri()
        );
        centerVertex = graph.vertices[centerVertex.getUri()];
        var numberOfGroupedRelations = Object.keys(
            centerVertex.groupRelationRoots
        ).length;
        expect(numberOfGroupedRelations).toBe(
            2
        );
    });

    xit("inverse relations are set even when graph is deep", function () {
        var deepGraphScenario = new Scenarios.deepGraph();
        var graph = deepGraphScenario.getGraph();
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            graph,
            deepGraphScenario.getCenterVertex().getUri()
        );
        var bubble2 = graph.vertices[
            deepGraphScenario.getBubble2().getUri()
            ];
        var numberOfGroupedRelations = Object.keys(
            bubble2.groupRelationRoots
        ).length;
        expect(numberOfGroupedRelations).toBe(
            2
        );
    });

    it("handles relations that are in 2 groups", async () => {
        let scenario = await new RelationIn2GroupRelationsScenario();
        let centerBubble = scenario.getSomeProjectInTree();
        expect(
            TestUtil.hasChildWithLabel(
                centerBubble,
                "impact 3"
            )
        ).toBeTruthy();
        let groupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "Impact on society"
        );
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        groupRelation.expand();
        expect(
            TestUtil.hasChildWithLabel(
                groupRelation,
                "impact 3"
            )
        ).toBeTruthy();
    });

    it("can handle a special case", async () => {
        var scenario = await new GroupRelationSpecialCaseScenario();
        scenario.getCenterInTree();
        //testing true to be truthy to test if there is no js error at this point
        expect(true).toBeTruthy();
    });

    it("does not duplicate relations on the same level sharing more than one common meta", async () => {
        let scenario = await new SameLevelRelationsWithMoreThanOneCommonMetaScenario();
        let centerBubble = scenario.getCenterInTree();
        let groupRelation = TestUtil.getChildWithLabel(
            centerBubble,
            "Creator"
        );
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            groupRelation.getNumberOfChild()
        ).toBe(2);
    });

    async function defineSimilarRelationsScenarioVariables() {
        similarRelationsScenario = await new GroupRelationsScenario();
        similarRelationsScenario.graph = graph = similarRelationsScenario.getGraph();
        centerVertex = similarRelationsScenario.getCenter();
        possession = similarRelationsScenario.getPossession();
    }

    function groupRelationsHaveIdentifier(groupRelations, identifier) {
        return groupRelations.some((groupRelation) => {
            return groupRelation.hasIdentification(identifier);
        });
    }
});