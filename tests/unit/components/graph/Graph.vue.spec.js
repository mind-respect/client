import Mock from '../../mock/Mock'
import ThreeScenario from "../../scenario/ThreeScenario";
import GroupRelationsScenario from "../../scenario/GroupRelationsScenario";
import HiddenGroupRelationsScenario from "../../scenario/HiddenGroupRelationsScenario";
import TestUtil from '../../util/TestUtil'

describe("Graph.vue", () => {
    it("distributes triples evenly to the right and left", async () => {
        let scenario = await new ThreeScenario();
        let centerBubble = scenario.getBubble1InTree();
        expect(
            centerBubble.getNextChildren(true).length
        ).toBe(1);
        expect(
            centerBubble.getNextChildren(false).length
        ).toBe(1);
    });

    it("distributes new triples evenly to the right and left", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getCenterInTree();
        let triple1 = await bubble1.getController().addChild();
        let triple2 = await bubble1.getController().addChild();
        await scenario.nextTickPromise();
        expect(
            triple1.edge.isToTheLeft()
        ).toBeFalsy();
        expect(
            triple2.edge.isToTheLeft()
        ).toBeTruthy();
    });

    it("appends to group relation when expanding", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.collapse();
        expect(
            groupRelation.getNextChildren().length
        ).toBe(0);
        groupRelation.expand();
        expect(
            groupRelation.getNextChildren().length
        ).toBe(3)
    });

    it("groups similar relations when they come out of an expanded bubble", async () => {
        let scenario = await new HiddenGroupRelationsScenario();
        let bubble2 = scenario.getBubble2InTree();
        expect(
            bubble2.canExpand()
        ).toBeTruthy();
        await scenario.expandBubble2(
            bubble2
        );
        expect(
            bubble2.canExpand()
        ).toBeFalsy();
        expect(
            bubble2.getNextBubble().isGroupRelation()
        ).toBeTruthy();
    });

    fit("preserves direction with parent vertex for expanded group relations", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        expect(
            scenario.getRelationWithBook1InTree().isInverse()
        ).toBeFalsy();
        expect(
            scenario.getRelationWithBook2InTree().isInverse()
        ).toBeTruthy();
    });
    it("removes hidden properties indicator when expanding group relation", function () {
        var groupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
        expect(
            groupRelation.hasVisibleHiddenRelationsContainer()
        ).toBeTruthy();
        GraphDisplayerAsRelativeTree.expandGroupRelation(
            groupRelation
        );
        expect(
            groupRelation.hasVisibleHiddenRelationsContainer()
        ).toBeFalsy();
    });
    xit("contains all connected elements for included graph elements view", function () {
        var mergeBubbleScenario = new Scenarios.mergeBubbleGraph();
        expect(
            mergeBubbleScenario.getBubble1()
        ).toBeDefined();
        expect(
            mergeBubbleScenario.getRelation1()
        ).toBeDefined();
        expect(
            mergeBubbleScenario.getBubble2()
        ).toBeDefined();
        expect(
            mergeBubbleScenario.getBubble4()
        ).toBeDefined();
        expect(
            mergeBubbleScenario.getRelation4()
        ).toBeDefined();
        expect(
            mergeBubbleScenario.getRelation2()
        ).toBeDefined();
        expect(
            mergeBubbleScenario.getBubble3()
        ).toBeDefined();
    });
    it("can make a vertex connect to a distant vertex", function () {
        connectDistantVertexTest(function (distantBubble) {
            var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                connectedBubble.text()
            ).toBe("b2");
        });
    });

    it("groups similar relations when connecting to a distant vertex, ", function () {
        connectDistantVertexTest(function (distantBubble) {
            var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
            var tShirtBubble = new Scenarios.TreeQuerier(
                connectedBubble.getChildrenContainer()
            ).getGroupRelationWithLabelInTree("T-shirt");
            expect(
                tShirtBubble.isGroupRelation()
            ).toBeTruthy();
        });
    });
    it("shows child bubbles images of a distant vertex when connecting to a distant vertex", function () {
        connectDistantVertexTest(function (distantBubble) {
            var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                connectedBubble.hasImagesMenu()
            ).toBeTruthy();
        });
    });
    it("selects new relation when connecting to a distant vertex", function () {
        connectDistantVertexTest(function (distantBubble) {
            var newRelation = distantBubble.getTopMostChildBubble();
            expect(
                newRelation.isRelation()
            ).toBeTruthy();
            expect(
                newRelation.isSelected()
            ).toBeTruthy();
        });
    });

    it("does not duplicate the hidden relation image of a child bubble when creating a distant relationship", function () {
        var graphWithHiddenSimilarRelationsScenario = new Scenarios.graphWithHiddenSimilarRelations();
        var bubble1 = graphWithHiddenSimilarRelationsScenario.getBubble1InTree();
        var bubble2 = TestUtils.getChildWithLabel(
            bubble1, "r1"
        ).getTopMostChildBubble();
        expect(
            getNumberOfHiddenPropertiesContainer(
                bubble2
            )
        ).toBe(1);
        connectBubbleToDistantBubbleWithUriAndGraphWhenConnected(
            bubble1,
            graphWithHiddenSimilarRelationsScenario.getDistantBubbleUri(),
            graphWithHiddenSimilarRelationsScenario.getDistantBubbleGraphWhenConnectedToBubble1(),
            function (bubble1) {
                bubble2 = TestUtils.getChildWithLabel(
                    bubble1, "r1"
                ).getTopMostChildBubble();
                expect(
                    getNumberOfHiddenPropertiesContainer(
                        bubble2
                    )
                ).toBe(1);
            }
        );
    });

    it("contains all elements for deep circular graph", function () {
        var deepGraphWithCircularity = new Scenarios.deepGraphWithCircularity();
        expect(
            deepGraphWithCircularity.getBubble3InTree()
        ).toBeDefined();
        expect(
            deepGraphWithCircularity.getBubble2InTree()
        ).toBeDefined();
        expect(
            deepGraphWithCircularity.getBubble4InTree()
        ).toBeDefined();
        expect(
            deepGraphWithCircularity.getBubble1InTree()
        ).toBeDefined();
    });

    it("can have duplicate relations", function () {
        var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup(),
            impact3InIndividualContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext(),
            impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();
        expect(
            impact3InIndividualContext.getUri()
        ).toBe(
            impact3InSocietyContext.getUri()
        );
        expect(
            impact3InIndividualContext.getId()
        ).not.toBe(
            impact3InSocietyContext.getId()
        );
    });
    it("completes build of new graph elements when adding new edge and vertex", function () {
        var parent = new Scenarios.threeBubblesGraph().getBubble1InTree();
        var destinationVertex = TestUtils.generateVertex();
        var edge = TestUtils.generateEdge(
            parent.getUri(),
            destinationVertex.getUri()
        );
        var spyOnVertexCompleteBuild = spyOn(VertexUiBuilder, "completeBuild");
        var spyOnEdgeCompleteBuild = spyOn(EdgeUiBuilder, "afterChildBuilt");
        GraphDisplayerAsRelativeTree.addEdgeAndVertex(
            parent,
            edge,
            destinationVertex
        );
        expect(
            spyOnEdgeCompleteBuild.calls.count()
        ).toBe(1);
        expect(
            spyOnVertexCompleteBuild.calls.count()
        ).toBe(1);
    });
    it("completes the build of a property after adding one", function () {
        var schema = new Scenarios.getProjectSchema().getSchemaInTree();
        var propertyUi = GraphDisplayerAsRelativeTree.addProperty(
            GraphElement.withUri(
                TestUtils.generateVertexUri()
            ),
            schema
        );
        expect(
            propertyUi.getModel().getIdentifiers().length
        ).toBe(0);
    });

    it("displays suggestions by default", function () {
        var centerBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
        expect(
            centerBubble.getNumberOfChild() > 0
        ).toBeTruthy();
    });

    it("also displays suggestions by default for children", function () {
        var eventBubble = new Scenarios.oneBubbleHavingSuggestionsGraphNotCentered().getEventBubbleInTree();
        expect(
            eventBubble.getNumberOfChild() > 0
        ).toBeTruthy();
    });

    it("does not display child suggestions if child has hidden relations", function () {
        var centerBubble = new Scenarios.withAcceptedSuggestionGraphNotCentered().getCenterBubbleInTree();
        var eventBubble = centerBubble.getTopMostChildBubble().getTopMostChildBubble();
        eventBubble.getHiddenRelationsContainer().show();
        expect(
            eventBubble.hasHiddenRelations()
        ).toBeTruthy();
        expect(
            eventBubble.getNumberOfChild()
        ).toBe(0);
        expect(
            eventBubble.hasHiddenRelationsContainer()
        ).toBeTruthy();
    });

    it("displays child suggestions after expanding child tree", function () {
        var centerBubble = new Scenarios.withAcceptedSuggestionGraphNotCentered().getCenterBubbleInTree();
        var eventBubble = centerBubble.getTopMostChildBubble().getTopMostChildBubble();
        expect(
            eventBubble.hasHiddenRelationsContainer()
        ).toBeTruthy();
        GraphServiceMock.getForCentralBubbleUri(
            new Scenarios.withAcceptedSuggestionGraph().getGraph()
        );
        eventBubble.getController().expand();
        expect(
            TestUtils.hasChildWithLabel(
                eventBubble,
                "venue"
            )
        ).toBeTruthy();
        var venueBubble = TestUtils.getChildWithLabel(
            eventBubble,
            "venue"
        );
        expect(
            venueBubble.isRelationSuggestion()
        ).toBeTruthy();
    });

    it("does not display already accepted suggestions after expanding child tree", function () {
        var centerBubble = new Scenarios.withAcceptedSuggestionGraphNotCentered().getCenterBubbleInTree();
        var eventBubble = centerBubble.getTopMostChildBubble().getTopMostChildBubble();
        expect(
            eventBubble.hasHiddenRelationsContainer()
        ).toBeTruthy();
        GraphServiceMock.getForCentralBubbleUri(
            new Scenarios.withAcceptedSuggestionGraph().getGraph()
        );
        expect(
            eventBubble.getNumberOfChild()
        ).toBe(0);
        eventBubble.getController().expand();
        expect(
            eventBubble.getNumberOfChild()
        ).toBe(3);
    });

    it("sorts center bubble children in order of creation date", function () {
        var scenario = new Scenarios.creationDateScenario();
        var b1 = scenario.getBubble1InTree();
        var centerBubble = CenterBubble.usingBubble(b1);
        var toTheRightVertex = centerBubble.getToTheRightTopMostChild().getTopMostChildBubble();
        expect(
            toTheRightVertex.text()
        ).toBe("b2");
        var toTheLeftVertex = centerBubble.getToTheLeftTopMostChild().getTopMostChildBubble();
        expect(
            toTheLeftVertex.text()
        ).toBe("b3");
        toTheRightVertex = toTheRightVertex.getBubbleUnder();
        expect(
            toTheRightVertex.text()
        ).toBe("b4");
        toTheLeftVertex = toTheLeftVertex.getBubbleUnder();
        expect(
            toTheLeftVertex.text()
        ).toBe("To do");
        toTheRightVertex = toTheRightVertex.getBubbleUnder();
        expect(
            toTheRightVertex.text()
        ).toBe("b5");
        toTheLeftVertex = toTheLeftVertex.getBubbleUnder().getTopMostChildBubble();
        expect(
            toTheLeftVertex.text()
        ).toBe("b6");
        toTheRightVertex = toTheRightVertex.getBubbleUnder();
        expect(
            toTheRightVertex.text()
        ).toBe("b7");
    });

    it("sorts group relations with the earliest vertex's date", function () {
        var scenario = new Scenarios.creationDateScenario();
        var b1 = scenario.getBubble1InTree();
        var r2 = TestUtils.getChildWithLabel(
            b1,
            "r2"
        );
        var groupRelation = r2.getBubbleUnder();
        expect(
            groupRelation.text()
        ).toBe("To do");
    });

    it("sorts children of group relation in order of creation date", function () {
        var groupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        groupRelation.expand();
        var book1 = TestUtils.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        ).getTopMostChildBubble();
        expect(
            book1.text()
        ).toBe("book 1");
        var book2 = book1.getBubbleUnder();
        expect(
            book2.text()
        ).toBe("book 2");
    });

    it("sorts non center bubble children in order of creation date", function () {
        var scenario = new Scenarios.creationDateScenario();
        var b1 = scenario.getBubble1InTree();
        var b7 = TestUtils.getChildWithLabel(
            b1,
            "r6"
        ).getTopMostChildBubble();
        scenario.expandBubble7(
            b7
        );
        var childVertex = b7.getTopMostChildBubble().getTopMostChildBubble();
        expect(
            childVertex.text()
        ).toBe("b71");
        childVertex = childVertex.getBubbleUnder();
        expect(
            childVertex.text()
        ).toBe("b72");
        childVertex = childVertex.getBubbleUnder();
        expect(
            childVertex.text()
        ).toBe("b73");
        childVertex = childVertex.getBubbleUnder();
        expect(
            childVertex.text()
        ).toBe("b74");
    });

    it("setups to the left html correctly when adding new suggestion to vertex", function () {
        var scenario = new Scenarios.threeBubblesGraphFork();
        var b1Fork = scenario.getBubble1InTree();
        var relation = CenterBubble.usingBubble(
            b1Fork
        ).getToTheLeftTopMostChild();
        expect(
            relation.isRelation()
        ).toBeTruthy();
        expect(
            relation.isToTheLeft()
        ).toBeTruthy();
        var relationText = relation.text();
        relation.remove();
        TestUtils.enterCompareFlowWithGraph(
            SubGraph.fromServerFormat(
                new Scenarios.threeBubblesGraph().getGraph()
            )
        );
        var bubbleToTheLeft = TestUtils.getChildWithLabel(
            b1Fork,
            relationText
        ).getTopMostChildBubble();
        expect(
            bubbleToTheLeft.isToTheLeft()
        ).toBeTruthy();
        expect(
            bubbleToTheLeft.getHtml().closest(".vertex-container").next(
                ".vertical-border"
            ).length
        ).toBeGreaterThan(0);
    });

    it("setups to the left html correctly for vertex suggestions", function () {
        var centerVertex = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
        var suggestionVertex = TestUtils.getChildWithLabel(
            centerVertex,
            "People involved"
        ).getTopMostChildBubble();
        expect(
            suggestionVertex.isToTheLeft()
        ).toBeTruthy();
        expect(
            suggestionVertex.getHtml().closest(".vertex-container").next(
                ".vertical-border"
            ).length
        ).toBeGreaterThan(0);
    });

    it("does not change the side of a relation if addding a child to it", function () {
        var centerVertex = new Scenarios.threeBubblesGraph().getBubble1InTree();
        var r3 = TestUtils.getChildWithLabel(
            centerVertex,
            "r2"
        );
        var isR3ToTheLeft = r3.isToTheLeft();
        MindMapInfo._setIsViewOnly(
            false
        );
        expect(
            r3.isGroupRelation()
        ).toBeFalsy();
        r3.getController().addChild();
        r3 = TestUtils.getChildWithLabel(
            centerVertex,
            "r2"
        );
        expect(
            r3.isGroupRelation()
        ).toBeTruthy();
        expect(
            r3.isToTheLeft()
        ).toBe(isR3ToTheLeft);
    });

    //can't fix : test succeeds when running alone but fails when running all tests
    xit("can display graph around an edge", function () {
        var threeBubblesScenario = new Scenarios.threeBubblesGraph();
        GraphServiceMock.getForCentralBubbleUri(
            threeBubblesScenario.getGraph()
        );
        Mock.setCenterBubbleUriInUrl(
            threeBubblesScenario.getR1Uri()
        );
        GraphDisplayer.displayUsingCentralBubbleUri(
            threeBubblesScenario.getR1Uri()
        );
        var edgeUi = BubbleFactory.getGraphElementFromUri(
            threeBubblesScenario.getR1Uri()
        );
        expect(
            edgeUi.getParentBubble().text()
        ).toBe("b1");
    });

    //can't fix : test succeeds when running alone but fails when running all tests
    xit("can display graph around an edge under a group relation", function () {
        var relationsAsIdentifierScenario = new Scenarios.withRelationsAsIdentifierGraph();
        Mock.setCenterBubbleUriInUrl(
            relationsAsIdentifierScenario.getCenterBubbleUri()
        );
        var center = relationsAsIdentifierScenario.getCenterInTree();
        var groupRelation = TestUtils.getChildWithLabel(
            center,
            "original some relation"
        );
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        var identification = groupRelation.getGroupRelation().getIdentification();
        var edgeUri = identification.getExternalResourceUri();
        expect(
            IdUri.getGraphElementTypeFromUri(
                edgeUri
            )
        ).toBe(GraphElementType.Relation);
        GraphServiceMock.getForCentralBubbleUri(
            relationsAsIdentifierScenario.getGraph()
        );
        Mock.setCenterBubbleUriInUrl(
            edgeUri
        );
        GraphDisplayer.displayForBubbleWithUri(
            edgeUri
        );
        var edgeUi = BubbleFactory.getGraphElementFromUri(
            edgeUri
        );
        expect(
            edgeUi.getParentBubble().isGroupRelation()
        ).toBeTruthy();
    });

    function connectDistantVertexTest(callback) {
        var distantGraphScenario = new Scenarios.getDistantGraph();
        var graphWithHiddenSimilarRelationsScenario = new Scenarios.graphWithHiddenSimilarRelations();
        connectBubbleToDistantBubbleWithUriAndGraphWhenConnected(
            distantGraphScenario.getBubbleInTree(),
            graphWithHiddenSimilarRelationsScenario.getBubble2().getUri(),
            graphWithHiddenSimilarRelationsScenario.getB2GraphWhenConnectedToDistantBubble(),
            callback
        );
    }

    function connectBubbleToDistantBubbleWithUriAndGraphWhenConnected(currentBubble, distantBubbleUri, graphOfDistantBubble, callback) {
        Mock.setGetGraphFromService(
            graphOfDistantBubble
        );
        var hasVisitedCallback = false;
        GraphDisplayerAsRelativeTree.connectVertexToVertexWithUri(
            currentBubble,
            distantBubbleUri,
            function () {
                hasVisitedCallback = true;
                callback(currentBubble);
            }
        );
        expect(
            hasVisitedCallback
        ).toBeTruthy();
    }

    it("does not add suggestions if its view only", function () {
        MindMapInfo._setIsViewOnly(true);
        var centerBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
        expect(
            centerBubble.hasChildren()
        ).toBeFalsy();
    });
    it("can expand child of meta center having a group relation as a child", function () {
        var scenario = new Scenarios.getMetaCenterChildHavingGroupRelation();
        var b1 = scenario.getB1InTree();
        expect(
            b1.text()
        ).toBe("b1");
        scenario.expandBubble1(b1);
        var groupRelation = TestUtils.getChildWithLabel(
            b1,
            "r2"
        );
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            groupRelation.getNumberOfChild()
        ).toBe(2);
    });
    it("can have three level deep group relation", function () {
        var scenario = new Scenarios.threeLevelDeepGroupRelation();
        var center = scenario.centerInTree();
        expect(
            center.getNumberOfChild()
        ).toBe(1);
        var region = TestUtils.getChildWithLabel(
            center,
            "region"
        );
        expect(
            region.isGroupRelation()
        ).toBeTruthy();
        region.expand();
        expect(
            region.getNumberOfChild()
        ).toBe(1);
        var subRegion = TestUtils.getChildWithLabel(
            region,
            "sub-region"
        );
        subRegion.expand();
        expect(
            subRegion.getNumberOfChild()
        ).toBe(2);
        var subRegionA = TestUtils.getChildWithLabel(
            subRegion,
            "sub-region-a"
        );
        subRegionA.expand();
        expect(
            subRegionA.getNumberOfChild()
        ).toBe(2);
        expect(
            TestUtils.hasChildWithLabel(
                subRegionA,
                "r1"
            )
        ).toBeTruthy();
        expect(
            TestUtils.hasChildWithLabel(
                subRegionA,
                "r2"
            )
        ).toBeTruthy();
        var subRegionB = TestUtils.getChildWithLabel(
            subRegion,
            "sub-region-b"
        );
        subRegionB.expand();
        expect(
            subRegionB.getNumberOfChild()
        ).toBe(2);
        expect(
            TestUtils.hasChildWithLabel(
                subRegionB,
                "r3"
            )
        ).toBeTruthy();
        expect(
            TestUtils.hasChildWithLabel(
                subRegionB,
                "r4"
            )
        ).toBeTruthy();
    });

    function getNumberOfHiddenPropertiesContainer(bubble) {
        return bubble.getHtml().find(
            ".hidden-properties-container"
        ).length;
    }
});