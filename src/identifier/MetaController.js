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
import GraphElement from '@/graph-element/GraphElement'
import LoadingFlow from '@/LoadingFlow'
import Color from '@/Color'

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

MetaController.prototype.loadForParentIsAlreadyOnMap = function () {
    return this.loadGraph(
        true
    );
};

MetaController.prototype.loadGraph = function (isParentAlreadyOnMap) {
    isParentAlreadyOnMap = isParentAlreadyOnMap || false;
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
        if (!isParentAlreadyOnMap) {
            centerBubble.makeCenter();
            centerBubble.setOriginalMeta(centerTag);
            CurrentSubGraph.get().add(centerBubble);
        }
        let subGraph = metaSubGraph.getSubGraph();
        subGraph.center = centerBubble;
        let edgesBySourceVertex = buildEdgesGroupedBySourceVertex(metaSubGraph, centerBubble);
        let edges = [];
        Object.keys(edgesBySourceVertex).forEach((vertexUri) => {
            let sourceVertexAndEdges = edgesBySourceVertex[vertexUri];
            let child;
            let vertex = subGraph.getVertexWithUri(
                sourceVertexAndEdges.sourceVertex.getUri()
            );
            let grandParent = centerBubble.getParentVertex();
            if (grandParent && grandParent.isSameUri(vertex)) {
                return;
            }
            if (sourceVertexAndEdges.edges.length === 0) {
                vertex.incrementNbConnectedEdges();
                child = new MetaRelation(vertex, centerBubble);
                edges.push(child);
            } else {
                vertex = new MetaGroupVertex(
                    vertex
                );
                CurrentSubGraph.get().add(vertex);
                child = new MetaRelation(vertex, centerBubble);
                edges.push(child);
                sortEdges(sourceVertexAndEdges.edges, vertex).forEach((edgeBetweenGroupAndDestination) => {
                    let destinationVertex = subGraph.getVertexWithUri(
                        edgeBetweenGroupAndDestination.getDestinationVertex().getUri()
                    );
                    let grandChild = new MetaRelation(destinationVertex, vertex);
                    grandChild.setEdgeUri(
                        edgeBetweenGroupAndDestination.getUri()
                    );
                    vertex.addChild(grandChild);
                    CurrentSubGraph.get().add(grandChild);
                });
                if (vertex.getNumberOfChild() > 1) {
                    vertex.expand(true);
                    vertex.collapse(true);
                }
            }
        });
        let childrenIndex = centerBubble.getChildrenIndex();
        sortEdges(edges, centerBubble).forEach((edge) => {
            let endVertex = edge.getOtherVertex(centerBubble);
            let childIndex = childrenIndex[endVertex.getUri()] || childrenIndex[endVertex.getPatternUri()];
            let addLeft;
            if (childIndex !== undefined) {
                addLeft = childIndex.toTheLeft;
            }
            centerBubble.addChild(
                edge,
                addLeft
            );
            CurrentSubGraph.get().add(edge);
        });
        if (!subGraph.serverFormat.childrenIndexesCenterTag) {
            GraphElementService.changeChildrenIndex(centerBubble)
        }
        return centerBubble;
    });
};

MetaController.prototype.expand = function (avoidCenter, avoidExpandChild, avoidShowingLoad) {
    if (!this.expandCanDo()) {
        this.model().isExpanded = true;
        return Promise.resolve();
    }
    if (avoidExpandChild && !this.model().canExpand()) {
        this.model().isExpanded = true;
        return Promise.resolve();
    }
    let promise = Promise.resolve();
    if (!avoidShowingLoad) {
        LoadingFlow.enterNoSpinner();
    }
    this.model().loading = false;
    avoidExpandChild = avoidExpandChild || false;
    this.model().beforeExpand();
    if (!this.model().isExpanded) {
        if (!this.model().isCollapsed) {
            promise = this.loadForParentIsAlreadyOnMap().then(() => {
                if (avoidExpandChild) {
                    return true;
                }
                let expandChildCalls = [];
                this.model().getClosestChildVertices().forEach((childVertex) => {
                    if (childVertex.getNumberOfChild() === 1) {
                        expandChildCalls.push(
                            childVertex.controller().expand(true, true, true)
                        );
                    }
                });
                return Promise.all(expandChildCalls);
            });
        }
    } else {
        this.model().loading = false;
        promise = avoidExpandChild ? Promise.resolve() : this.expandDescendantsIfApplicable();
    }
    return promise.then(() => {
        this.model().expand(avoidCenter, true);
        if (!avoidShowingLoad) {
            Vue.nextTick(() => {
                LoadingFlow.leave();
            });
        }
    });
};

MetaController.prototype.openWikipediaLinkCanDo = function () {
    return this.isSingle() && this.model().wikipediaUrl;
};

MetaController.prototype.openWikipediaLink = function () {
    window.open(this.model().wikipediaUrl, '_blank').focus();
};

function sortEdges(edges, metaGroupVertex) {
    let childrenIndex = metaGroupVertex.getChildrenIndex();
    return edges.sort((a, b) => {
        let vertexA = a.getOtherVertex(metaGroupVertex);
        let vertexB = b.getOtherVertex(metaGroupVertex);
        return GraphElement.sortCompare(
            vertexA,
            vertexB,
            childrenIndex
        );
    });
}

function buildEdgesGroupedBySourceVertex(metaSubGraph, centerVertex) {
    let edgesBySourceVertex = {};
    let excludedDestinationVerticesUri = {};
    let subGraph = metaSubGraph.getSubGraph();
    sortEdges(subGraph.getEdges(), centerVertex).forEach((edge) => {
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

MetaController.prototype.addTagCanDo = function () {
    return false;
};

MetaController.prototype.showTagsCanDo = function () {
    return false;
};

MetaController.prototype.addChild = function () {
    return VertexService.createVertex().then((newVertex) => {
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
            GraphElementService.changeChildrenIndex(
                this.model()
            );
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

MetaController.prototype.becomeParent = function (child, isLeft, index) {
    return Promise.resolve();
    // let promises = [];
    // debugger;
    // promises.push(
    //     child.controller().addTagToChildVertex(this.getOriginalMeta())
    // );
    // if (child.isGroupRelation()) {
    //     promises.push(
    //         child.getClosestChildRelations().map(() => {
    //             // return child.
    //         })
    //     );
    // }
    // child.controller().remove();
    // let newChild = new MetaRelation(child.getNextBubble(), this.model());

};

api.MetaController = MetaController;

export default api;
