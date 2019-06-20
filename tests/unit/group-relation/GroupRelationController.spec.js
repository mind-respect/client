import Mock from '../mock/Mock'
import GraphWithSimilarRelationsScenario from "../scenario/GraphWithSimilarRelationsScenario";
import GroupRelationHavingAVertexChildWithOneChild from '../scenario/GroupRelationHavingAVertexChildWithOneChild'
import GraphServiceMock from '../mock/GraphServiceMock'
import TestUtil from '../util/TestUtil'


describe("GroupRelationController", () => {
    it("can identify", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
        let possessionInTree = scenario.getPossessionGroupRelation();
        expect(
            possessionInTree.getController().identifyCanDo()
        ).toBeTruthy();
    });
    describe("addChild", function () {
        it("gives all it's identifiers to the new relation when adding a child", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.model().addIdentification(
                TestUtil.dummyIdentifier()
            );
            let testWasMade = false;
            await possessionInTree.getController().addChild().then(function (triple) {
                expect(
                    triple.edge.getIdentifiers().length
                ).toBe(2);
                testWasMade = true;
            });
            expect(
                testWasMade
            ).toBeTruthy();
        });
        it("makes new child public if parent vertex is public", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.getParentVertex().model().makePublic();
            possessionInTree.model().addIdentification(
                TestUtil.dummyIdentifier()
            );
            let testWasMade = false;
            await possessionInTree.getController().addChild().then(function (triple) {
                expect(
                    triple.destination.isPublic()
                ).toBeTruthy();
                testWasMade = true;
            });
            expect(
                testWasMade
            ).toBeTruthy();
        });
        it("updates child in model", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            let nbVerticesBefore = Object.keys(
                possessionInTree.model().getVertices()
            ).length;
            await possessionInTree.getController().addChild();
            expect(
                Object.keys(
                    possessionInTree.model().getVertices()
                ).length
            ).toBe(nbVerticesBefore + 1);
        });
        it("adds new child at the bottom of the others when not expanded", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.collapse();
            expect(
                possessionInTree.canExpand()
            ).toBeTruthy();
            let newChildVertex;
            await possessionInTree.getController().addChild().then(function (triple) {
                newChildVertex = triple.destination;
            });
            expect(
                newChildVertex.getIndexInTree()
            ).toBe(
                possessionInTree.getNumberOfChild()
            );
        });
    });

    describe("expand", function () {
        it("also expands child bubbles having only one child", async () => {
            let scenario = await new GroupRelationHavingAVertexChildWithOneChild();
            let tshirtGroupRelation = scenario.getTshirtGroupRelationInTree();
            GraphServiceMock.getForCentralBubbleUriAndGraph(
                scenario.getShirt2VertexUri(),
                scenario.getShirt2Graph()
            );
            tshirtGroupRelation.expand();
            let shirt2 = TestUtil.getChildWithLabel(
                tshirtGroupRelation,
                "shirt2"
            ).getNextBubble();
            expect(
                shirt2.isVertex()
            ).toBeTruthy();
            expect(
                shirt2.getNumberOfChild()
            ).toBe(1);
        });
    });
    describe("becomeParent", function () {
        it("can become parent of an edge", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let center = scenario.getCenterVertexInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            groupRelation.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "other relation"
                )
            ).toBeFalsy();
            await otherRelation.getController().moveUnderParent(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "other relation"
                )
            ).toBeTruthy();
        });
        it("can become parent of a group relation", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let center = scenario.getCenterVertexInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherGroupRelation = TestUtil.getChildWithLabel(
                center,
                "original relation"
            );
            groupRelation.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "original relation"
                )
            ).toBeFalsy();
            await otherGroupRelation.getController().moveUnderParent(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "original relation"
                )
            ).toBeTruthy();
        });
    });
});