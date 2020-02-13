import Mock from '../mock/Mock'
import GraphServiceMock from '../mock/GraphServiceMock'
import ThreeScenario from "../scenario/ThreeScenario"
import GroupRelationsScenario from '../scenario/GroupRelationsScenario'
import SingleChildScenario from '../scenario/SingleChildScenario'
import AutomaticExpandScenario from "../scenario/AutomaticExpandScenario";
import ConvertVertexToGroupRelationScenario from '../scenario/ConvertVertexToGroupRelationScenario'
import TestUtil from '../util/TestUtil'
import MindMapInfo from '@/MindMapInfo'
import Selection from '@/Selection'
import VertexController from '@/vertex/VertexController'
import VertexService from '@/vertex/VertexService'
import TwoLevelGroupRelationScenario from "../scenario/TwoLevelGroupRelationScenario";
import ShareLevel from '@/vertex/ShareLevel'

describe('VertexController', () => {
    describe("remove", function () {
        it("skips confirmation when vertex is pristine", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            await centerBubble.controller().addChild();
            let nbChild = centerBubble.getNumberOfChild();
            let emptyRelation = TestUtil.getChildWithLabel(
                centerBubble,
                ''
            );
            let emptyVertex = emptyRelation.getNextBubble();
            Selection.setToSingle(emptyVertex);
            await emptyVertex.controller().remove();
            await scenario.nextTickPromise();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(nbChild - 1);
        });
        it("skips confirmation when multiple vertices are pristine", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            await b2.controller().addChild();
            let emptyVertex = TestUtil.getChildWithLabel(
                b2,
                ''
            ).getNextBubble();
            await b2.controller().addChild();
            let emptyVertex2 = emptyVertex.getDownBubble();
            expect(
                b2.getNumberOfChild()
            ).toBe(4);
            Selection.removeAll();
            Selection.add(emptyVertex);
            Selection.add(emptyVertex2);
            await Selection.controller().remove();
            await scenario.nextTickPromise();
            expect(
                b2.getNumberOfChild()
            ).toBe(2)
        });
    });
    describe("addSiblingCanDo", function () {
        it("cannot add sibling if center bubble", async () => {
            let scenario = await new ThreeScenario();
            let bubble1 = scenario.getBubble1InTree();
            let someChild = bubble1.getNextBubble().getNextBubble();
            MindMapInfo._setIsViewOnly(false);
            expect(
                someChild.controller().addSiblingCanDo()
            ).toBeTruthy();
            expect(
                bubble1.controller().addSiblingCanDo()
            ).toBeFalsy();
        });
        it("returns false if vertex is pristine", async () => {
            MindMapInfo._setIsViewOnly(false);
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let b2 = TestUtil.getChildWithLabel(
                centerBubble,
                'r1'
            ).getNextBubble();
            expect(
                b2.controller().addSiblingCanDo()
            ).toBeTruthy();
            await centerBubble.controller().addChild();
            let emptyVertex = TestUtil.getChildWithLabel(
                centerBubble,
                ''
            ).getNextBubble();
            expect(
                emptyVertex.controller().addSiblingCanDo()
            ).toBeFalsy();
        });
    });
    it("can add sibling", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        let numberOfChild = bubble1.getNumberOfChild();
        let someChild = bubble1.getNextBubble().getNextBubble();
        await someChild.controller().addSibling();
        expect(
            bubble1.getNumberOfChild()
        ).toBe(numberOfChild + 1);
    });
    describe("addChildCanDo", function () {
        it("returns false if vertex is pristine", async () => {
            MindMapInfo._setIsViewOnly(false);
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let b2 = TestUtil.getChildWithLabel(
                centerBubble,
                'r1'
            ).getNextBubble();
            expect(
                b2.controller().addChildCanDo()
            ).toBeTruthy();
            await centerBubble.controller().addChild();
            let emptyVertex = TestUtil.getChildWithLabel(
                centerBubble,
                ''
            ).getNextBubble();
            expect(
                emptyVertex.controller().addChildCanDo()
            ).toBeFalsy();
        });
    });
    it("adding bubble and relation selects new bubble", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        GraphServiceMock.getForCentralBubbleUri(
            scenario.getSubGraphForB2()
        );
        let hasVisited = false;
        await b2.controller().addChild().then(function (triple) {
            hasVisited = true;
            Selection.getSingle().isSameBubble(
                triple.destination
            )
        });
        expect(
            hasVisited
        ).toBeTruthy();
    });
    it("adding bubble and relation makes new bubble public if parent is public", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        GraphServiceMock.getForCentralBubbleUri(
            scenario.getSubGraphForB2()
        );
        b2.model().makePublic();
        let hasVisited = false;
        await b2.controller().addChild().then(function (triple) {
            hasVisited = true;
            expect(
                triple.destination.isPublic()
            ).toBeTruthy();
        });
        expect(
            hasVisited
        ).toBeTruthy();
    });
    /*no suggestions for now*/
    xit("hides suggestions when calling the suggestions action when they are already visible", async () => {
        var eventBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
        MindMapInfo._setIsViewOnly(false);
        expect(
            eventBubble.getTopMostChildBubble().isVisible()
        ).toBeTruthy();
        eventBubble.controller().suggestions();
        expect(
            eventBubble.getTopMostChildBubble().isVisible()
        ).toBeFalsy();
    });
    it("expands the bubble when adding child", async () => {
        let scenario = await new ThreeScenario();
        let b3 = scenario.getBubble3InTree();
        expect(
            b3.getNextChildren().length
        ).toBe(0);
        GraphServiceMock.getForCentralBubbleUri(
            scenario.getSubGraphForB3()
        );
        await b3.controller().addChild();
        expect(
            b3.getNextChildren().length
        ).toBe(3);
    });
    it("puts the new bubble under the group relation when adding a sibling to the child of group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        await groupRelation.expand();
        let childBubble = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        ).getNextBubble();
        expect(
            childBubble.isVertex()
        ).toBeTruthy();
        let numberOfChild = groupRelation.getNumberOfChild();
        await childBubble.controller().addSibling();
        expect(
            groupRelation.getNumberOfChild()
        ).toBe(numberOfChild + 1);
    });
    it("sets identification to the new relation when adding a sibling to the child of group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        groupRelation.expand();
        let childBubble = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        ).getNextBubble();
        expect(
            childBubble.isVertex()
        ).toBeTruthy();
        let hasVisited = false;
        await childBubble.controller().addSibling().then(function (triple) {
            hasVisited = true;
            let relation = triple.destination.getParentBubble();
            expect(
                relation.model().hasIdentifications()
            ).toBeTruthy();
        });
        expect(
            hasVisited
        ).toBeTruthy();
    });
    it("does not load the surround graph when expanding a collapsed vertex", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        let nbCalls = GraphServiceMock.getGraphSpy.mock.calls.length;
        expect(
            b2.controller().expandCanDo()
        ).toBeTruthy()
        await scenario.expandBubble2(b2);
        b2.collapse();
        expect(
            GraphServiceMock.getGraphSpy.mock.calls.length
        ).toBe(nbCalls + 1);
        nbCalls = GraphServiceMock.getGraphSpy.mock.calls.length
        await b2.controller().expand();
        expect(
            GraphServiceMock.getGraphSpy.mock.calls.length
        ).toBe(nbCalls);
    });
    it("does not add child tree again when twice expanding a bubble", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        GraphServiceMock.getForCentralBubbleUri(
            scenario.getSubGraphForB2()
        );
        await b2.controller().expand();
        expect(
            b2.getNumberOfChild()
        ).toBe(2);
        await b2.controller().expand();
        expect(
            b2.getNumberOfChild()
        ).toBe(2);
    });
    describe("expand", () => {
        it("expands expandable descendants when expanding already expanded bubble", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getCenterBubbleInTree();
            let b2 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            ).getNextBubble();
            expect(
                b2.isExpanded
            ).toBeFalsy();
            let b3 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            ).getNextBubble();
            expect(
                b3.isExpanded
            ).toBeFalsy();
            let multipleGraphReturn = {};
            multipleGraphReturn[
                scenario.getBubble2InTree().getUri()
                ] = scenario.getSubGraphForB2();
            multipleGraphReturn[
                scenario.getBubble3InTree().getUri()
                ] = scenario.getSubGraphForB3();
            GraphServiceMock.getForCentralBubbleUriMultiple(
                multipleGraphReturn
            );
            await b1.controller().expand();
            expect(
                b2.isExpanded
            ).toBeTruthy();
            expect(
                b3.isExpanded
            ).toBeTruthy();
        });
        it("expands expandable descendants", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b2.getNextChildren().length
            ).toBe(2);
            let b2Child = b2.getNextBubble().getNextBubble();
            await b2Child.controller().addChild();
            await b2Child.controller().addChild();
            b2Child.collapse();
            expect(
                b2Child.getNextChildren().length
            ).toBe(0);
            expect(
                b2Child.getNumberOfConnectedEdges()
            ).toBe(3);
            expect(
                b2Child.getNumberOfChild()
            ).toBe(2);
            expect(
                b2Child.canExpand()
            ).toBeTruthy();
            expect(
                b2Child.areDuplicatesExpanded()
            ).toBeFalsy();
            b2Child.setLabel("b2 child");
            expect(
                b2.canExpandDescendants()
            ).toBeTruthy();
            await b2.controller().expand();
            expect(
                b2Child.getNextChildren().length
            ).toBe(2);
        });
    });
    it("makes model be private when making private", async () => {
        let scenario = await new ThreeScenario();
        let b1 = scenario.getBubble1InTree();
        b1.model().makePublic();
        expect(
            b1.model().isPublic()
        ).toBeTruthy();
        await b1.controller().setShareLevelDo(ShareLevel.PRIVATE);
        expect(
            b1.model().isPublic()
        ).toBeFalsy();
    });
    describe("convertToGroupRelation", () => {
        it("changes to group relation", async () => {
            let scenario = await new ConvertVertexToGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let b2 = await scenario.getExpandedB2();
            expect(
                b2.isGroupRelation()
            ).toBeFalsy();
            expect(
                b2.controller().convertToGroupRelationCanDo()
            ).toBeTruthy();
            await b2.controller().convertToGroupRelation();
            b2 = TestUtil.getChildWithLabel(
                center,
                "b2"
            );
            expect(
                b2.isGroupRelation()
            ).toBeTruthy();
        });
        it("has right children", async () => {
            let scenario = await new ConvertVertexToGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let b2 = await scenario.getExpandedB2();
            expect(
                b2.getNumberOfChild()
            ).toBe(3);
            await b2.controller().convertToGroupRelation();
            b2 = TestUtil.getChildWithLabel(
                center,
                "b2"
            );
            // b2.getNextChildren().forEach((child)=>{
            //     console.log(child.getDestinationVertex().getLabel())
            // });
            let children = b2.getNextChildren();
            expect(
                children[0].getDestinationVertex().getLabel()
            ).toBe("b3");
            expect(
                children[1].getDestinationVertex().getLabel()
            ).toBe("b4");
            expect(
                children[2].getDestinationVertex().getLabel()
            ).toBe("b5");
            expect(
                b2.getNumberOfChild()
            ).toBe(3);
        });
    });
    describe("convertToDistantBubbleWithUri", function () {
        it("can convert vertex to a distant vertex connected to the current parent vertex", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            GraphServiceMock.getForCentralBubbleUri(
                singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
            );
            let child = parent.getNextBubble().getNextBubble();
            let b1Uri = singleChildScenario.getB1Uri();
            expect(
                child.controller().convertToDistantBubbleWithUriCanDo(b1Uri)
            ).toBeTruthy();
            await child.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            let b1 = parent.getNextBubble().getNextBubble();
            expect(
                b1.getUri()
            ).toBe(singleChildScenario.getB1Uri());
        });
        it("cannot add a relation to existing child", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            GraphServiceMock.getForCentralBubbleUri(
                singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
            );
            let child = parent.getNextBubble().getNextBubble();
            await child.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            let newChild;
            await parent.controller().addChild().then(function (triple) {
                newChild = triple.destination;
            });
            expect(
                newChild.getParentVertex().isSameBubble(parent)
            ).toBeTruthy();
            expect(
                newChild.controller().convertToDistantBubbleWithUriCanDo(
                    singleChildScenario.getB1Uri()
                )
            ).toBeFalsy();
            newChild.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            ).then(function () {
                fail("should not be able to add a relation to an already existing child");
            });
        });
        it("cannot add a relation to existing parent", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let getForCentralBubbleUriSpy = GraphServiceMock.getForCentralBubbleUri(
                singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
            );
            let child = parent.getNextBubble().getNextBubble();
            await child.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            let newChild;
            await parent.controller().addChild().then(function (triple) {
                newChild = triple.destination;
            });
            let newChildChild;
            await newChild.controller().addChild().then(function (triple) {
                newChildChild = triple.destination;
            });
            expect(newChildChild.controller().convertToDistantBubbleWithUriCanDo(
                parent.getUri()
            )).toBeFalsy();
        });
        it("cannot add a relation to self", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let child = parent.getNextBubble().getNextBubble();
            child.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            let newChild;
            await parent.controller().addChild().then(function (triple) {
                newChild = triple.destination;
            });
            expect(newChild.controller().convertToDistantBubbleWithUriCanDo(
                parent.getUri()
            )).toBeFalsy();
        });
        it("cannot add a relation to a non owned vertex", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let child = parent.getNextBubble().getNextBubble();
            expect(child.controller().convertToDistantBubbleWithUriCanDo(
                TestUtil.generateVertexUri("not-current-user")
            )).toBeFalsy();
        });
        /*schemas are not supported for now*/
        xit("can only add a relation to a vertex", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            expect(parent.controller().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getProjectSchema().getCenterBubbleUri()
            )).toBeFalsy();
            expect(parent.controller().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getProjectSchema().getCenterBubbleUri()
            )).toBeFalsy();
            expect(parent.controller().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getKaraokeSchemaGraph().getLocationProperty().getUri()
            )).toBeFalsy();
            expect(parent.controller().convertToDistantBubbleWithUriCanDo(
                TestUtils.generateEdgeUri()
            )).toBeFalsy();
        });
        it("also changes uri of connected edges source and destination vertices", async () => {
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let relation = parent.getNextBubble();
            expect(
                relation.getDestinationVertex().getUri()
            ).not.toBe(singleChildScenario.getB1Uri());
            let child = relation.getNextBubble();
            GraphServiceMock.getForCentralBubbleUri(
                singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
            );
            await child.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            relation = parent.getNextBubble();
            expect(
                relation.getDestinationVertex().getUri()
            ).toBe(singleChildScenario.getB1Uri());
        });
        it("keeps label of the relation when converting a bubble to a distant bubble", async () => {
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let relation = parent.getNextBubble();
            expect(
                relation.text()
            ).toBe("relation");
            let child = relation.getNextBubble();
            GraphServiceMock.getForCentralBubbleUri(
                singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
            );
            await child.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            relation = parent.getNextBubble();
            expect(
                relation.getLabel()
            ).toBe("relation");
        });
        it("keeps the identifiers of the relation when converting a bubble to a distant bubble", async () => {
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let relation = parent.getNextBubble();
            relation.model().addIdentification(
                TestUtil.dummyIdentifier()
            );
            let child = relation.getNextBubble();
            GraphServiceMock.getForCentralBubbleUri(
                singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
            );
            await child.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            relation = parent.getNextBubble();
            expect(
                relation.model().hasIdentifications()
            ).toBeTruthy();
        });
        it("concatenates bubbles label", async () => {
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let child = parent.getNextBubble().getNextBubble();
            child.setLabel("child label");
            GraphServiceMock.getForCentralBubbleUri(
                singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
            );
            await child.controller().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            child = parent.getNextBubble().getNextBubble();
            expect(
                child.getLabel()
            ).toBe("child label b1");
        });
        it("reviews other instances display", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            let triple = await b2.controller().addChild();
            let newChildOfB2 = triple.destination;
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB3()
            );
            let b3 = scenario.getBubble3InTree();
            expect(
                b3.getNbDuplicates()
            ).toBe(0);
            expect(
                newChildOfB2.getNbDuplicates()
            ).toBe(0);
            expect(
                newChildOfB2.controller().convertToDistantBubbleWithUriCanDo(
                    b3.model().getUri()
                )
            ).toBeTruthy();
            await newChildOfB2.controller().convertToDistantBubbleWithUri(
                b3.model().getUri()
            );
            expect(
                b3.getNbDuplicates()
            ).toBe(1);
            expect(
                newChildOfB2.getNbDuplicates()
            ).toBe(1);
        });
    });
    /*
    getSubGraphOfB1OnceMergedWithSingleChild would have to return a graph where "single child" has children for this test pass
    */
    xit("has right number of children when both vertices have child", async () => {
        let singleChildScenario = await new SingleChildScenario();
        let parent = singleChildScenario.getParentInTree();
        let child = parent.getNextBubble().getNextBubble();
        child.setLabel("child label");
        GraphServiceMock.getForCentralBubbleUri(
            singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
        );
        let triple = await child.controller().addChild();
        triple.edge.setLabel("child edge 1");
        triple = await child.controller().addChild();
        triple.edge.setLabel("child edge 2");
        expect(
            child.getNumberOfChild()
        ).toBe(2);
        await child.controller().convertToDistantBubbleWithUri(
            singleChildScenario.getB1Uri()
        );
        child = parent.getNextBubble().getNextBubble();
        TestUtil.logChildren(child);
        expect(
            child.getNumberOfChild()
        ).toBe(4);
    });
    it("automatically expands a child bubble having a single hidden relation when it's parent is expanded", async () => {
        let scenario = await new AutomaticExpandScenario();
        let b3 = scenario.getB3InTree();
        let graphMocks = {};
        graphMocks[b3.getUri()] = scenario.getB3SubGraph();
        graphMocks[scenario.getB31Uri()] = scenario.getB31SubGraph();
        GraphServiceMock.getForCentralBubbleUriMultiple(graphMocks);
        await b3.controller().expand();
        // GraphServiceMock.getForCentralBubbleUri(scenario.getGraph())
        let b31 = TestUtil.getChildWithLabel(
            b3,
            'r31'
        ).getNextBubble();
        expect(
            b31.getLabel()
        ).toBe("b31");
        expect(
            b31.isExpanded
        ).toBeTruthy();
        let b32 = TestUtil.getChildWithLabel(
            b3,
            'r32'
        ).getNextBubble();
        expect(
            b32.text()
        ).toBe("b32");
        expect(
            b32.isExpanded
        ).toBeFalsy();
    });

    describe("addChild", function () {
        it("increments number of connected edges", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            expect(
                b1.model().getNumberOfChild()
            ).toBe(2);
            await b1.controller().addChild();
            expect(
                b1.model().getNumberOfChild()
            ).toBe(3);
        });
        it("sets to zero the number of connected edges to the destination vertex", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let triple = await b1.controller().addChild();
            expect(
                triple.destination.model().getNumberOfChild()
            ).toBe(0);
        });
    });

    describe("addSibling", function () {
        it("increments the number of connected edges of the parent model", async function () {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let childVertex = b1.getNextBubble().getNextBubble();
            expect(
                b1.model().getNumberOfChild()
            ).toBe(2);
            await childVertex.controller().addSibling();
            expect(
                b1.model().getNumberOfChild()
            ).toBe(3);
        });
    });

    describe("becomeParent", function () {
        it("increments number of child", async () => {
            let scenario = await new ThreeScenario();
            let bubble1 = scenario.getBubble1InTree();
            let bubble2 = scenario.getBubble2InTree();
            let newChild = await bubble1.controller().addChild().then(function (triple) {
                return triple.destination;
            });
            await bubble2.controller().moveUnderParent(newChild);
            expect(
                newChild.model().getNumberOfChild()
            ).toBe(1);
            newChild.collapse();
            expect(
                newChild.model().getNumberOfChild()
            ).toBe(1);
        });
        it("keeps direction of existing children when moving under parent", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b2.isToTheLeft()
            ).toBeFalsy();
            let b3 = scenario.getBubble3InTree();
            await scenario.expandBubble3(b3);
            let r3 = b3.getNextBubble();
            expect(
                r3.isToTheLeft()
            ).toBeTruthy();
            let vertexUnderB2 = b2.getNextBubble().getNextBubble();
            await vertexUnderB2.controller().moveUnderParent(b3);
            expect(
                b3.isToTheLeft()
            ).toBeTruthy();
            expect(
                r3.isToTheLeft()
            ).toBeTruthy();
        });
        it("can become parent of a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherVertex = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            groupRelation.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    otherVertex,
                    "Possession"
                )
            ).toBeFalsy();
            await groupRelation.controller().moveUnderParent(otherVertex);
            otherVertex = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            expect(
                TestUtil.hasChildWithLabel(
                    otherVertex,
                    "Possession"
                )
            ).toBeTruthy();
        });
        it("does not remove the relation's tag when moving a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherVertex = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            groupRelation.expand();
            let groupRelationNumberOfChild = groupRelation.getNumberOfChild();
            await groupRelation.controller().moveUnderParent(otherVertex);
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(groupRelationNumberOfChild);
        });
        it("removes tags of relations under group relation when moving away from group relation", async () => {
            let scenario = await new TwoLevelGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let group1 = TestUtil.getChildWithLabel(
                center,
                "group1"
            );
            group1.expand();
            let group2 = TestUtil.getChildWithLabel(
                group1,
                "group2"
            );
            group2.expand();
            let g22 = TestUtil.getChildWithLabel(
                group2,
                "g22"
            );
            expect(
                g22.getRelevantTags().length
            ).toBe(2);
            let aaaa = TestUtil.getChildWithLabel(
                center,
                "r1"
            ).getNextBubble();
            await group2.controller().moveUnderParent(aaaa);
            g22 = TestUtil.getChildWithLabel(
                group2,
                "g22"
            );
            expect(
                g22.getRelevantTags().length
            ).toBe(1);
        });
    });
});
