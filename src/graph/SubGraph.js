/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Relation from '@/relation/Relation'
import Vertex from '@/vertex/Vertex'
import GraphElement from '@/graph-element/GraphElement'
import GroupRelation from '@/group-relation/GroupRelation'
import GraphElementType from "../graph-element/GraphElementType";
import IdUri from "../IdUri";
import Tag from "../tag/Tag";
import Store from '@/store'

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new api.SubGraph(
        serverFormat,
        undefined,
        true
    );
};
api.fromServerFormatAndCenterUri = function (serverFormat, centerUri) {
    return new api.SubGraph(
        serverFormat,
        centerUri,
        true
    );
};
api.empty = function () {
    return new api.SubGraph(
        {
            edges: {},
            vertices: {},
            groupRelations: {},
            tags: []
        },
        undefined,
        false
    )
};
api.withFacadeAndCenterUri = function (serverFacade, centerUri) {
    return new api.SubGraph(
        serverFacade,
        centerUri,
        false
    );
};

api.SubGraph = function (graph, centerUri, buildFacade) {
    this.otherGraphElements = {};
    this.isCenterTag = centerUri && IdUri.isMetaUri(centerUri);
    if (buildFacade) {
        this.serverFormat = graph;
        this.tagVertices = [];
        this._buildVertices();
        this._buildGroupRelations(centerUri);
        this._buildEdges(centerUri);
    } else {
        this.edges = graph.edges;
        this.vertices = graph.vertices;
        this.groupRelations = graph.groupRelations || {};
        this.tagVertices = graph.tags || [];
    }
    if (centerUri) {
        this.centerUri = centerUri;
    }
};

api.SubGraph.prototype.add = function (graphElement, preventAddOthers) {
    if (graphElement.isCenter) {
        graphElement.parentBubble = graphElement.parentVertex = graphElement;
    }
    if (graphElement.isMeta()) {
        this.addTagVertex(graphElement);
    } else if (graphElement.isEdge()) {
        if (this._isEdgeAlreadyAdded(graphElement)) {
            return;
        }
        this.addEdge(graphElement);
        let endVertex = graphElement.isInverse() ? graphElement.getSourceVertex() : graphElement.getDestinationVertex();
        endVertex.parentBubble = graphElement;
        endVertex.parentVertex = graphElement.parentVertex;
        endVertex.direction = graphElement.direction;
        if (endVertex.getNumberOfChild() === 0) {
            endVertex.isExpanded = true;
        }
        if (!preventAddOthers) {
            this.add(endVertex);
        }
    } else if (graphElement.isVertex()) {
        this.addVertex(graphElement);
    } else if (graphElement.isGroupRelation()) {
        this.groupRelations[graphElement.getUri()] = graphElement;
        if (!preventAddOthers) {
            graphElement.getNextChildren().forEach((child) => {
                child.direction = graphElement.direction;
                child.parentVertex = graphElement.parentVertex;
                child.parentBubble = graphElement;
                this.add(child);
            })
        }
    } else {
        this.addOtherGraphElement(graphElement);
    }
    if (Store.state.isShowTags) {
        graphElement.controller().showTags(true, true, true);
    }
};
api.SubGraph.prototype._isEdgeAlreadyAdded = function (edge) {
    let edgesWithUri = this.edges[edge.getUri()];
    if (!edgesWithUri) {
        return false;
    }
    return edgesWithUri.some((edgeWithUri) => {
        return edgeWithUri.parentBubble.getUri() === edge.parentBubble.getUri();
    });
};

api.SubGraph.prototype.addVertex = function (vertex) {
    if (this.vertices[vertex.getUri()] === undefined) {
        this.vertices[vertex.getUri()] = [];
    }
    let isAlreadyThere = this.vertices[vertex.getUri()].some((_vertex) => {
        return _vertex.getId() === vertex.getId();
    });
    if (isAlreadyThere) {
        return;
    }
    this.vertices[vertex.getUri()].push(vertex);
};

api.SubGraph.prototype.addTagVertex = function (tagVertex) {
    let isAlreadyThere = this.tagVertices.some((_tagVertex) => {
        return _tagVertex.getId() === tagVertex.getId();
    });
    if (isAlreadyThere) {
        return;
    }
    this.tagVertices.push(tagVertex);
};

api.SubGraph.prototype.addEdge = function (edge) {
    if (this.edges[edge.getUri()] === undefined) {
        this.edges[edge.getUri()] = [];
    }
    let isAlreadyThere = this.edges[edge.getUri()].some((_edge) => {
        return _edge.getId() === edge.getId();
    });
    if (isAlreadyThere) {
        return;
    }
    this.edges[edge.getUri()].push(edge);
};

api.SubGraph.prototype.addOtherGraphElement = function (graphElement) {
    if (this.otherGraphElements[graphElement.getUri()] === undefined) {
        this.otherGraphElements[graphElement.getUri()] = [];
    }
    let isAlreadyThere = this.otherGraphElements[graphElement.getUri()].some((_graphElement) => {
        return _graphElement.getId() === graphElement.getId();
    });
    if (isAlreadyThere) {
        return;
    }
    this.otherGraphElements[graphElement.getUri()].push(graphElement);
};

api.SubGraph.prototype.getOtherGraphElementsWithUri = function (uri) {
    return this.otherGraphElements[uri] || [];
};

api.SubGraph.prototype.getOtherGraphElementsWithUriAndId = function (uri, id) {
    return this.getOtherGraphElementsWithUri(uri).filter((graphElement) => {
        return graphElement.getId() === id;
    })[0];
};

api.SubGraph.prototype.remove = function (graphElement) {
    if (graphElement.isEdge()) {
        this.removeEdge(graphElement);
    } else if (graphElement.isVertex()) {
        this.removeVertex(graphElement);
    } else if (graphElement.isGroupRelation()) {
        this.removeGroupRelation(graphElement);
    } else if (graphElement.isMeta()) {
        this.removeTag(graphElement);
    } else {
        this.removeOtherGraphElement(graphElement);
    }
};

api.SubGraph.prototype.rebuild = function () {
    let center = this.center;
    this._reset();
    this.add(center, true);
    center.getDescendants(undefined, undefined, true).forEach((descendant) => {
        this.add(descendant, true);
    });
};

api.SubGraph.prototype._reset = function () {
    this.edges = {};
    this.vertices = {};
    this.groupRelations = {};
    this.tags = [];
};

api.SubGraph.prototype.removeTag = function (tag) {
    let l = this.tagVertices.length;
    while (l--) {
        if (this.tagVertices[l].getId() === tag.getId()) {
            this.tagVertices.splice(l, 1);
            tag.getNextChildren().forEach((child) => {
                this.remove(child)
            });
        }
    }
};

api.SubGraph.prototype.removeGroupRelation = function (groupRelation) {
    delete this.groupRelations[groupRelation.getUri()];
};

api.SubGraph.prototype.removeEdge = function (edge) {
    this.remove(edge.getNextBubble());
    let edges = this.getEdgesWithUri(edge.getUri());
    let l = edges.length;
    while (l--) {
        if (edges[l].getId() === edge.getId()) {
            edges.splice(l, 1);
        }
    }
    if (edges.length === 0) {
        delete this.vertices[edge.getUri()];
    }
};

api.SubGraph.prototype.removeVertex = function (vertex) {
    let vertices = this.getVerticesWithUri(vertex.getUri());
    let l = vertices.length;
    while (l--) {
        if (vertices[l].getId() === vertex.getId()) {
            vertices.splice(l, 1);
        }
    }
    if (vertices.length === 0) {
        delete this.vertices[vertex.getUri()];
    }
};


api.SubGraph.prototype.removeOtherGraphElement = function (graphElement) {
    let graphElements = this.otherGraphElements[graphElement.getUri()] || [];
    let l = graphElements.length;
    while (l--) {
        if (graphElements[l].getId() === graphElement.getId()) {
            graphElements.splice(l, 1);
        }
    }
    if (graphElements.length === 0) {
        delete this.otherGraphElements[graphElement.getUri()];
    }
};

api.SubGraph.prototype.getEdges = function () {
    let edges = Object.values(this.edges);
    //use array flat() when node ^11 LTS gets out
    return [].concat.apply([], edges)
};

api.SubGraph.prototype.sortedGraphElements = function (centerFork) {
    let childrenIndex = centerFork.getChildrenIndex();
    let children = this.getEdges().concat(this.getGroupRelations());
    if (centerFork.isGroupRelation()) {
        children = children.concat(this.getVertices());
    }
    return children.sort((a, b) => {
        let forkA = a.isEdge() ? a.getOtherVertex(centerFork) : a;
        let forkB = b.isEdge() ? b.getOtherVertex(centerFork) : b;
        return GraphElement.sortCompare(
            forkA,
            forkB,
            childrenIndex
        );
    });
};

api.SubGraph.prototype.getVertices = function () {
    let vertices = Object.values(this.vertices);
    //use array flat() when node ^11 LTS gets out
    return [].concat.apply([], vertices)
};

api.SubGraph.prototype.getGroupRelations = function () {
    return Object.values(this.groupRelations);
};

api.SubGraph.prototype.getGraphElements = function () {
    return this.getGroupRelations().concat(this.getEdges()).concat(this.getVertices()).concat(this.tagVertices);
};

api.SubGraph.prototype.getVertexWithUri = function (uri) {
    return this.vertices[uri][0];
};

api.SubGraph.prototype.getGroupRelationWithUri = function (uri) {
    return this.groupRelations[uri];
};

api.SubGraph.prototype.hasUri = function (uri) {
    return this.edges[uri] !== undefined ||
        this.vertices[uri] !== undefined ||
        this.otherGraphElements[uri] !== undefined ||
        this.tagVertices.some((tagVertex) => {
            return tagVertex.getUri() === uri;
        });
};

api.SubGraph.prototype.getArrayHavingUri = function (uri) {
    if (this.vertices[uri] !== undefined) {
        return this.vertices[uri];
    }
    if (this.edges[uri] !== undefined) {
        return this.edges[uri];
    }
    if (this.groupRelations[uri] !== undefined) {
        return [this.groupRelations[uri]]
    }
    if (this.otherGraphElements[uri] !== undefined) {
        return this.otherGraphElements[uri];
    }
    let tagVertex = this.tagVertices.filter((tagVertex) => {
        return tagVertex.getUri() === uri;
    });
    if (tagVertex.length) {
        return tagVertex;
    }
    return [];
};

api.SubGraph.prototype.getHavingUri = function (uri) {
    let array = this.getArrayHavingUri(uri);
    if (array.length > 0) {
        return array[0];
    }
};

api.SubGraph.prototype.getContainerForGraphElementType = function (graphElementType) {
    switch (graphElementType) {
        case GraphElementType.Vertex:
            return this.vertices;
        case GraphElementType.Edge:
            return this.edges;
        case GraphElementType.GroupRelation:
            return this.groupRelations;
        case GraphElementType.Meta:
            return this.tagVertices;
    }
};

api.SubGraph.prototype.getHavingUriAndId = function (uri, id, graphElementType) {
    if (GraphElementType.isEdgeType(graphElementType)) {
        return this.getEdgeWithUriAndId(
            uri,
            id
        );
    }
    switch (graphElementType) {
        case GraphElementType.Vertex:
            return this.getVertexWithUriAndId(uri, id);
        case GraphElementType.GroupRelation:
            return this.groupRelations[uri];
        case GraphElementType.Meta:
            return this.getTagBubbleWithUiId(id)
        default:
            return this.getOtherGraphElementsWithUriAndId(uri, id);
    }
};

api.SubGraph.prototype.getVertexWithUriAndId = function (uri, id) {
    return this.getVerticesWithUri(uri).filter((vertex) => {
        return vertex.getId() === id;
    })[0];
};

api.SubGraph.prototype.getVerticesWithUri = function (uri) {
    return this.vertices[uri] || [];
};

api.SubGraph.prototype.getEdgeWithUri = function (uri) {
    return this.edges[uri][0];
};

api.SubGraph.prototype.getEdgeWithUriAndId = function (uri, id) {
    return this.getEdgesWithUri(uri).filter((edge) => {
        return edge.getId() === id;
    })[0];
};

api.SubGraph.prototype.getEdgesWithUri = function (uri) {
    return this.edges[uri] || [];
};

api.SubGraph.prototype.getGroupRelationWithUiId = function (uiId) {
    return this.getGroupRelations().filter((groupRelation) => {
        return groupRelation.uiId === uiId;
    })[0];
};

api.SubGraph.prototype.getTagBubbleWithUiId = function (uiId) {
    return this.tagVertices.filter((tag) => {
        return tag.uiId === uiId;
    })[0];
};

api.SubGraph.prototype.toServerFormat = function () {
    return this.getGraphElements().reduce
};

api.SubGraph.prototype._buildVertices = function () {
    this.vertices = {};
    Object.values(this.serverFormat.vertices).forEach((vertex) => {
        let facade = Vertex.fromServerFormat(vertex);
        this.addVertex(facade);
    });
};

api.SubGraph.prototype._buildEdges = function () {
    this.edges = {};
    let tag;
    if (this.isCenterTag) {
        tag = Tag.withUri(this.centerUri);
    }
    Object.values(this.serverFormat.edges).forEach((edge) => {
        let facade = Relation.fromServerFormat(edge);
        facade.setSourceVertex(
            this.getHavingUri(facade.getSourceVertex().getUri())
        );
        facade.setDestinationVertex(
            this.getHavingUri(facade.getDestinationVertex().getUri())
        );
        // if (facade.getSourceVertex() === undefined || (!this.isCenterTag && facade.getDestinationVertex() === undefined)) {
        //     return;
        // }
        // if (this.isCenterTag && !facade.hasIdentification(tag)) {
        //     return;
        // }
        this.addEdge(facade);
    });
};

api.SubGraph.prototype._buildGroupRelations = function (centerUri) {
    this.groupRelations = {};
    Object.values(this.serverFormat.groupRelations).forEach((groupRelation) => {
        // if (groupRelation.sourceForkUri === undefined) {
        //     return;
        // }
        // let sourceForkUri = decodeURIComponent(groupRelation.sourceForkUri);
        // let groupRelationUri = decodeURIComponent(groupRelation.graphElement.friendlyResource.uri);
        // if (!this.isCenterTag && (sourceForkUri !== centerUri && groupRelationUri !== centerUri)) {
        //     return;
        // }
        let facade = GroupRelation.fromServerFormat(groupRelation);
        this.groupRelations[facade.getUri()] = facade;
    });
};
export default api;
