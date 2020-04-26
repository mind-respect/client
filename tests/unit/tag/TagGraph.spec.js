import Mock from '../mock/Mock'
import AroundEventTagScenario from "../scenario/AroundEventTagScenario"
import AroundTodoTagScenario from "../scenario/AroundTodoTagScenario"
import TagGraph from '@/tag/TagGraph'
import GraphElementType from '@/graph-element/GraphElementType'
import TestUtil from '../util/TestUtil'
import Selection from '@/Selection'
import KeyCode from 'keycode-js';
import AroundGroup1TwoLevelGroupRelationScenario from "../scenario/AroundGroup1TwoLevelGroupRelationScenario";

describe("TagGraph", () => {
    it("can get the meta center identifier", async () => {
        let scenario = await new AroundEventTagScenario();
        let graph = scenario.getGraph();
        let tagGraph = TagGraph.fromServerFormatAndCenterUri(
            graph,
            scenario.getCenterBubbleUri()
        );
        let metaCenter = tagGraph.getMetaCenter(
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

    it("displays the related bubbles", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventCenter = scenario.getEventBubbleInTree();
        let event1 = TestUtil.getChildDeepWithLabel(
            eventCenter,
            "e1"
        );
        expect(
            event1.isVertex()
        ).toBeTruthy();
        let event2 = TestUtil.getChildDeepWithLabel(
            eventCenter,
            "e2"
        );
        expect(
            event2.isVertex()
        ).toBeTruthy();
    });
    it("builds relation of type meta", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventBubble = scenario.getEventBubbleInTree();
        let relation = eventBubble.getNextBubble();
        expect(
            relation.getGraphElementType()
        ).toBe(GraphElementType.MetaRelation);
    });
    //cant make test
    it("prevents from editing relations of type meta", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventBubble = scenario.getEventBubbleInTree();
        let tagRelation = eventBubble.getNextBubble();
        Selection.setToSingle(
            tagRelation
        );
        expect(
            tagRelation.getLabel()
        ).toBe("");
        TestUtil.pressKey("l");
        TestUtil.pressKeyCode(KeyCode.KEY_RETURN);
        await scenario.nextTickPromise(1);
        expect(
            tagRelation.getLabel()
        ).toBe("");
    });
    it("inverts the meta relations", async () => {
        let scenario = await new AroundEventTagScenario();
        let eventMetaBubble = scenario.getEventBubbleInTree();
        let tagRelation = eventMetaBubble.getNextBubble();
        let eventBubble = tagRelation.getNextBubble();
        expect(
            tagRelation.isInverse()
        ).toBeTruthy();
        expect(
            tagRelation.getSourceVertex().getUri()
        ).toBe(
            eventBubble.getUri()
        );
        expect(
            tagRelation.getDestinationVertex().getUri()
        ).toBe(
            eventMetaBubble.getUri()
        );
    });
    it("groups tagged edges by source vertex", async () => {
        let scenario = await new AroundTodoTagScenario();
        let toDoMetaBubble = scenario.getCenterInTree();
        expect(
            toDoMetaBubble.getNumberOfChild()
        ).toBe(2);
        expect(TestUtil.hasDeepChildWithLabel(
            toDoMetaBubble,
            "e1"
        )).toBeTruthy();
        let sourceVertexAsGroupRelation = TestUtil.getChildDeepWithLabel(
            toDoMetaBubble,
            "e1"
        );
        expect(
            sourceVertexAsGroupRelation.isMetaGroupVertex()
        ).toBeTruthy();
        sourceVertexAsGroupRelation.expand();
        expect(
            sourceVertexAsGroupRelation.getNumberOfChild()
        ).toBe(2);
        expect(
            TestUtil.hasDeepChildWithLabel(sourceVertexAsGroupRelation, "e2")
        ).toBeTruthy();
    });
    it("prevents group source vertices to be leaves when they are expanded", async () => {
        let scenario = await new AroundTodoTagScenario();
        let toDoMetaBubble = scenario.getCenterInTree();
        let sourceVertexAsGroupRelation = TestUtil.getChildDeepWithLabel(
            toDoMetaBubble,
            "e1"
        );
        expect(
            sourceVertexAsGroupRelation.isMetaGroupVertex()
        ).toBeTruthy();
        expect(
            sourceVertexAsGroupRelation.getNumberOfChild()
        ).toBe(2);
        expect(
            sourceVertexAsGroupRelation.canExpand()
        ).toBeTruthy();
        expect(
            sourceVertexAsGroupRelation.isLeaf()
        ).toBeTruthy();
        sourceVertexAsGroupRelation.expand();
        expect(
            sourceVertexAsGroupRelation.canExpand()
        ).toBeFalsy();
        expect(
            sourceVertexAsGroupRelation.isLeaf()
        ).toBeFalsy();
    });
    it("collapses group source vertices", async () => {
        let scenario = await new AroundTodoTagScenario();
        let toDoMetaBubble = scenario.getCenterInTree();
        let sourceVertexAsGroupRelation = TestUtil.getChildDeepWithLabel(
            toDoMetaBubble,
            "e1"
        );
        expect(
            sourceVertexAsGroupRelation.isMetaGroupVertex()
        ).toBeTruthy();
        expect(
            sourceVertexAsGroupRelation.canExpand()
        ).toBeTruthy();
    });
    it("has the number of tagged relations for source vertex groups", async () => {
        let scenario = await new AroundTodoTagScenario();
        let toDoMetaBubble = scenario.getCenterInTree();
        let sourceVertexAsGroupRelation = TestUtil.getChildDeepWithLabel(
            toDoMetaBubble,
            "e1"
        );
        expect(
            sourceVertexAsGroupRelation.getNumberOfChild()
        ).toBe(2);
    });
    it("excludes the source vertex in it's number of hidden child for a vertex under a source vertex", async () => {
        let scenario = await new AroundTodoTagScenario();
        let toDoMetaBubble = scenario.getCenterInTree();
        let sourceVertexAsGroupRelation = TestUtil.getChildDeepWithLabel(
            toDoMetaBubble,
            "e1"
        );
        sourceVertexAsGroupRelation.expand();
        let e2 = TestUtil.getChildDeepWithLabel(
            sourceVertexAsGroupRelation,
            "e2"
        );
        expect(
            e2.getNumberOfChild()
        ).toBe(1);
    });
    it("excludes the source vertex in it's child for a vertex under a source vertex", async () => {
        let scenario = await new AroundTodoTagScenario();
        let toDoMetaBubble = scenario.getCenterInTree();
        let sourceVertexAsGroupRelation = TestUtil.getChildDeepWithLabel(
            toDoMetaBubble,
            "e1"
        );
        sourceVertexAsGroupRelation.expand();
        let e3 = TestUtil.getChildDeepWithLabel(
            sourceVertexAsGroupRelation,
            "e3"
        );
        expect(
            e3.getLabel()
        ).toBe("e3");
        expect(
            e3.isVertex()
        ).toBeTruthy();
        await scenario.expandE3(
            e3
        );
        expect(
            e3.getNumberOfChild()
        ).toBe(2);
        expect(
            TestUtil.hasDeepChildWithLabel(
                e3,
                "e1"
            )
        ).toBeFalsy();
    });
    it("prevents from duplicating when group vertex has a single child", async () => {
        let scenario = await new AroundGroup1TwoLevelGroupRelationScenario();
        let center = scenario.getCenterInTree();
        let groupVertex = TestUtil.getChildDeepWithLabel(
            center,
            "other center"
        );
        expect(
            groupVertex.getGraphElementType()
        ).toBe(GraphElementType.MetaGroupVertex);
        groupVertex.expand();
        expect(
            groupVertex.getNumberOfChild()
        ).toBe(1);
    });
});