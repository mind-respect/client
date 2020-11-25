/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'
import GraphService from '@/graph/GraphService'
import TagGraph from '@/tag/TagGraph'
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
        let children = [];
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
                vertex.parentBubble = vertex.parentVertex = centerBubble;
                children.push(vertex);
            } else {
                vertex = new TagGroupVertex(
                    vertex
                );
                if (!preventAddInCurrentGraph) {
                    CurrentSubGraph.get().add(vertex);
                }
                vertex.parentBubble = centerBubble;
                vertex.parentVertex = centerBubble;
                children.push(vertex);
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
        sortChildren(children, centerBubble).forEach((child) => {
            let endVertex = child.isVertexType() ? child : child.getOtherVertex(centerBubble);
            let childIndex = childrenIndex[endVertex.getUri()] || childrenIndex[endVertex.getCopiedFromUri()];
            let addLeft;
            if (childIndex !== undefined) {
                addLeft = childIndex.toTheLeft;
            }
            centerBubble.addChild(
                child,
                addLeft
            );
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(child);
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

function sortChildren(children, metaGroupVertex) {
    let childrenIndex = metaGroupVertex.getChildrenIndex();
    return children.sort((a, b) => {
        let vertexA = a.isVertexType() ? a : a.getOtherVertex(metaGroupVertex);
        let vertexB = b.isVertexType() ? b : b.getOtherVertex(metaGroupVertex);
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
    subGraph.sortedGraphElements(centerFork).forEach((child) => {
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
    this.model().addChild(
        newVertex
    );
    CurrentSubGraph.get().add(newVertex);
    this.model().refreshChildren(true);
    await Vue.nextTick();
    GraphElementService.changeChildrenIndex(
        this.model()
    );
    Selection.setToSingle(newVertex);
    newVertex.focus();
};

TagVertexController.prototype.relateToDistantVertexWithUri = function (distantVertexUri, index, isLeft) {
    SubGraphController.withVertex(
        Vertex.withUri(
            distantVertexUri
        )
    ).loadNonCenter().then(async (distantVertex) => {
        distantVertex.parentBubble = distantVertex.parentVertex = this.model();
        distantVertex.controller().addIdentification(
            this.model().getOriginalMeta()
        );
        this.model().addChild(
            distantVertex,
            isLeft,
            index
        );
        CurrentSubGraph.get().add(
            distantVertex
        );
        this.model().refreshChildren();
        await Vue.nextTick()
        Selection.setToSingle(distantVertex);
        // GraphElementService.changeChildrenIndex(
        //     this.model()
        // );
    });
};

TagVertexController.prototype.convertToDistantBubbleWithUriCanDo = function (distantVertexUri) {
    return this.model().getUri() !== distantVertexUri;
};

TagVertexController.prototype.remove = function (skipConfirmation) {
    if (!this.model().isCenter && Selection.isSingle() && Selection.isSelected(this.model()) && this.model().getNumberOfChild() > 0) {
        return this.model().getParentBubble().controller().remove(skipConfirmation);
    }
    return VertexController.VertexController.prototype.remove.call(
        this,
        skipConfirmation
    );
};

TagVertexController.prototype.removeDo = function () {
    if (this.model().isCenter) {
        return VertexController.VertexController.prototype.removeDo.call(
            this
        );
    }
    return this.removeTagFromTaggedBubbleAndTagVertex({
        taggedBubble: this.model().getParentBubble(),
        tagVertex: this.model()
    });
};

TagVertexController.prototype.addParentCanDo = function () {
    return false;
}

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
