import Mock from '../../mock/Mock'
import ThreeScenario from "../../scenario/ThreeScenario";
import GroupRelationsScenario from "../../scenario/GroupRelationsScenario";
import HiddenGroupRelationsScenario from "../../scenario/HiddenGroupRelationsScenario";
import TestUtil from '../../util/TestUtil'
import DistantGraphScenario from "../../scenario/DistantGraphScenario";
import CreationDateScenario from "../../scenario/CreationDateScenario";
import ThreeLevelDeepGroupRelationScenario from "../../scenario/ThreeLevelDeepGroupRelationScenario";
import RelationIn2GroupRelationsScenario from "../../scenario/RelationIn2GroupRelationsScenario";

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
        let triple1 = await bubble1.controller().addChild();
        let triple2 = await bubble1.controller().addChild();
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

    it("preserves direction with parent vertex for expanded group relations", async () => {
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
    it("removes hidden properties indicator when expanding group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.collapse();
        expect(
            groupRelation.canExpand()
        ).toBeTruthy();
        groupRelation.expand();
        expect(
            groupRelation.canExpand()
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

    xit("groups similar relations when connecting to a distant vertex, ", function () {
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

    describe("connectToDistantVertex", async()=>{
        xit("shows child bubbles images of a distant vertex when connecting to a distant vertex", function () {
            connectDistantVertexTest(function (distantBubble) {
                var connectedBubble = distantBubble.getTopMostChildBubble().getTopMostChildBubble();
                expect(
                    connectedBubble.hasImagesMenu()
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

        xit("selects new relation when connecting to a distant vertex", function () {
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
    });

    it("considers vertices under deep group relations non duplicates when they are not", async ()=>{
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let deepGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 3"
        );
        deepGroupRelation.expand();
        let deepVertex = deepGroupRelation.getNextBubble().getNextBubble();
        expect(
            deepVertex.getNbDuplicates()
        ).toBe(0);
    });

    xit("does not duplicate the hidden relation image of a child bubble when creating a distant relationship", function () {
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

    //todo
    xit("contains all elements for deep circular graph", function () {
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

    //not sure I want duplicates in this case
    xit("can have duplicate relations", async () => {
        let scenario = await new RelationIn2GroupRelationsScenario();
        TestUtil.logChildren(scenario.getCenterInTree())
        let impact3InIndividualContext = scenario.getImpact3RelationInTheImpactOnTheIndividualContext();
        let impact3InSocietyContext = scenario.getImpact3RelationInTheImpactOnSocietyContext();
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

    xit("displays suggestions by default", function () {
        var centerBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
        expect(
            centerBubble.getNumberOfChild() > 0
        ).toBeTruthy();
    });

    xit("also displays suggestions by default for children", function () {
        var eventBubble = new Scenarios.oneBubbleHavingSuggestionsGraphNotCentered().getEventBubbleInTree();
        expect(
            eventBubble.getNumberOfChild() > 0
        ).toBeTruthy();
    });

    xit("does not display child suggestions if child has hidden relations", function () {
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

    xit("displays child suggestions after expanding child tree", function () {
        var centerBubble = new Scenarios.withAcceptedSuggestionGraphNotCentered().getCenterBubbleInTree();
        var eventBubble = centerBubble.getTopMostChildBubble().getTopMostChildBubble();
        expect(
            eventBubble.hasHiddenRelationsContainer()
        ).toBeTruthy();
        GraphServiceMock.getForCentralBubbleUri(
            new Scenarios.withAcceptedSuggestionGraph().getGraph()
        );
        eventBubble.controller().expand();
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

    xit("does not display already accepted suggestions after expanding child tree", function () {
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
        eventBubble.controller().expand();
        expect(
            eventBubble.getNumberOfChild()
        ).toBe(3);
    });

    it("sorts center bubble children in order of creation date", async () => {
        let scenario = await new CreationDateScenario();
        let b1 = scenario.getBubble1InTree();
        let rightVertex = b1.getNextChildren(false)[0].getNextBubble();
        expect(
            rightVertex.getLabel()
        ).toBe("b2");
        rightVertex = rightVertex.getDownBubble();
        expect(
            rightVertex.getLabel()
        ).toBe("b4");
        rightVertex = rightVertex.getDownBubble();
        expect(
            rightVertex.getLabel()
        ).toBe("b5");
        rightVertex = rightVertex.getDownBubble();
        expect(
            rightVertex.getLabel()
        ).toBe("b7");
        let leftVertex = b1.getNextChildren(true)[0].getNextBubble();
        expect(
            leftVertex.getLabel()
        ).toBe("b3");
        leftVertex = leftVertex.getDownBubble();
        expect(
            leftVertex.getLabel()
        ).toBe("To do");
        leftVertex = leftVertex.getDownBubble();
        expect(
            leftVertex.getLabel()
        ).toBe("r5");
    });

    it("sorts group relations with the earliest vertex's date", async () => {
        let scenario = await new CreationDateScenario();
        let b1 = scenario.getBubble1InTree();
        let r2 = TestUtil.getChildWithLabel(
            b1,
            "r2"
        );
        let groupRelation = r2.getDownBubble();
        expect(
            groupRelation.getLabel()
        ).toBe("To do");
    });

    it("sorts children of group relation in order of creation date", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        expect(
            groupRelation.isGroupRelation()
        ).toBeTruthy();
        groupRelation.expand();
        let book1 = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        ).getNextBubble();
        expect(
            book1.getLabel()
        ).toBe("book 1");
        let book2 = book1.getDownBubble();
        expect(
            book2.getLabel()
        ).toBe("book 2");
    });

    it("sorts non center bubble children in order of creation date", async () => {
        let scenario = await new CreationDateScenario();
        let b1 = scenario.getBubble1InTree();
        let b7 = TestUtil.getChildWithLabel(
            b1,
            "r6"
        ).getNextBubble();
        await scenario.expandBubble7(
            b7
        );
        let childVertex = b7.getNextBubble().getNextBubble();
        expect(
            childVertex.getLabel()
        ).toBe("b71");
        childVertex = childVertex.getDownBubble();
        expect(
            childVertex.getLabel()
        ).toBe("b72");
        childVertex = childVertex.getDownBubble();
        expect(
            childVertex.getLabel()
        ).toBe("b73");
        childVertex = childVertex.getDownBubble();
        expect(
            childVertex.getLabel()
        ).toBe("b74");
    });

    xit("setups to the left html correctly when adding new suggestion to vertex", async () => {
        let scenario = new Scenarios.threeBubblesGraphFork();
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

    xit("setups to the left html correctly for vertex suggestions", function () {
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

    it("does not change the side of a relation if addding a child to it", async () => {
        let scenario = await new ThreeScenario();
        let centerVertex = scenario.getBubble1InTree();
        let r3 = TestUtil.getChildWithLabel(
            centerVertex,
            "r2"
        );
        let isR3ToTheLeft = r3.isToTheLeft();
        expect(
            r3.isGroupRelation()
        ).toBeFalsy();
        await r3.controller().addChild();
        r3 = TestUtil.getChildWithLabel(
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

    async function connectDistantVertexTest() {
        let distantGraphScenario = await new DistantGraphScenario();
        let graphWithHiddenSimilarRelationsScenario = await new HiddenGroupRelationsScenario();
        return connectBubbleToDistantBubbleWithUriAndGraphWhenConnected(
            distantGraphScenario.getCenterInTree(),
            graphWithHiddenSimilarRelationsScenario.getBubble2().getUri(),
            graphWithHiddenSimilarRelationsScenario.getB2GraphWhenConnectedToDistantBubble()
        );
    }

    function connectBubbleToDistantBubbleWithUriAndGraphWhenConnected(currentBubble, distantBubbleUri, graphOfDistantBubble, callback) {
        GraphServiceMock.getForCentralBubbleUri(
            graphOfDistantBubble
        );
        var hasVisitedCallback = false;
        currentBubble.controller().GraphDisplayerAsRelativeTree.connectVertexToVertexWithUri(
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

    xit("does not add suggestions if its view only", function () {
        MindMapInfo._setIsViewOnly(true);
        var centerBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
        expect(
            centerBubble.hasChildren()
        ).toBeFalsy();
    });

    //todo
    xit("can expand child of meta center having a group relation as a child", function () {
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

    it("can have three level deep group relation", async () => {
        let scenario = await new ThreeLevelDeepGroupRelationScenario();
        let center = scenario.getCenterInTree();
        expect(
            center.getNumberOfChild()
        ).toBe(1);
        let region = TestUtil.getChildWithLabel(
            center,
            "region"
        );
        expect(
            region.isGroupRelation()
        ).toBeTruthy();
        region.expand();
        expect(
            region.getNumberOfChild()
        ).toBe(2);
        let subRegionA = TestUtil.getChildWithLabel(
            region,
            "sub-region-a"
        );
        subRegionA.expand();
        expect(
            subRegionA.getNumberOfChild()
        ).toBe(2);
        expect(
            TestUtil.hasChildWithLabel(
                subRegionA,
                "r1"
            )
        ).toBeTruthy();
        expect(
            TestUtil.hasChildWithLabel(
                subRegionA,
                "r2"
            )
        ).toBeTruthy();
        let subRegionB = TestUtil.getChildWithLabel(
            region,
            "sub-region-b"
        );
        subRegionB.expand();
        expect(
            subRegionB.getNumberOfChild()
        ).toBe(2);
        expect(
            TestUtil.hasChildWithLabel(
                subRegionB,
                "r3"
            )
        ).toBeTruthy();
        expect(
            TestUtil.hasChildWithLabel(
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