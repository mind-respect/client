/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElementController from '@/graph-element/GraphElementController'
import MetaService from '@/identifier/MetaService'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphService from '@/graph/GraphService'
import MetaGraph from '@/identifier/MetaGraph'
import Edge from '@/edge/Edge'
import IdUri from '@/IdUri'

const api = {};

function MetaController(metas) {
    this.metas = metas;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.metas
    );
}

MetaController.prototype = new GraphElementController.GraphElementController();

MetaController.prototype.loadGraph = function (metaAsBubble) {
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
    }).then(function (metaSubGraph) {
        let metaCenter = metaSubGraph.getMetaCenter();
        metaAsBubble.setLabel(metaCenter.getLabel());
        metaAsBubble.setComment(metaCenter.getComment());
        let edgesBySourceVertex = buildEdgesGroupedBySourceVertex(metaSubGraph);
        let subGraph = metaSubGraph.getSubGraph();
        CurrentSubGraph.get().center = metaAsBubble;
        Object.keys(edgesBySourceVertex).forEach(function (vertexUri) {
            let sourceVertexAndEdges = edgesBySourceVertex[vertexUri];
            let child;
            let vertex = subGraph.getVertexWithUri(
                sourceVertexAndEdges.sourceVertex.getUri()
            );
            if (sourceVertexAndEdges.edges.length === 0) {
                child = Edge.withLabelSelfSourceAndDestinationUri(
                    vertex.getLabel(),
                    IdUri.generateUuid(),
                    vertex.getUri(),
                    metaCenter.getUri()
                );
            } else {
                child = Edge.withLabelSelfSourceAndDestinationUri(
                    vertex.getLabel(),
                    IdUri.generateUuid(),
                    vertex.getUri(),
                    metaCenter.getUri()
                );
                child.setSourceVertex(vertex);
                child.setDestinationVertex(metaCenter);
                metaAsBubble.addChild(
                    child
                );
                // var groupVertexUi = graphUiBuilder.addVertex(
                //     vertex,
                //     edgeToGroupVertexUi
                // );
                // graphUiBuilder.getVertexUiBuilder().getClass().completeBuild(
                //     groupVertexUi
                // );
                // graphUiBuilder.setVertexUiBuilder(
                //     previousVertexUiBuilder
                // );
                // graphUiBuilder.getEdgeUiBuilder().getClass().afterChildBuilt(
                //     edgeToGroupVertexUi,
                //     metaCenter,
                //     groupVertexUi
                // );
                // edgeToGroupVertexUi.hideLabel();
                // sourceVertexAndEdges.edges.forEach(function (edgeBetweenGroupAndDestination) {
                //     edgeBetweenGroupAndDestination.setSourceVertex(
                //         groupVertexUi.getModel()
                //     );
                //     var destinationVertex = subGraph.getVertexWithUri(
                //         edgeBetweenGroupAndDestination.getDestinationVertex().getUri()
                //     );
                //     edgeBetweenGroupAndDestination.setDestinationVertex(
                //         destinationVertex
                //     );
                //     var edgeBetweenGroupAndDestinationUi = graphUiBuilder.addEdge(
                //         edgeBetweenGroupAndDestination,
                //         groupVertexUi
                //     );
                //     var destinationVertexUi = graphUiBuilder.addVertex(
                //         destinationVertex,
                //         edgeBetweenGroupAndDestinationUi
                //     );
                //     graphUiBuilder.getEdgeUiBuilder().getClass().afterChildBuilt(
                //         edgeBetweenGroupAndDestinationUi,
                //         groupVertexUi,
                //         destinationVertexUi
                //     );
                //     api._setupMetaEdgeUi(edgeBetweenGroupAndDestinationUi);
                // });
                // if (groupVertexUi.getNumberOfHiddenRelations() > 1) {
                //     groupVertexUi.collapse();
                // }
                return;
            }
        });
        return subGraph;
    });
};

function buildEdgesGroupedBySourceVertex(metaSubGraph) {
    let edgesBySourceVertex = {};
    let excludedDestinationVerticesUri = {};
    let subGraph = metaSubGraph.getSubGraph();
    subGraph.visitEdges(function (edge) {
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
    Object.keys(edgesBySourceVertex).forEach(function (vertexUri) {
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
    subGraph.visitVertices(function (vertex) {
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

MetaController.prototype.wikipediaLinksCanShowInLabel = function () {
    return this.model().getWikipediaLink().then(function (hasLink) {
        return hasLink;
    });
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
    return true;
};

api.MetaController = MetaController;

export default api;
