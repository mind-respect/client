import Mock from '../mock/Mock'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import ThreeScenario from "../scenario/ThreeScenario";
import GroupRelationHavingAVertexChildWithOneChild from '../scenario/GroupRelationHavingAVertexChildWithOneChild'
import GraphServiceMock from '../mock/GraphServiceMock'
import TestUtil from '../util/TestUtil'
import RelationAsIdentifierScenario from "../scenario/RelationsAsIdentifierScenario";
import TwoLevelGroupRelationScenario from "../scenario/TwoLevelGroupRelationScenario";
import TagService from "@/identifier/TagService";


describe("GroupRelationController", () => {
    it("can show tags", async () => {
        let scenario = await new GroupRelationsScenario();
        let possessionInTree = scenario.getPossessionGroupRelation();
        expect(
            possessionInTree.controller().showTagsCanDo()
        ).toBeTruthy();
    });
    describe("addChild", function () {
        it("gives all it's identifiers to the new relation when adding a child", async () => {
            let scenario = await new GroupRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.model().addIdentification(
                TestUtil.dummyIdentifier()
            );
            let triple = await possessionInTree.controller().addChild();
            expect(
                triple.edge.getIdentifiers().length
            ).toBe(2);
        });
        it("makes new child public if parent vertex is public", async () => {
            let scenario = await new GroupRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.getParentVertex().makePublic();
            possessionInTree.addIdentification(
                TestUtil.dummyIdentifier()
            );
            let triple = await possessionInTree.controller().addChild();
            expect(
                triple.destination.isPublic()
            ).toBeTruthy();
        });
        it("adds new child at the bottom of the others when not expanded", async () => {
            let scenario = await new GroupRelationsScenario();
            let possessionInTree = scenario.getPossessionGroupRelation();
            possessionInTree.collapse();
            expect(
                possessionInTree.canExpand()
            ).toBeTruthy();
            let newChildVertex;
            let nbChild = possessionInTree.getNumberOfChild();
            let triple = await possessionInTree.controller().addChild();
            newChildVertex = triple.destination;
            expect(
                possessionInTree.getNumberOfChild()
            ).toBe(nbChild + 1);
            expect(
                newChildVertex.getIndexInTree()
            ).toBe(
                possessionInTree.getNumberOfChild() - 1
            );
        });
        it('adds new sibling under a vertex under a group relation', async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            let book1 = groupRelation.getNextBubble().getNextBubble();
            expect(
                book1.getLabel()
            ).toBe("book 1");
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("book 2");
            await book1.controller().addSibling();
            expect(
                book1.getDownBubble().getLabel()
            ).toBe("");
        })
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
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
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
            await otherRelation.controller().moveUnderParent(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "other relation"
                )
            ).toBeTruthy();
        });
        it("can become parent of a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
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
            expect(
                otherGroupRelation.controller()._canMoveUnderParent(groupRelation)
            ).toBeTruthy();
            await otherGroupRelation.controller().moveUnderParent(groupRelation);
            expect(
                TestUtil.hasChildWithLabel(
                    groupRelation,
                    "original relation"
                )
            ).toBeTruthy();
        });
    });
    describe("becomeExParent", () => {
        it("can exclude the original relation", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getCenterInTree();
            let r1 = TestUtil.getChildWithLabel(
                center,
                "r1"
            );
            await r1.controller().addChild();
            let g1 = TestUtil.getChildWithLabel(
                center,
                "r1"
            );
            expect(
                g1.isGroupRelation()
            ).toBeTruthy();
            r1 = g1.getNextBubble();
            r1.setLabel("original r1 relation");
            await r1.controller().moveAbove(scenario.getBubble3InTree());
            r1 = TestUtil.getChildWithLabel(
                center,
                "original r1 relation"
            );
            expect(
                r1.isGroupRelation()
            ).toBeFalsy();
        });
        it("removes the tag related to the right group relation", async () => {
            let scenario = await new TwoLevelGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let group1 = TestUtil.getChildWithLabel(center, "group1");
            expect(
                group1.isGroupRelation()
            ).toBeTruthy();
            let group2 = TestUtil.getChildWithLabel(group1, "group2");
            expect(
                group2.isGroupRelation()
            ).toBeTruthy();

            let graphElementUris = [];
            let removedTagsUri = [];
            const removeTagSpy = jest.spyOn(TagService, "remove").mockImplementation((graphElementUri, tag) => {
                graphElementUris.push(graphElementUri);
                removedTagsUri.push(tag.getUri());
                return Promise.resolve();
            });
            group1.expand();
            await group1.controller().becomeExParent(group2);
            expect(removeTagSpy).toHaveBeenCalled();
            group2.expand();
            expect(graphElementUris.indexOf(
                group2.getNextBubble().getUri()
            ) > -1).toBeTruthy();
            expect(removedTagsUri.indexOf(
                group1.getIdentification().getUri()
            ) > -1).toBeTruthy();
            expect(removedTagsUri.indexOf(
                group2.getIdentification().getUri()
            ) > -1).toBeFalsy();
        });
        it("removes the tag related to the right group relation even if collapsed", async () => {
            let scenario = await new TwoLevelGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let group1 = TestUtil.getChildWithLabel(center, "group1");
            let group2 = TestUtil.getChildWithLabel(group1, "group2");
            let graphElementUris = [];
            let removedTagsUri = [];
            jest.spyOn(TagService, "remove").mockImplementation((graphElementUri, tag) => {
                graphElementUris.push(graphElementUri);
                removedTagsUri.push(tag.getUri());
                return Promise.resolve();
            });
            group1.expand();
            group2.collapse();
            await group1.controller().becomeExParent(group2);
            expect(graphElementUris.indexOf(
                group2.getNextChildrenEvenIfCollapsed()[0].getUri()
            ) > -1).toBeTruthy();
            expect(removedTagsUri.indexOf(
                group1.getIdentification().getUri()
            ) > -1).toBeTruthy();
            expect(removedTagsUri.indexOf(
                group2.getIdentification().getUri()
            ) > -1).toBeFalsy();
        });
        it("doesnt break moving below", async () => {
            let scenario = await new TwoLevelGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let group1 = TestUtil.getChildWithLabel(center, "group1");
            let group2 = TestUtil.getChildWithLabel(group1, "group2");
            jest.spyOn(TagService, "remove").mockImplementation(async () => {
                //await next tick for move execution order
                await scenario.nextTickPromise(1);
                return Promise.resolve();
            });
            await group2.controller().moveBelow(group1);
            expect(
                group1.getDownBubble().getUri()
            ).toBe(group2.getUri());
        });
    });
    describe("removeIdentifier", () => {
        it("can move a second level group relation out of the first level", async () => {
            let scenario = await new TwoLevelGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let group1 = TestUtil.getChildWithLabel(center, "group1");
            let group2 = TestUtil.getChildWithLabel(group1, "group2");
            expect(
                TestUtil.hasChildWithLabel(
                    center,
                    "g21"
                )
            ).toBeFalsy();
            group2.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    group2,
                    "g21"
                )
            ).toBeTruthy();
            let g21 = TestUtil.getChildWithLabel(
                group2,
                "g21"
            );
            await g21.controller().removeIdentifier(
                group1.getIdentification()
            );
            expect(
                TestUtil.hasChildWithLabel(
                    center,
                    "g21"
                )
            ).toBeTruthy();
            expect(
                TestUtil.hasChildWithLabel(
                    group2,
                    "g21"
                )
            ).toBeFalsy();
        });
        it("can move a second level group relation into the first level", async () => {
            let scenario = await new TwoLevelGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let group1 = TestUtil.getChildWithLabel(center, "group1");
            let group2 = TestUtil.getChildWithLabel(group1, "group2");
            group2.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    group1,
                    "g21"
                )
            ).toBeFalsy();
            expect(
                TestUtil.hasChildWithLabel(
                    group2,
                    "g21"
                )
            ).toBeTruthy();
            let g21 = TestUtil.getChildWithLabel(
                group2,
                "g21"
            );
            await g21.controller().removeIdentifier(
                group2.getIdentification()
            );
            expect(
                TestUtil.hasChildWithLabel(
                    group1,
                    "g21"
                )
            ).toBeTruthy();
            expect(
                TestUtil.hasChildWithLabel(
                    group2,
                    "g21"
                )
            ).toBeFalsy();
        });
    });
});