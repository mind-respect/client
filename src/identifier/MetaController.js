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
import VertexService from '@/vertex/VertexService'
import Vertex from '@/vertex/Vertex'
import Vue from 'vue'
import Selection from '@/Selection'
import SubGraphController from '@/graph/SubGraphController'
import GraphElementService from '@/graph-element/GraphElementService'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'

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
        centerBubble.setOriginalMeta(centerTag);
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
                CurrentSubGraph.get().add(child);
            } else {
                vertex = new MetaGroupVertex(
                    vertex
                );
                CurrentSubGraph.get().add(vertex);
                child = new MetaRelation(vertex, centerBubble);
                centerBubble.addChild(
                    child
                );
                CurrentSubGraph.get().add(child);
                sourceVertexAndEdges.edges.forEach((edgeBetweenGroupAndDestination) => {
                    let destinationVertex = subGraph.getVertexWithUri(
                        edgeBetweenGroupAndDestination.getDestinationVertex().getUri()
                    );
                    let grandChild = new MetaRelation(destinationVertex, vertex);
                    grandChild.setEdgeUri(
                        edgeBetweenGroupAndDestination.getUri()
                    );
                    vertex.addChild(grandChild);
                    CurrentSubGraph.get().add(grandChild);
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

MetaController.prototype.addChild = function () {
    return VertexService.createVertex().then((response) => {
        let serverFormat = response.data;
        let newVertex = Vertex.fromServerFormat(
            serverFormat
        );
        FriendlyResourceService.updateLabel(
            newVertex,
            ""
        );
        newVertex.controller().addIdentification(
            this.model().getOriginalMeta(),
            true
        );
        let newEdge = new MetaRelation(newVertex, this.model());
        this.model().addChild(
            newEdge
        );
        CurrentSubGraph.get().add(newEdge);
        this.model().refreshChildren();
        Vue.nextTick(() => {
            Selection.setToSingle(newVertex);
            // GraphElementService.changeChildrenIndex(
            //     this.model()
            // );
        })
    });
};

MetaController.prototype.relateToDistantVertexWithUri = function (distantVertexUri, index, isLeft) {
    SubGraphController.withVertex(
        Vertex.withUri(
            distantVertexUri
        )
    ).loadNonCenter().then((distantVertex) => {
        let newEdge = new MetaRelation(distantVertex, this.model());
        distantVertex.parentBubble = newEdge;
        distantVertex.parentVertex = this.model();
        distantVertex.controller().addIdentification(
            this.model().getOriginalMeta(),
            true
        );
        this.model().addChild(
            newEdge,
            isLeft,
            index
        );
        CurrentSubGraph.get().add(
            newEdge
        );
        this.model().refreshChildren();
        Vue.nextTick(() => {
            Selection.setToSingle(distantVertex);
            // GraphElementService.changeChildrenIndex(
            //     this.model()
            // );
        });
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
    return MetaService.mergeTo(this.model(), distantTagUri).then(() => {
        this.getUi().mergeTo(distantTagUri);
        return GraphDisplayer.displayForMetaWithUri(
            distantTagUri
        );
    });
};

MetaController.prototype.mergeCanDo = function () {
    return false;
};

api.MetaController = MetaController;

export default api;
