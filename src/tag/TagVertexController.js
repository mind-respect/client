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
import Triple from '@/triple/Triple'

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
TagVertexController.prototype.loadForParentIsAlreadyOnMap = function (preventAddInCurrentGraph) {
    return this.loadGraph(
        true,
        preventAddInCurrentGraph
    );
};

TagVertexController.prototype.loadGraph = function (isParentAlreadyOnMap, preventAddInCurrentGraph) {
    isParentAlreadyOnMap = isParentAlreadyOnMap || false;
    let uri = this.model().getUri();
    return GraphService.getForCentralBubbleUri(uri).then((response) => {
        return TagGraph.fromServerFormatAndCenterUri(
            response.data,
            uri
        );
    }).then((tagSubGraph) => {
        let centerTag = tagSubGraph.getMetaCenter();
        let centerBubble = this.model();
        if (isParentAlreadyOnMap) {
            centerBubble.setOriginalMeta(centerTag);
        } else {
            centerBubble.makeCenter();
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(centerBubble);
            }
            centerBubble.setOriginalMeta(centerTag);
        }
        let subGraph = tagSubGraph.getSubGraph();
        subGraph.center = centerBubble;
        let edgesBySourceFork = buildEdgesGroupedBySourceFork(tagSubGraph, centerBubble);
        let edges = [];
        Object.keys(edgesBySourceFork).forEach((forkUri) => {
            let sourceForkAndEdges = edgesBySourceFork[forkUri];
            let child;
            let vertex = subGraph.getHavingUri(
                sourceForkAndEdges.sourceFork.getUri()
            );
            let grandParent = centerBubble.getParentVertex();
            if (grandParent && grandParent.isSameUri(vertex)) {
                return;
            }
            if (sourceForkAndEdges.edges.length === 0) {
                vertex.getNbNeighbors().incrementForShareLevel(centerBubble.getShareLevel());
                child = new TagRelation(vertex, centerBubble);
                edges.push(child);
            } else {
                vertex = new TagGroupVertex(
                    vertex
                );
                if (!preventAddInCurrentGraph) {
                    CurrentSubGraph.get().add(vertex);
                }
                child = new TagRelation(vertex, centerBubble);
                vertex.parentBubble = child;
                vertex.parentVertex = centerBubble;
                child.parentVertex = vertex;
                edges.push(child);
                sourceForkAndEdges.edges.forEach((edge) => {
                    vertex.addChild(edge);
                    if (!preventAddInCurrentGraph) {
                        CurrentSubGraph.get().add(edge);
                    }
                    CurrentSubGraph.get().add(
                        edge.isGroupRelation() ? edge.getNextBubble() : edge.getOtherVertex(vertex)
                    );
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
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(edge);
            }
        });
        if (!subGraph.serverFormat.childrenIndexesCenterTag) {
            GraphElementService.changeChildrenIndex(centerBubble)
        }
        centerBubble.isExpanded = true;
        centerBubble.isCollapsed = false;
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

function buildEdgesGroupedBySourceFork(metaSubGraph, centerFork) {
    let edgesBySourceFork = {};
    let subGraph = metaSubGraph.getSubGraph();
    subGraph.sortedEdgesAndGroupRelations(centerFork).forEach((child) => {
        if (!child.hasIdentification(metaSubGraph.getMetaCenter())) {
            return;
        }
        let sourceFork = subGraph.getHavingUri(
            child.isGroupRelation() ? child.getSourceForkUri() : child.getSourceVertex().getUri()
        );
        if (!edgesBySourceFork[sourceFork.getUri()]) {
            edgesBySourceFork[sourceFork.getUri()] = {
                sourceFork: sourceFork,
                edges: []
            };
        }
        edgesBySourceFork[sourceFork.getUri()].edges.push(
            child
        );
    });
    subGraph.getVertices().forEach((vertex) => {
        if (!vertex.hasIdentification(metaSubGraph.getMetaCenter())) {
            return;
        }
        let isAVertexNotGroupedBySourceVertex = !edgesBySourceFork[vertex.getUri()]
        if (isAVertexNotGroupedBySourceVertex) {
            edgesBySourceFork[vertex.getUri()] = {
                sourceFork: vertex,
                edges: []
            };
        }
    });
    return edgesBySourceFork;
}

TagVertexController.prototype.addTagCanDo = function () {
    return false;
};

TagVertexController.prototype.showTagsCanDo = function () {
    return false;
};

TagVertexController.prototype.addChild = async function () {
    let newVertex = await VertexService.createVertex();
    FriendlyResourceService.updateLabel(
        newVertex,
        ""
    );
    newVertex.controller().addIdentification(
        this.model().getOriginalMeta()
    );
    let newEdge = new TagRelation(newVertex, this.model());
    this.model().addChild(
        newEdge
    );
    CurrentSubGraph.get().add(newEdge);
    this.model().refreshChildren(true);
    await Vue.nextTick();
    GraphElementService.changeChildrenIndex(
        this.model()
    );
    let triple = Triple.fromEdgeAndSourceAndDestinationVertex(
        newEdge,
        this.model(),
        newVertex
    );
    Selection.setToSingle(triple.destination);
    triple.destination.focus();
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
            this.model().getOriginalMeta()
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

TagVertexController.prototype.getSubGraphController = function () {
    return this;
};

api.MetaController = TagVertexController;

export default api;
