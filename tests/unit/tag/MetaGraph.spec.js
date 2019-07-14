import Mock from '../mock/Mock'
import AroundEventTagScenario from "../scenario/AroundEventTagScenario"
import MetaGraph from '@/identifier/MetaGraph'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'

describe("MetaGraph", () => {
    it("can get the meta center identifier", async () => {
        let scenario = await new AroundEventTagScenario();
        let graph = scenario.getGraph();
        let metaGraph = MetaGraph.fromServerFormatAndCenterUri(
            graph,
            scenario.getCenterBubbleUri()
        );
        let metaCenter = metaGraph.getMetaCenter(
            graph
        );
        expect(
            metaCenter.getExternalResourceUri()
        ).toBe("http://rdf.freebase.com/rdf/time/event");
        expect(
            metaCenter.getLabel()
        ).toBe("Event");
    });
    it("displays the meta center identifier as the center bubble", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventBubble = scenario.getEventBubbleInTree();
        expect(
            eventBubble.isCenterBubble()
        ).toBeTruthy();
    });
    it("sets right graph element type to meta bubble", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventBubble = scenario.getEventBubbleInTree();
        expect(
            eventBubble.getGraphElementType()
        ).toBe(GraphElementType.Meta);
    });

    it("has the label", async () => {
        let scenario = await new AroundEventTagScenario();
        var eventBubble = scenario.getEventBubbleInTree();
        expect(
            eventBubble.text()
        ).toBe("Event");
    });

    xit("displays the related bubbles", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventCenter = scenario.getEventBubbleInTree();
        let event1 = TestUtil.getChildWithLabel(
            eventCenter,
            "e1"
        ).getNextBubble();
        expect(
            event1.isVertex()
        ).toBeTruthy();
        let event2 = TestUtil.getChildWithLabel(
            eventCenter,
            "e2"
        ).getNextBubble();
        expect(
            event2.isVertex()
        ).toBeTruthy();
    });
    xit("builds relation of type meta", function () {
        var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
        var relation = eventBubble.getTopMostChildBubble();
        expect(
            relation.getGraphElementType()
        ).toBe(GraphElementType.MetaRelation);
    });
    //cant make test
    xit("prevents from editing relations of type meta", function () {
        var eventBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
        var relation = eventBubble.getTopMostChildBubble();
        SelectionHandler.setToSingleRelation(
            relation
        );
        expect(
            relation.text()
        ).toBe("meta");
        TestUtils.pressKeyInBubble("l", relation);
        TestUtils.pressEnterInBubble(relation);
        expect(
            relation.text()
        ).toBe("meta");
    });
    xit("inverts the meta relations", function () {
        var eventMetaBubble = new Scenarios.aroundEventIdentifier().getEventBubbleInTree();
        var relation = eventMetaBubble.getTopMostChildBubble();
        var eventBubble = relation.getTopMostChildBubble();
        expect(
            relation.isInverse()
        ).toBeTruthy();
        expect(
            relation.getModel().getSourceVertex().getUri()
        ).toBe(
            eventBubble.getModel().getUri()
        );
        expect(
            relation.getModel().getDestinationVertex().getUri()
        ).toBe(
            eventMetaBubble.getModel().getUri()
        );
    });
    xit("groups tagged edges by source vertex", function () {
        var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
        expect(
            toDoMetaBubble.getNumberOfChild()
        ).toBe(2);
        expect(TestUtils.hasChildWithLabel(
            toDoMetaBubble,
            "e1"
        )).toBeTruthy();
        var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
            toDoMetaBubble,
            "e1"
        ).getTopMostChildBubble();
        sourceVertexAsGroupRelation.expand();
        expect(
            sourceVertexAsGroupRelation.getNumberOfChild()
        ).toBe(2);
        var e2 = TestUtils.getChildWithLabel(
            sourceVertexAsGroupRelation,
            "r1"
        ).getTopMostChildBubble();
        expect(
            e2.text()
        ).toBe("e2");
    });
    xit("collapses group source vertices", function () {
        var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
        var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
            toDoMetaBubble,
            "e1"
        ).getTopMostChildBubble();
        expect(
            sourceVertexAsGroupRelation.isCollapsed()
        ).toBeTruthy();
    });
    xit("has the number of tagged relations for source vertex groups", function () {
        var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
        var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
            toDoMetaBubble,
            "e1"
        ).getTopMostChildBubble();
        expect(
            sourceVertexAsGroupRelation.getNumberOfHiddenRelations()
        ).toBe(2);
    });
    xit("excludes the source vertex in it's number of hidden child for a vertex under a source vertex", function () {
        var toDoMetaBubble = new Scenarios.aroundTodoIdentifier().getTodoBubbleInTree();
        var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
            toDoMetaBubble,
            "e1"
        ).getTopMostChildBubble();
        var e2 = TestUtils.getChildWithLabel(
            sourceVertexAsGroupRelation,
            "r1"
        ).getTopMostChildBubble();
        expect(
            e2.getNumberOfHiddenRelations()
        ).toBe(0);
    });
    xit("excludes the source vertex in it's child for a vertex under a source vertex", function () {
        var aroundTodoScenario = new Scenarios.aroundTodoIdentifier();
        var toDoMetaBubble = aroundTodoScenario.getTodoBubbleInTree();
        var sourceVertexAsGroupRelation = TestUtils.getChildWithLabel(
            toDoMetaBubble,
            "e1"
        ).getTopMostChildBubble();
        var e3 = TestUtils.getChildWithLabel(
            sourceVertexAsGroupRelation,
            "r2"
        ).getTopMostChildBubble();
        expect(
            e3.text()
        ).toBe("e3");
        expect(
            e3.isVertex()
        ).toBeTruthy();
        aroundTodoScenario.expandE3(
            e3
        );
        expect(
            e3.getNumberOfChild()
        ).toBe(2);
        expect(
            TestUtils.hasChildWithLabel(
                e3,
                "r2"
            )
        ).toBeFalsy();
    });
});