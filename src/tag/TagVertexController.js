/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'
import GraphService from '@/graph/GraphService'
import TagGraph from '@/tag/TagGraph'
import TagRelation from '@/tag/TagRelation'
import TagGroupVertex from '@/tag/TagGroupVertex'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import VertexService from '@/vertex/VertexService'
import Vertex from '@/vertex/Vertex'
import Vue from 'vue'
import Selection from '@/Selection'
import SubGraphController from '@/graph/SubGraphController'
import GraphElementService from '@/graph-element/GraphElementService'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import GraphElement from '@/graph-element/GraphElement'

const api = {};

api.withMeta = function (meta) {
    return new TagVertexController(meta);
};

function TagVertexController(metas) {
    this.metas = metas;
    VertexController.VertexController.prototype.init.call(
        this,
        this.metas
    );
}

TagVertexController.prototype = new VertexController.VertexController();
TagVertexController.prototype.loadForParentIsAlreadyOnMap = function () {
    return this.loadGraph(
        true
    );
};

TagVertexController.prototype.loadGraph = function (isParentAlreadyOnMap) {
    isParentAlreadyOnMap = isParentAlreadyOnMap || false;
    let uri = this.model().getUri();
    return GraphService.getForCentralBubbleUri(uri).then((response) => {
        return TagGraph.fromServerFormatAndCenterUri(
            response.data,
            uri
        );
    }).then((metaSubGraph) => {
        let centerTag = metaSubGraph.getMetaCenter();
        let centerBubble = this.model();
        if (isParentAlreadyOnMap) {
            centerBubble.setOriginalMeta(centerTag);
        } else {
            centerBubble.makeCenter();
            CurrentSubGraph.get().add(centerBubble);
            centerBubble.setOriginalMeta(centerTag);
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
                child = new TagRelation(vertex, centerBubble);
                edges.push(child);
            } else {
                vertex = new TagGroupVertex(
                    vertex
                );
                CurrentSubGraph.get().add(vertex);
                child = new TagRelation(vertex, centerBubble);
                edges.push(child);
                sortEdges(sourceVertexAndEdges.edges, vertex).forEach((edgeBetweenGroupAndDestination) => {
                    let destinationVertex = subGraph.getVertexWithUri(
                        edgeBetweenGroupAndDestination.getDestinationVertex().getUri()
                    );
                    let grandChild = new TagRelation(destinationVertex, vertex);
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

TagVertexController.prototype.openWikipediaLinkCanDo = function () {
    return this.isSingle() && this.model().wikipediaUrl;
};

TagVertexController.prototype.openWikipediaLink = function () {
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

TagVertexController.prototype.addTagCanDo = function () {
    return false;
};

TagVertexController.prototype.showTagsCanDo = function () {
    return false;
};

TagVertexController.prototype.addChild = function () {
    return VertexService.createVertex().then((newVertex) => {
        FriendlyResourceService.updateLabel(
            newVertex,
            ""
        );
        newVertex.controller().addIdentification(
            this.model().getOriginalMeta(),
            true
        );
        let newEdge = new TagRelation(newVertex, this.model());
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

TagVertexController.prototype.relateToDistantVertexWithUri = function (distantVertexUri, index, isLeft) {
    SubGraphController.withVertex(
        Vertex.withUri(
            distantVertexUri
        )
    ).loadNonCenter().then((distantVertex) => {
        let newEdge = new TagRelation(distantVertex, this.model());
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

TagVertexController.prototype.convertToDistantBubbleWithUriCanDo = function (distantVertexUri) {
    return this.model().getUri() !== distantVertexUri;
};
//
// TagVertexController.prototype.convertToDistantBubbleWithUri = function (distantTagUri) {
//     if (!this.convertToDistantBubbleWithUriCanDo(distantTagUri)) {
//         return Promise.reject();
//     }
//     let beforeMergeLabel = this.model().getLabel();
//     return TagService.mergeTo(this.model(), distantTagUri).then(() => {
//         this.getUi().mergeTo(distantTagUri);
//         return GraphDisplayer.displayForMetaWithUri(
//             distantTagUri
//         );
//     });
// };


TagVertexController.prototype.setShareLevelCanDo = function () {
    return false;
};

TagVertexController.prototype.becomeParent = function (child, isLeft, index) {
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

api.MetaController = TagVertexController;

export default api;