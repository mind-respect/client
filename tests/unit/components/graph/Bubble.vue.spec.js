import Mock from '../../mock/Mock'
import CircularityScenario from "../../scenario/CircularityScenario";

describe('Bubble', () => {
    /*No suggestions for now*/
    xit("waits for suggestion to be integrated before handling autocomplete select", function () {
        MindMapInfo._setIsViewOnly(false);
        var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(),
            projectSearchResult = searchProvider.formatResults(
                new Scenarios.getSearchResultsForProject().get(),
                "project"
            )[0];
        var buildAfterAutocompleteMenuSpy = spyOn(VertexUi.VertexUi.prototype, "buildAfterAutocompleteMenu");
        expect(
            buildAfterAutocompleteMenuSpy.calls.count()
        ).toBe(0);
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        VertexUiBuilderCommon._labelAutocompleteSelectHandler(
            bubble1,
            projectSearchResult
        );
        expect(
            buildAfterAutocompleteMenuSpy.calls.count()
        ).toBe(1);
        SchemaServiceMock.getMock(
            new Scenaris.getProjectSchema().getGraph()
        );
        var suggestionInTree = new Scenarios.oneBubbleHavingSuggestionsGraph().getAnySuggestionInTree();
        VertexUiBuilderCommon._labelAutocompleteSelectHandler(
            suggestionInTree,
            projectSearchResult
        );
        expect(
            buildAfterAutocompleteMenuSpy.calls.count()
        ).toBe(1);
        suggestionInTree.integrate(
            TestUtils.generateVertexUri()
        );
        expect(
            buildAfterAutocompleteMenuSpy.calls.count()
        ).toBe(2);
    });
    it("adds duplicate button if has duplicate", async () => {
        let scenario = await new CircularityScenario();
        let bubble1 = scenario.getCenterInTree();
        expect(
            bubble1.getNbDuplicates() > 0
        ).toBeFalsy();
        let bubble2 = scenario.getBubble2InTree();
        await scenario.expandBubble2(bubble2);
        let bubble3 = bubble2.getNextBubble().getNextBubble();
        await scenario.expandBubble3(bubble3);
        expect(
            bubble1.getNbDuplicates() > 0
        ).toBeTruthy();
        expect(
            bubble1.getNbDuplicates() > 0
        ).toBeTruthy();
        let bubble1Duplicate = bubble3.getNextBubble().getNextBubble();
        expect(
            bubble1Duplicate.getNbDuplicates() > 0
        ).toBeTruthy();
    });
    /*todo*/
    xit("doesn't move to a parent bubble that is the child of the dragged one", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        TestUtils.startDragging(bubble1);
        var bubble2 = TestUtils.getChildWithLabel(
            bubble1,
            "r1"
        ).getTopMostChildBubble();
        TestUtils.drop(bubble2);
        expect(
            bubble1.getParentBubble().getUri() === bubble2.getParentBubble().getUri()
        ).toBeFalsy();
    });
    /*todo*/
    xit("cant drag and drop a vertex onto itself", function () {
        MindMapInfo._setIsViewOnly(false);
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        var bubble2 = TestUtils.getChildWithLabel(
            bubble1,
            "r1"
        ).getTopMostChildBubble();
        var newVertex = TestUtils.addTriple(bubble2).destinationVertex();
        TestUtils.startDragging(newVertex);
        var changeEndVertexSpy = spyOn(EdgeController.RelationController.prototype, "changeEndVertex");
        expect(
            changeEndVertexSpy.calls.count()
        ).toBe(0);
        TestUtils.drop(bubble1);
        expect(
            changeEndVertexSpy.calls.count()
        ).toBe(1);
        TestUtils.startDragging(newVertex);
        TestUtils.drop(newVertex);
        expect(
            changeEndVertexSpy.calls.count()
        ).toBe(1);
    });
    /*todo*/
    xit("disables drags and drops when for anonymous user", function () {
        var scenario = new Scenarios.threeBubblesGraph();
        MindMapInfo._setIsViewOnly(true);
        var bubble1 = scenario.getBubble1InTree();
        var bubble2 = TestUtils.getChildWithLabel(
            bubble1,
            "r1"
        ).getTopMostChildBubble();
        var newVertex = TestUtils.addTriple(bubble2).destinationVertex();
        TestUtils.startDragging(newVertex);
        var changeSourceVertexSpy = Mock.getSpy(
            "EdgeService",
            "changeSourceVertex"
        );
        expect(
            changeSourceVertexSpy.calls.count()
        ).toBe(0);
        TestUtils.drop(bubble1);
        expect(
            changeSourceVertexSpy.calls.count()
        ).toBe(0);
    });
    /*todo*/
    xit("detects links and changes them to hyperlinks on blur", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        expect(
            bubble1.getLabel().find("a").length
        ).toBe(0);
        bubble1.getLabel().text(
            "http://bubl.guru"
        ).blur();
        expect(
            bubble1.getLabel().find("a").length
        ).toBe(1);
    });
    /*todo*/
    xit("detects links and changes them to hyperlinks when building vertex", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1();
        var bubble1Ui = new VertexUiBuilder.VertexUiBuilder().create(bubble1, "123");
        expect(
            bubble1Ui.getLabel().find("a").length
        ).toBe(0);
        bubble1.setLabel("http://bubl.guru");
        bubble1Ui = new VertexUiBuilder.VertexUiBuilder().create(
            bubble1,
            "123"
        );
        expect(
            bubble1Ui.getLabel().find("a").length
        ).toBe(1);
    });
    /*todo*/
    xit("builds long hyperlink correctly", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        bubble1.setText("https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d");
        bubble1.getLabel().blur();
        var link = bubble1.getLabel().find("a");
        expect(
            link.prop("href")
        ).toBe(
            "https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d"
        );
    });
    /*todo*/
    xit("does not link non links when there is a link present", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        bubble1.setText("The potatoes are cooked https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d");
        bubble1.getLabel().blur();
        var link = bubble1.getLabel().find("a:first");
        var linkTextWithoutLineBreak = link.text().replace(
            /\n/g,
            ''
        );
        expect(
            linkTextWithoutLineBreak
        ).toBe(
            "https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d"
        );
    });
    /*todo*/
    xit("still wraps long text when there is a link", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        bubble1.setText(
            "The potatoes are cooked for a long time " +
            "so that this makes quite a long text in " +
            "the bubble https://bubl.guru/user/vince/graph/vertex/9d73e974-80c1-4a7c-8736-f0ec6178226d"
        );
        bubble1.getLabel().blur();
        var textBubbleRaw = bubble1.getHtml().text();
        var hasLineBreak = /\r|\n/.exec(textBubbleRaw);
        expect(
            hasLineBreak
        ).not.toBeNull();
    });
});