/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphDisplayer from '@/graph/GraphDisplayer'
import Vertex from '@/vertex/Vertex'
import Edge from '@/edge/Edge'

const api = {};
api.createUsingServerTriple = function (sourceVertex, tripleJson) {
    api.createIntoSourceBubble(
        sourceVertex,
        tripleJson
    );
};
api.createIntoSourceBubble = function (sourceBubble, tripleJson, relationOver) {
    var triple = GraphDisplayer.addEdgeAndVertex(
        sourceBubble,
        Edge.fromServerFormat(tripleJson.edge),
        Vertex.fromServerFormat(tripleJson.end_vertex),
        relationOver
    );
    triple.setServerFormat(tripleJson);
    return triple;
};
export default api;
