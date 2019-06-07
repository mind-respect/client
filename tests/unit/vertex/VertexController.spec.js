import Mock from '../mock/Mock'
import GraphServiceMock from '../mock/GraphServiceMock'
import ThreeScenario from "../scenario/ThreeScenario"
import GraphWithSimilarRelationsScenario from '../scenario/GraphWithSimilarRelationsScenario'
import SingleChildScenario from '../scenario/SingleChildScenario'
import AutomaticExpandScenario from "../scenario/AutomaticExpandScenario";
import TestUtil from '../util/TestUtil'
import MindMapInfo from '@/MindMapInfo'
import SelectionHandler from '@/SelectionHandler'
import VertexController from '@/vertex/VertexController'

describe('VertexController', () => {
    beforeEach(() => {

    });

    describe("remove", function () {
        it("skips confirmation when vertex is pristine", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            await centerBubble.getController().addChild();
            let nbChild = centerBubble.getNumberOfChild();
            let emptyRelation = TestUtil.getChildWithLabel(
                centerBubble,
                ''
            );
            let emptyVertex = emptyRelation.getNextBubble();
            SelectionHandler.setToSingle(emptyVertex);
            emptyVertex.getController().remove();
            await scenario.nextTickPromise();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(nbChild - 1);
        });
        it("skips confirmation when multiple vertices are pristine", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            await b2.getController().addChild();
            let emptyVertex = TestUtil.getChildWithLabel(
                b2,
                ''
            ).getNextBubble();
            await b2.getController().addChild();
            let emptyVertex2 = emptyVertex.getDownBubble();
            expect(
                b2.getNumberOfChild()
            ).toBe(4);
            SelectionHandler.reset();
            SelectionHandler.add(emptyVertex);
            SelectionHandler.add(emptyVertex2);
            await SelectionHandler.getController().remove();
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
                someChild.getController().addSiblingCanDo()
            ).toBeTruthy();
            expect(
                bubble1.getController().addSiblingCanDo()
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
                b2.getController().addSiblingCanDo()
            ).toBeTruthy();
            await centerBubble.getController().addChild();
            let emptyVertex = TestUtil.getChildWithLabel(
                centerBubble,
                ''
            ).getNextBubble();
            expect(
                emptyVertex.getController().addSiblingCanDo()
            ).toBeFalsy();
        });
    });
    it("can add sibling", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        let numberOfChild = bubble1.getNumberOfChild();
        let someChild = bubble1.getNextBubble().getNextBubble();
        await someChild.getController().addSibling();
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
                b2.getController().addChildCanDo()
            ).toBeTruthy();
            await centerBubble.getController().addChild();
            let emptyVertex = TestUtil.getChildWithLabel(
                centerBubble,
                ''
            ).getNextBubble();
            expect(
                emptyVertex.getController().addChildCanDo()
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
        await b2.getController().addChild().then(function (triple) {
            hasVisited = true;
            SelectionHandler.getSingle().isSameBubble(
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
        b2.getModel().makePublic();
        let hasVisited = false;
        await b2.getController().addChild().then(function (triple) {
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
        eventBubble.getController().suggestions();
        expect(
            eventBubble.getTopMostChildBubble().isVisible()
        ).toBeFalsy();
    });
    /*dont wanna test that*/
    xit("changes in label privacy button when changing privacy of a collection of vertices", async () => {
        loadFixtures('graph-element-menu.html');
        MindMapInfo._setIsViewOnly(false);
        var scenario = new Scenarios.threeBubblesGraph();
        var bubble1 = scenario.getBubble1InTree();
        bubble1.reviewInLabelButtonsVisibility();
        expect(
            bubble1.getPrivateButtonInBubbleContent().hasClass("hidden")
        ).toBeFalsy();
        expect(
            bubble1.publicButtonInBubbleContent().hasClass("hidden")
        ).toBeTruthy();
        new VertexController.VertexController(
            [
                bubble1,
                scenario.getBubble2InTree()
            ]
        ).makePublic();
        expect(
            bubble1.getPrivateButtonInBubbleContent().hasClass("hidden")
        ).toBeTruthy();
        expect(
            bubble1.publicButtonInBubbleContent().hasClass("hidden")
        ).toBeFalsy();
        new VertexController.VertexController(
            [
                bubble1,
                scenario.getBubble2InTree()
            ]
        ).makePrivate();
        expect(
            bubble1.getPrivateButtonInBubbleContent().hasClass("hidden")
        ).toBeFalsy();
        expect(
            bubble1.publicButtonInBubbleContent().hasClass("hidden")
        ).toBeTruthy();
    });
    it("expands the bubble when adding child", async () => {
        let scenario = await new ThreeScenario();
        let b3 = scenario.getBubble3InTree();
        expect(
            b3.getImmediateChild().length
        ).toBe(0);
        GraphServiceMock.getForCentralBubbleUri(
            scenario.getSubGraphForB3()
        );
        await b3.getController().addChild();
        expect(
            b3.getImmediateChild().length
        ).toBe(3);
    });
    it("puts the new bubble under the group relation when adding a sibling to the child of group relation", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
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
        await childBubble.getController().addSibling();
        expect(
            groupRelation.getNumberOfChild()
        ).toBe(numberOfChild + 1);
    });
    it("sets identification to the new relation when adding a sibling to the child of group relation", async () => {
        let scenario = await new GraphWithSimilarRelationsScenario();
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
        await childBubble.getController().addSibling().then(function (triple) {
            hasVisited = true;
            let relation = triple.destination.getParentBubble();
            expect(
                relation.getModel().hasIdentifications()
            ).toBeTruthy();
        });
        expect(
            hasVisited
        ).toBeTruthy();
    });
    it("does not load the surround graph when expanding a collapsed vertex", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        let nbCalls = GraphServiceMock.getGraphSpy.mock.calls.length ;
        expect(
            b2.getController().expandCanDo()
        ).toBeTruthy()
        await scenario.expandBubble2(b2);
        b2.collapse();
        expect(
            GraphServiceMock.getGraphSpy.mock.calls.length
        ).toBe(nbCalls + 1);
        nbCalls = GraphServiceMock.getGraphSpy.mock.calls.length
        await b2.getController().expand();
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
        await b2.getController().expand();
        expect(
            b2.getNumberOfChild()
        ).toBe(2);
        await b2.getController().expand();
        expect(
            b2.getNumberOfChild()
        ).toBe(2);
    });
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
        await b1.getController().expand();
        expect(
            b2.isExpanded
        ).toBeTruthy();
        expect(
            b3.isExpanded
        ).toBeTruthy();
    });
    it("does not make public already public vertices when making a collection public", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        b2.getModel().makePublic();
        let hasCalledService = false;
        let nbVerticesToMakePublic = 0;
        Mock.getSpy(
            "VertexService",
            "makeCollectionPublic"
        ).mockImplementation((vertices) => {
            hasCalledService = true;
            nbVerticesToMakePublic = vertices.length;
            return Promise.resolve();
        });
        await new VertexController.VertexController([
            scenario.getBubble1InTree(),
            b2,
            scenario.getBubble3InTree()
        ]).makePublic();
        expect(
            hasCalledService
        ).toBeTruthy();
        expect(
            nbVerticesToMakePublic
        ).toBe(2);
    });
    it("does not make private already private vertices when making a collection private", async () => {
        let scenario = await new ThreeScenario();
        let b1 = scenario.getBubble1InTree();
        b1.getModel().makePublic();
        let b3 = scenario.getBubble3InTree();
        b3.getModel().makePublic();
        let hasCalledService = false;
        let nbVerticesToMakePrivate = 0;
        Mock.getSpy(
            "VertexService",
            "makeCollectionPrivate"
        ).mockImplementation((vertices) => {
            hasCalledService = true;
            nbVerticesToMakePrivate = vertices.length;
            return Promise.resolve();
        });
        await new VertexController.VertexController([
            b1,
            scenario.getBubble2InTree(),
            b3
        ]).makePrivate();
        expect(
            hasCalledService
        ).toBeTruthy();
        expect(
            nbVerticesToMakePrivate
        ).toBe(2);
    });
    it("makes model be private when making private", async () => {
        let scenario = await new ThreeScenario();
        let b1 = scenario.getBubble1InTree();
        b1.getModel().makePublic();
        expect(
            b1.getModel().isPublic()
        ).toBeTruthy();
        await b1.getController().makePrivate();
        expect(
            b1.getModel().isPublic()
        ).toBeFalsy();
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
                child.getController().convertToDistantBubbleWithUriCanDo(b1Uri)
            ).toBeTruthy();
            await child.getController().convertToDistantBubbleWithUri(
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
            await child.getController().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            let newChild;
            await parent.getController().addChild().then(function (triple) {
                newChild = triple.destination;
            });
            expect(
                newChild.getParentVertex().isSameBubble(parent)
            ).toBeTruthy();
            expect(
                newChild.getController().convertToDistantBubbleWithUriCanDo(
                    singleChildScenario.getB1Uri()
                )
            ).toBeFalsy();
            newChild.getController().convertToDistantBubbleWithUri(
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
            await child.getController().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            let newChild;
            await parent.getController().addChild().then(function (triple) {
                newChild = triple.destination;
            });
            let newChildChild;
            await newChild.getController().addChild().then(function (triple) {
                newChildChild = triple.destination;
            });
            expect(newChildChild.getController().convertToDistantBubbleWithUriCanDo(
                parent.getUri()
            )).toBeFalsy();
        });
        it("cannot add a relation to self", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let child = parent.getNextBubble().getNextBubble();
            child.getController().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            let newChild;
            await parent.getController().addChild().then(function (triple) {
                newChild = triple.destination;
            });
            expect(newChild.getController().convertToDistantBubbleWithUriCanDo(
                parent.getUri()
            )).toBeFalsy();
        });
        it("cannot add a relation to a non owned vertex", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = await new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            let child = parent.getNextBubble().getNextBubble();
            expect(child.getController().convertToDistantBubbleWithUriCanDo(
                TestUtil.generateVertexUri("not-current-user")
            )).toBeFalsy();
        });
        /*schemas are not supported for now*/
        xit("can only add a relation to a vertex", async () => {
            MindMapInfo._setIsViewOnly(false);
            let singleChildScenario = new SingleChildScenario();
            let parent = singleChildScenario.getParentInTree();
            expect(parent.getController().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getProjectSchema().getCenterBubbleUri()
            )).toBeFalsy();
            expect(parent.getController().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getProjectSchema().getCenterBubbleUri()
            )).toBeFalsy();
            expect(parent.getController().convertToDistantBubbleWithUriCanDo(
                new Scenarios.getKaraokeSchemaGraph().getLocationProperty().getUri()
            )).toBeFalsy();
            expect(parent.getController().convertToDistantBubbleWithUriCanDo(
                TestUtils.generateEdgeUri()
            )).toBeFalsy();
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
            await child.getController().convertToDistantBubbleWithUri(
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
            relation.getModel().addIdentification(
                TestUtil.dummyIdentifier()
            );
            let child = relation.getNextBubble();
            GraphServiceMock.getForCentralBubbleUri(
                singleChildScenario.getSubGraphOfB1OnceMergedWithSingleChild()
            );
            child.getController().convertToDistantBubbleWithUri(
                singleChildScenario.getB1Uri()
            );
            relation = parent.getNextBubble();
            expect(
                relation.getModel().hasIdentifications()
            ).toBeTruthy();
        });
        xit("reviews other instances display", function () {
            loadFixtures('graph-element-menu.html');
            var threeBubblesGraphScenario = new Scenarios.threeBubblesGraph();
            var center = threeBubblesGraphScenario.getCenterBubbleInTree();
            var b2 = threeBubblesGraphScenario.getBubble2InTree();
            var newChildOfB2;
            threeBubblesGraphScenario.expandBubble2(b2);
            b2.getController().addChild().then(function (triple) {
                newChildOfB2 = triple.destinationVertex();
            });
            threeBubblesGraphScenario.expandBubble2(b2);
            GraphServiceMock.getForCentralBubbleUri(
                threeBubblesGraphScenario.getSubGraphForB3()
            );
            var b3 = threeBubblesGraphScenario.getBubble3InTree();
            expect(
                b3.getOtherInstanceButton().hasClass("hidden")
            ).toBeTruthy();
            expect(
                newChildOfB2.getOtherInstanceButton().hasClass("hidden")
            ).toBeTruthy();
            expect(newChildOfB2.getController().convertToDistantBubbleWithUriCanDo(
                b3.getModel().getUri()
            )).toBeTruthy();
            newChildOfB2.getController().convertToDistantBubbleWithUri(
                b3.getModel().getUri()
            );
            expect(
                b3.getOtherInstanceButton().hasClass("hidden")
            ).toBeFalsy();
            expect(
                newChildOfB2.getOtherInstanceButton().hasClass("hidden")
            ).toBeFalsy();
        });
    });
    it("automatically expands a child bubble having a single hidden relation when it's parent is expanded", async () => {
        let scenario = await new AutomaticExpandScenario();
        let b3 = scenario.getB3InTree();
        let graphMocks = {};
        graphMocks[b3.getUri()] = scenario.getB3SubGraph();
        graphMocks[scenario.getB31Uri()] = scenario.getB31SubGraph();
        GraphServiceMock.getForCentralBubbleUriMultiple(graphMocks);
        await b3.getController().expand();
        // GraphServiceMock.getForCentralBubbleUri(scenario.getGraph())
        let b31 = TestUtil.getChildWithLabel(
            b3,
            'r31'
        ).getNextBubble();
        expect(
            b31.text()
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
                b1.getModel().getNumberOfChild()
            ).toBe(2);
            await b1.getController().addChild();
            expect(
                b1.getModel().getNumberOfChild()
            ).toBe(3);
        });
        it("sets to zero the number of connected edges to the destination vertex", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let triple = await b1.getController().addChild();
            expect(
                triple.destination.getModel().getNumberOfChild()
            ).toBe(0);
        });
    });

    describe("addSibling", function () {
        it("increments the number of connected edges of the parent model", async function () {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let childVertex = b1.getNextBubble().getNextBubble();
            expect(
                b1.getModel().getNumberOfChild()
            ).toBe(2);
            await childVertex.getController().addSibling();
            expect(
                b1.getModel().getNumberOfChild()
            ).toBe(3);
        });
    });

    describe("becomeParent", function () {
        it("increments number of child", async () => {
            let scenario = await new ThreeScenario();
            let bubble1 = scenario.getBubble1InTree();
            let bubble2 = scenario.getBubble2InTree();
            let newChild = await bubble1.getController().addChild().then(function (triple) {
                return triple.destination;
            });
            await bubble2.getController().moveUnderParent(newChild);
            expect(
                newChild.getModel().getNumberOfChild()
            ).toBe(1);
            newChild.collapse();
            expect(
                newChild.getModel().getNumberOfChild()
            ).toBe(1);
        });
        xit("can become parent of a group relation", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let center = scenario.getCenterVertexInTree();
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
            await groupRelation.getController().moveUnderParent(otherVertex);
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
        xit("does not remove the relation's tag when moving a group relation", async () => {
            let scenario = await new GraphWithSimilarRelationsScenario();
            let center = scenario.getCenterVertexInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherVertex = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            groupRelation.expand();
            let groupRelationNumberOfChild = groupRelation.getNumberOfChild();
            await groupRelation.getController().moveUnderParent(otherVertex);
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(groupRelationNumberOfChild);
        });
    });
});
