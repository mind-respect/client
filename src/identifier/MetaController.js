/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElementController from '@/graph-element/GraphElementController'
import MetaService from '@/identifier/MetaService'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphService from '@/graph/GraphService'
import MetaGraph from '@/identifier/MetaGraph'
import MetaRelation from '@/identifier/MetaRelation'
import MetaGroupVertex from '@/identifier/MetaGroupVertex'
import CurrentSubGraph from '@/graph/CurrentSubGraph'

const api = {};

api.withMeta = function (meta) {
    return new MetaController(meta);
};

function MetaController(metas) {
    this.metas = metas;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.metas
    );
}

MetaController.prototype = new GraphElementController.GraphElementController();

MetaController.prototype.loadGraph = function () {
    let uri = this.model().getUri();
    return GraphService.getForCentralBubbleUri(uri).then((response) => {
        let metaSubGraph = MetaGraph.fromServerFormatAndCenterUri(
            response.data,
            uri
        );
        if (metaSubGraph.getMetaCenter()) {
            return Promise.resolve(
                metaSubGraph
            );
        } else {
            MetaService.getForUri(
                uri
            ).then(function (metaCenter) {
                metaSubGraph.setMetaCenter(metaCenter);
                return metaSubGraph;
            });
        }
    }).then((metaSubGraph) => {
        let centerTag = metaSubGraph.getMetaCenter();
        let centerBubble = this.model();
        centerBubble.makeCenter();
        centerBubble.setLabel(centerTag.getLabel());
        centerBubble.setComment(centerTag.getComment());
        let edgesBySourceVertex = buildEdgesGroupedBySourceVertex(metaSubGraph);
        let subGraph = metaSubGraph.getSubGraph();
        CurrentSubGraph.get().add(centerBubble);
        subGraph.center = centerBubble;
        Object.keys(edgesBySourceVertex).forEach((vertexUri) => {
            let sourceVertexAndEdges = edgesBySourceVertex[vertexUri];
            let child;
            let vertex = subGraph.getVertexWithUri(
                sourceVertexAndEdges.sourceVertex.getUri()
            );
            if (sourceVertexAndEdges.edges.length === 0) {
                vertex.incrementNbConnectedEdges();
                child = new MetaRelation(vertex, centerBubble);
                centerBubble.addChild(
                    child
                );
            } else {
                vertex = new MetaGroupVertex(
                    vertex
                );
                child = new MetaRelation(vertex, centerBubble);
                centerBubble.addChild(
                    child
                );
                sourceVertexAndEdges.edges.forEach((edgeBetweenGroupAndDestination) => {
                    let destinationVertex = subGraph.getVertexWithUri(
                        edgeBetweenGroupAndDestination.getDestinationVertex().getUri()
                    );
                    let grandChild = new MetaRelation(destinationVertex, vertex);
                    grandChild.setEdgeUri(
                        edgeBetweenGroupAndDestination.getUri()
                    );
                    vertex.addChild(grandChild);
                    // api._setupMetaEdgeUi(edgeBetweenGroupAndDestinationUi);
                });
                if (vertex.getNumberOfChild() > 1) {
                    vertex.expand();
                    vertex.collapse();
                }
            }
        });
        return centerBubble;
    });
};

function buildEdgesGroupedBySourceVertex(metaSubGraph) {
    let edgesBySourceVertex = {};
    let excludedDestinationVerticesUri = {};
    let subGraph = metaSubGraph.getSubGraph();
    subGraph.getEdges().forEach((edge) => {
        if (!edge.hasIdentification(metaSubGraph.getMetaCenter())) {
            return;
        }
        let sourceVertex = subGraph.getVertexWithUri(
            edge.getSourceVertex().getUri()
        );
        if (!edgesBySourceVertex[sourceVertex.getUri()]) {
            edgesBySourceVertex[sourceVertex.getUri()] = {
                sourceVertex: sourceVertex,
                destinationVertex: subGraph.getVertexWithUri(edge.getDestinationVertex().getUri()),
                edges: []
            };
        }
        edgesBySourceVertex[sourceVertex.getUri()].edges.push(
            edge
        );
        excludedDestinationVerticesUri[edge.getDestinationVertex().getUri()] = true;
    });
    Object.keys(edgesBySourceVertex).forEach((vertexUri) => {
        let sourceVertexAndEdges = edgesBySourceVertex[vertexUri];
        let areDestinationVerticesGroupedBySourceVertex = sourceVertexAndEdges.edges.length > 1;
        if (!areDestinationVerticesGroupedBySourceVertex) {
            return;
        }
        sourceVertexAndEdges.edges.forEach(function (edge) {
            excludedDestinationVerticesUri[
                edge.getDestinationVertex().getUri()
                ] = true;
        });
    });
    subGraph.getVertices().forEach((vertex) => {
        let isAVertexNotGroupedBySourceVertex = !edgesBySourceVertex[vertex.getUri()] && !excludedDestinationVerticesUri[vertex.getUri()];
        if (isAVertexNotGroupedBySourceVertex) {
            edgesBySourceVertex[vertex.getUri()] = {
                sourceVertex: vertex,
                edges: []
            };
        }
    });
    return edgesBySourceVertex;
}

MetaController.prototype.identifyCanDo = function () {
    return false;
};

MetaController.prototype.convertToDistantBubbleWithUriCanDo = function () {
    return true;
};

MetaController.prototype.convertToDistantBubbleWithUri = function (distantTagUri) {
    if (!this.convertToDistantBubbleWithUriCanDo(distantTagUri)) {
        return Promise.reject();
    }
    this.getUi().beforeConvertToDistantBubbleWithUri();
    return MetaService.mergeTo(this.model(), distantTagUri).then(function () {
        this.getUi().mergeTo(distantTagUri);
        return GraphDisplayer.displayForMetaWithUri(
            distantTagUri
        );
    }.bind(this));
};

MetaController.prototype.mergeCanDo = function () {
    return false;
};

api.MetaController = MetaController;

export default api;
