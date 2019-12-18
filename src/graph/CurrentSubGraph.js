import SubGraph from '@/graph/SubGraph'

const CurrentSubGraph = {};

CurrentSubGraph.set = function (graph) {
    CurrentSubGraph.graph = graph;
};

CurrentSubGraph.get = function () {
    return CurrentSubGraph.graph ? CurrentSubGraph.graph : SubGraph.empty();
};

CurrentSubGraph.graphElementsAsIds = function (graphElements) {
    return graphElements.map((graphElement) => {
        return CurrentSubGraph.graphElementAsId(graphElement);
    });
};

CurrentSubGraph.graphElementAsId = function (graphElement) {
    return {
        uri: graphElement.getUri(),
        uiId: graphElement.getId(),
        type: graphElement.type
    };
};

CurrentSubGraph.idToInstance = function (graphElementAsId) {
    if (!CurrentSubGraph.isIdOnlyGraphElement(graphElementAsId)) {
        return graphElementAsId;
    }
    if (graphElementAsId.type.isVertex()) {
        return CurrentSubGraph.graph.getVertexWithUri(graphElementAsId.uri)
    } else if (graphElementAsId.type.isGroupRelation()) {
        return CurrentSubGraph.graph.getGroupRelationWithUiId(
            graphElementAsId.uiId
        )
    }
    return CurrentSubGraph.graph.getEdgeWithUri(
        graphElementAsId.uri
    )
};

CurrentSubGraph.idsToInstances = function (graphElementsAsIds) {
    return graphElementsAsIds.map((graphElementAsId) => {
        return CurrentSubGraph.idToInstance(graphElementAsId);
    });
};

CurrentSubGraph.isIdOnlyGraphElement = function (graphElement) {
    return graphElement.getLabel === undefined;
};

export default CurrentSubGraph;