import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario"
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import Selection from '@/Selection'

describe("GraphElement", () => {

    xit("can tell the difference between vertex and schema", async () => {
        let scenario = await new ThreeScenario();
        let vertex = scenario.getBubble1Ui();
        var schema = new Scenarios.getKaraokeSchemaGraph().getSchemaUi();
        expect(
            vertex.isVertex()
        ).toBeTruthy();
        expect(
            vertex.isSchema()
        ).toBeFalsy();
        expect(
            schema.isVertex()
        ).toBeFalsy();
        expect(
            schema.isSchema()
        ).toBeTruthy();
    });

    //todo
    xit("adds the same identification to other instances of the element", function () {
        var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
        var karaokeIdentification = Tag.fromFriendlyResource(
            new Scenarios.getKaraokeSchemaGraph().getSchema()
        );
        expect(
            bubble1Duplicate.getModel().hasIdentifications()
        ).toBeFalsy();
        karaokeIdentification.makeGeneric();
        bubble1.controller().addIdentification(
            karaokeIdentification
        );
        expect(
            bubble1Duplicate.getModel().hasIdentifications()
        ).toBeTruthy();
    });

    //todo
    xit("is no longer draggable when in edit mode", function () {
        var threeBubblesGraph = new Scenarios.threeBubblesGraph();
        var bubble2 = threeBubblesGraph.getBubble2InTree();
        expect(
            bubble2.getHtml()[0].hasAttribute("draggable")
        ).toBeTruthy()
        bubble2.editMode();
        expect(
            bubble2.getHtml()[0].hasAttribute("draggable")
        ).toBeFalsy();
    });

    //todo
    xit("is draggable again when leaving edit mode", function () {
        var threeBubblesGraph = new Scenarios.threeBubblesGraph();
        var bubble2 = threeBubblesGraph.getBubble2InTree();
        bubble2.editMode();
        expect(
            bubble2.getHtml()[0].hasAttribute("draggable")
        ).toBeFalsy();
        bubble2.leaveEditMode();
        expect(
            bubble2.getHtml()[0].hasAttribute("draggable")
        ).toBeTruthy();
    });
    // it("non draggable elements are not made draggable after leaving edit mode", function () {
    //     var threeBubblesGraph = new Scenarios.threeBubblesGraph();
    //     var aRelation = threeBubblesGraph.getBubble1InTree().getTopMostChildBubble();
    //     expect(
    //         aRelation.getHtml()
    //     ).not.toHaveAttr("draggable");
    //     aRelation.editMode();
    //     expect(
    //         aRelation.getHtml()
    //     ).not.toHaveAttr("draggable");
    //     aRelation.leaveEditMode();
    //     expect(
    //         aRelation.getHtml()
    //     ).not.toHaveAttr("draggable");
    // });
    //todo
    xit("prevents iframe injection", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        bubble1.setText("<iframe></iframe>");
        expect(
            bubble1.getLabel().html()
        ).toBe("");
    });
    //todo
    xit("prevents script injection", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        bubble1.setText("<script>alert('yo')</script>");
        expect(
            bubble1.getLabel().html()
        ).toBe("");
    });

    //todo
    xit("changes label of duplicate relations", function () {
        var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup(),
            impact3InTheIndividualContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext(),
            impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();

        impact3InTheIndividualContext.focus();
        impact3InTheIndividualContext.getLabel().append(" new text");
        impact3InTheIndividualContext.getLabel().blur();
        expect(
            impact3InTheIndividualContext.text()
        ).toBe(
            "impact 3 new text"
        );
        expect(
            impact3InSocietyContext.text()
        ).toBe(
            "impact 3 new text"
        );
    });

    //todo
    xit("changes label of duplicate vertices", function () {
        var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
        bubble1.focus();
        bubble1.getLabel().append(" new text");
        bubble1.getLabel().blur();
        expect(
            bubble1.text()
        ).toBe(
            "b1 new text"
        );
        expect(
            bubble1Duplicate.text()
        ).toBe(
            "b1 new text"
        );
    });

    //todo
    xit("comparing label sets html markup", function () {
        var scenario = new Scenarios.threeBubblesGraph();
        var bubble1 = scenario.getBubble1InTree();
        bubble1.getModel().addIdentification(
            Tag.fromFriendlyResource(
                bubble1.getModel()
            )
        );
        bubble1.setText("banana");
        bubble1.getModel().setLabel("banana");
        expect(
            bubble1.getLabel()
        ).not.toContainElement(
            "del"
        );
        TestUtils.enterCompareFlowWithGraph(
            SubGraph.fromServerFormat(
                scenario.getGraph()
            )
        );
        expect(
            bubble1.getLabel()
        ).toContainElement(
            "del"
        );
    });

    //todo
    xit("re-compares label after label change in comparison mode", function () {
        var scenario = new Scenarios.threeBubblesGraph();
        var bubble1 = scenario.getBubble1InTree();
        bubble1.getModel().addIdentification(
            Tag.fromFriendlyResource(
                bubble1.getModel()
            )
        );
        TestUtils.enterCompareFlowWithGraph(
            SubGraph.fromServerFormat(
                scenario.getGraph()
            )
        );
        expect(
            bubble1.getLabel()
        ).not.toContainElement(
            "del"
        );
        bubble1.setText("banana");
        bubble1.getLabel().blur();
        expect(
            bubble1.getLabel()
        ).toContainElement(
            "del"
        );
    });

    //todo
    xit("does not compare label when changing text when a comparison suggestion to remove", function () {
        var scenario = new Scenarios.threeBubblesGraphFork();
        var b1Fork = scenario.getBubble1InTree();
        var destinationVertex = TestUtils.generateVertex();
        destinationVertex.setLabel("new vertex");
        var edge = TestUtils.generateEdge(
            b1Fork.getUri(),
            destinationVertex.getUri()
        );
        edge.setLabel("new relation");
        GraphDisplayerAsRelativeTree.addEdgeAndVertex(
            b1Fork,
            edge,
            destinationVertex
        );
        var newRelation = TestUtils.getChildWithLabel(
            b1Fork,
            "new relation"
        );
        expect(
            newRelation.isAComparisonSuggestionToRemove()
        ).toBeFalsy();
        TestUtils.enterCompareFlowWithGraph(
            SubGraph.fromServerFormat(
                new Scenarios.threeBubblesGraph().getGraph()
            )
        );
        newRelation = TestUtils.getChildWithLabel(
            b1Fork,
            "new relation"
        );
        expect(
            newRelation.isAComparisonSuggestionToRemove()
        ).toBeTruthy();
        newRelation.setText("banana");
        newRelation.getLabel().blur();
        expect(
            newRelation.getLabel()
        ).not.toContainElement(
            "del"
        );
    });

    //todo
    xit("updates input label if model text is different than input text in label update", function () {
        var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        b1.getModel().setLabel("pine apple");
        expect(
            b1.getLabel().text()
        ).not.toBe("pine apple");
        b1.labelUpdateHandle();
        expect(
            b1.getLabel().text()
        ).toBe("pine apple");
    });

    //todo
    xit("can update model suggestion label in comparison mode", function () {
        var suggestionUi = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
        TestUtils.enterCompareFlowWithGraph(
            SubGraph.fromServerFormat(
                new Scenarios.threeBubblesGraph().getGraph()
            )
        );
        SuggestionServiceMock.accept();
        suggestionUi.setText("something");
        suggestionUi.getLabel().blur();
        expect(
            suggestionUi.text()
        ).toBe("something");
    });


    it("can get descendants of a bubble where there is a group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let center = scenario.getCenterInTree();
        Selection.reset();
        expect(
            Selection.getNbSelectedRelations()
        ).toBe(0);
        expect(
            Selection.getNbSelectedVertices()
        ).toBe(0);
        center.selectTree();
        expect(
            Selection.getNbSelectedRelations()
        ).toBe(0);
        expect(
            Selection.getNbSelectedVertices()
        ).toBe(9);
    });
});