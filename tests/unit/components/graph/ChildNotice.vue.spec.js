describe('ChildNotice', () => {
    //todo
    xit("hides the flag instantly on click in order to avoid to handle the click twice", function () {
        var threeBubblesScenario = new Scenarios.threeBubblesGraph();
        var b3 = threeBubblesScenario.getBubble3InTree();
        b3.getHiddenRelationsContainer();
        GraphService.getForCentralBubbleUri = function () {
            //disable callback to be able to test
        };
        expect(
            b3.getHiddenRelationsContainer()._getContent().hasClass("hidden")
        ).toBeFalsy();
        b3.getHiddenRelationsContainer().getHtml().click();
        expect(
            b3.getHiddenRelationsContainer()._getContent().hasClass("hidden")
        ).toBeTruthy();
    });
    //todo
    xit("shows child tree when clicking", function () {
        var threeBubblesScenario = new Scenarios.threeBubblesGraph();
        var b3 = threeBubblesScenario.getBubble3InTree();
        b3.getHiddenRelationsContainer();
        GraphServiceMock.getForCentralBubbleUri(
            threeBubblesScenario.getSubGraphForB3()
        );
        expect(
            b3.getNumberOfChild()
        ).toBe(0);
        b3.getHiddenRelationsContainer().getHtml().click();
        expect(
            b3.getNumberOfChild()
        ).toBe(2);
    });
    //todo
    xit("refreshes number of connected relations", function () {
        var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        var newVertex;
        b1.controller().addChild().then(function (triple) {
            newVertex = triple.destinationVertex();
            return newVertex.controller().addChild();
        }).then(function () {
            return newVertex.controller().addChild();
        }).then(function () {
            newVertex.collapse();
            newVertex.getHiddenRelationsContainer().getHtml();
            var hiddenRelationsText = newVertex.getHiddenRelationsContainer().getHtml().find(
                ".hidden-properties-content"
            ).text();
            expect(
                hiddenRelationsText
            ).toBe("... 2");
        });
    });
});