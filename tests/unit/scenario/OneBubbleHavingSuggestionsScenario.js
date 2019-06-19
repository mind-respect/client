import Scenario from "./Scenario";
import GraphElementType from '@/graph-element/GraphElementType'

let OneBubbleHavingSuggestionsScenario = function () {
    this.dataKey = "oneBubbleHavingSuggestionsGraph.original";
    return this.init();
};

OneBubbleHavingSuggestionsScenario.prototype = new Scenario.Scenario();

OneBubbleHavingSuggestionsScenario.prototype.getVertex = function () {
    return this.vertexWithLabelInServerGraph("Event");
};

OneBubbleHavingSuggestionsScenario.prototype.getVertexUi = function () {
    return this.getVertexWithLabelInTree(
        "Event"
    );
};

OneBubbleHavingSuggestionsScenario.prototype.getAnySuggestionInTree = function () {
    let eventBubble = this.getVertexUi();
    return eventBubble.getClosestChildrenInTypes(
        [GraphElementType.RelationSuggestion]
    )[0].getNextBubble();
};


export default OneBubbleHavingSuggestionsScenario;