/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElement from '@/graph-element/GraphElement'
import ShareLevel from '@/vertex/ShareLevel'
import GraphElementType from '@/graph-element/GraphElementType'
import I18n from '@/I18n'
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import Vue from 'vue'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import Store from '@/store'
import GroupRelation from '@/group-relation/GroupRelation'

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new Vertex().init(
        serverFormat
    );
};
api.withUri = function (uri) {
    return new Vertex().init(
        api.buildServerFormatFromUri(
            uri
        )
    )
};
api.buildServerFormatFromUri = function (uri) {
    return {
        vertex: {
            graphElement: GraphElement.buildObjectWithUri(uri),
            includedEdges: {},
            includedVertices: {},
            shareLevel: ShareLevel.PRIVATE,
            suggestions: {}
        }
    };
};
api.buildServerFormatFromUi = function (vertexUi) {
    return {
        vertex: {
            graphElement: GraphElement.buildServerFormatFromUi(
                vertexUi
            ),
            includedEdges: {},
            includedVertices: {},
            isPublic: vertexUi.isPublic(),
            numberOfConnectedEdges: vertexUi.connectedEdges().length,
            suggestions: {}
        }
    };
};

function Vertex() {
}

Vertex.prototype = new GraphElement.GraphElement();

Vertex.prototype.init = function (vertexServerFormat) {
    this.vertexServerFormat = vertexServerFormat;
    if (!this.vertexServerFormat.vertex.shareLevel) {
        this.makePrivate();
    }
    this.vertexServerFormat.vertex.numberOfConnectedEdges = this.vertexServerFormat.vertex.numberOfConnectedEdges || 0;
    this.leftBubbles = [];
    this.leftBubblesCollapsed = null;
    this.rightBubbles = [];
    this.rightBubblesCollapsed = null;
    GraphElement.GraphElement.apply(
        this
    );
    GraphElement.GraphElement.prototype.init.call(
        this,
        vertexServerFormat.vertex.graphElement
    );
    if (this.getNumberOfChild() === 0) {
        this.isExpanded = true;
    }
    return this;
};


Vertex.prototype.clone = function () {
    let vertex = new Vertex();
    vertex.init(
        JSON.parse(JSON.stringify(this.vertexServerFormat))
    );
    return vertex;
};

Vertex.prototype.getNumberOfConnectedEdges = function () {
    return this.vertexServerFormat.vertex.numberOfConnectedEdges;
};

Vertex.prototype.getNumberOfChild = function (isLeft) {
    let children = this.getNextChildren(isLeft);
    return children.length ? children.length : Math.max(
        (
            Store.state.isViewOnly ?
                this.getNbPublicNeighbors() - 1 :
                this.getNumberOfConnectedEdges() - 1
        ),
        0
    );
};


Vertex.prototype.decrementNumberOfConnectedEdges = function () {
    this.vertexServerFormat.vertex.numberOfConnectedEdges--;
};

Vertex.prototype.incrementNbConnectedEdges = function () {
    this.vertexServerFormat.vertex.numberOfConnectedEdges++;
};

Vertex.prototype.incrementNbPublicNeighbors = function () {
    this.vertexServerFormat.vertex.nbPublicNeighbors++;
};


Vertex.prototype.decrementNbPublicNeighbors = function () {
    this.vertexServerFormat.vertex.nbPublicNeighbors--;
};

Vertex.prototype.getNbPublicNeighbors = function () {
    return this.vertexServerFormat.vertex.nbPublicNeighbors;
};

Vertex.prototype.getNbFriendNeighbors = function () {
    return this.vertexServerFormat.vertex.nbFriendNeighbors;
};

Vertex.prototype.incrementNbFriendNeighbors = function () {
    this.vertexServerFormat.vertex.nbFriendNeighbors++;
};

Vertex.prototype.decrementNbFriendNeigbors = function () {
    this.vertexServerFormat.vertex.nbFriendNeighbors--;
};

Vertex.prototype.hasOnlyOneHiddenChild = function () {
    return 2 === this.getNumberOfConnectedEdges();
};

Vertex.prototype.isPublic = function () {
    return this.getShareLevel() === ShareLevel.PUBLIC ||
        this.getShareLevel() === ShareLevel.PUBLIC_WITH_LINK;
};

Vertex.prototype.isPrivate = function () {
    return this.getShareLevel() === ShareLevel.PRIVATE;
};

Vertex.prototype.isFriendsOnly = function () {
    return this.getShareLevel() === ShareLevel.FRIENDS;
};

Vertex.prototype.getShareLevel = function () {
    return this.vertexServerFormat.vertex.shareLevel.toUpperCase();
};

Vertex.prototype.makePrivate = function () {
    this.setShareLevel(ShareLevel.PRIVATE);
};

Vertex.prototype.makePublic = function () {
    this.setShareLevel(ShareLevel.PUBLIC);
};

Vertex.prototype.setShareLevel = function (shareLevel) {
    this.vertexServerFormat.vertex.shareLevel = shareLevel.toUpperCase();
    this.forceInLabelMenuUpdate();
};

Vertex.prototype.getGraphElementType = function () {
    return GraphElementType.Vertex;
};

Vertex.prototype.makeCenter = function () {
    this.isCenter = true;
    this.parentBubble = this;
    this.isExpanded = true;
    this.direction = "center";
    CurrentSubGraph.get().center = this;
};

Vertex.prototype.getDuplicates = function () {
    return CurrentSubGraph.get().getVerticesWithUri(
        this.getUri()
    ).filter((vertex) => {
        return vertex.getId() !== this.getId();
    });
};

Vertex.prototype.getNbDuplicates = function () {
    return CurrentSubGraph.get().getVerticesWithUri(
        this.getUri()
    ).length - 1;
};

Vertex.prototype.addChild = function (child, isToTheLeft, index) {
    let children;
    child.parentBubble = child.parentVertex = this;
    if (this.isCenter) {
        if (this._shouldAddLeft(isToTheLeft)) {
            children = this.leftBubbles;
            child.makeLeft()
        } else {
            children = this.rightBubbles;
            child.makeRight();
        }
    } else {
        children = this.rightBubbles;
        child.direction = this.direction;
    }
    CurrentSubGraph.get().add(child);
    if (index === undefined) {
        children.push(child)
    } else {
        index = Math.min(index, children.length);
        children.splice(index, 0, child);
    }
};

Vertex.prototype.getRightBubble = function (bottom) {
    let index = bottom ? this.rightBubbles.length - 1 : 0;
    if (this.isCenter) {
        return this.rightBubbles[index];
    }
    if (this.isToTheLeft()) {
        return this.parentBubble;
    }
    return this.rightBubbles[index];
};

Vertex.prototype.getLeftBubble = function (bottom) {
    if (this.isCenter) {
        let index = bottom ? this.leftBubbles.length - 1 : 0;
        return this.leftBubbles[index];
    }
    if (this.isToTheLeft()) {
        let index = bottom ? this.rightBubbles.length - 1 : 0;
        return this.rightBubbles[index];
    }
    return this.getParentBubble();
};

Vertex.prototype.collapse = function () {
    if (this.isCenter) {
        this.getNextChildren().forEach(function (child) {
            if (child.isEdge()) {
                child.getOtherVertex(this).collapse()
            } else {
                child.collapse();
            }
        }.bind(this));
        return;
    }
    if (!this.isExpanded) {
        return;
    }
    this.vertexServerFormat.vertex.numberOfConnectedEdges = this.getNextChildren().length + 1;
    this.rightBubblesCollapsed = this.rightBubbles;
    this.leftBubblesCollapsed = this.leftBubbles;
    this.rightBubbles = [];
    this.leftBubbles = [];
    Vue.nextTick(function () {
        FriendlyResource.FriendlyResource.prototype.collapse.call(
            this
        );
    }.bind(this));
};

Vertex.prototype.expand = function (avoidCenter, isChildExpand) {
    FriendlyResource.FriendlyResource.prototype.expand.call(
        this,
        avoidCenter,
        isChildExpand
    );
    if (this.rightBubblesCollapsed !== null) {
        this.rightBubbles = this.rightBubblesCollapsed;
        this.rightBubblesCollapsed = null;
    }
    if (this.leftBubblesCollapsed !== null) {
        this.leftBubbles = this.leftBubblesCollapsed;
        this.leftBubblesCollapsed = null;
    }
};

//getNextChildrenEvenIfCollapsed = getNextChildren because we dont need it for vertices yet.
Vertex.prototype.getNextChildrenEvenIfCollapsed = Vertex.prototype.getNextChildren = function (toTheLeft) {
    if (this.isCollapsed) {
        return [];
    }
    if (this.isCenter) {
        if (toTheLeft === undefined) {
            let nbLeft = this.leftBubbles.length;
            let nbRight = this.rightBubbles.length;
            let nbChild = nbLeft + nbRight;
            let index = 0;
            let rightIndex = 0;
            let leftIndex = 0;
            return [...Array(nbChild).keys()].map(() => {
                let isRightTurn = index % 2 === 0;
                index++;
                if (isRightTurn && nbRight > rightIndex) {
                    rightIndex++;
                    return this.rightBubbles[rightIndex - 1];
                } else if (nbLeft > leftIndex) {
                    leftIndex++;
                    return this.leftBubbles[leftIndex - 1];
                } else {
                    rightIndex++;
                    return this.rightBubbles[rightIndex - 1];
                }
            });
        } else {
            return toTheLeft ? this.leftBubbles : this.rightBubbles;
        }
    } else {
        return this.rightBubbles;
    }
};

Vertex.prototype.remove = function () {
    this.getParentBubble().remove();
};

Vertex.prototype.removeChild = function (child) {
    let childrenArray = this.isCenter && child.isToTheLeft() ? this.leftBubbles : this.rightBubbles;
    let l = childrenArray.length;
    let hasDeleted = false;
    while (l--) {
        if (childrenArray[l].getId() === child.getId()) {
            childrenArray.splice(l, 1);
            hasDeleted = true;
        }
    }
    this.decrementNumberOfConnectedEdges();
};

api.getWhenEmptyLabel = function () {
    return I18n.i18next.t("vertex:default");
};

Vertex.prototype.getWhenEmptyLabel = function () {
    return api.getWhenEmptyLabel();
};

Vertex.prototype._shouldAddLeft = function (isToTheLeft) {
    if (!this.isCenter) {
        return false;
    }
    if (isToTheLeft === undefined || isToTheLeft === null) {
        return this.leftBubbles.length <
            this.rightBubbles.length;
    }
    return isToTheLeft;
};


Vertex.prototype.isMeta = function () {
    return this.getGraphElementType() === GraphElementType.Meta;
};


Vertex.prototype.rebuildGroupRelations = function () {
    let edgeByTags = this.getClosestChildrenOfType(GraphElementType.Relation).reduce((edgeByTags, edge) => {
        edge.getIdentifiersIncludingSelf().forEach((tag) => {
            if (edgeByTags[tag.getUri()] === undefined) {
                edgeByTags[tag.getUri()] = {
                    tag: tag,
                    edges: []
                };
            }
            edgeByTags[tag.getUri()].edges.push(edge);
        });
        return edgeByTags;
    }, {});
    let groupRelations = [];
    Object.values(edgeByTags).forEach((_edgeByTags) => {
        if (_edgeByTags.edges.length < 2) {
            return;
        }
        let firstEdge = _edgeByTags.edges[0];
        let index = firstEdge.getIndexInTree();
        let groupRelation = GroupRelation.withTagAndChildren(
            _edgeByTags.tag,
            _edgeByTags.edges.map((edge) => {
                let parentBubble = edge.getParentBubble();
                if (parentBubble.isGroupRelation() && !parentBubble.hasIdentification(_edgeByTags.tag)) {
                    edge = edge.clone();
                    let endVertex = edge.getOtherVertex(this);
                    endVertex = endVertex.clone();
                    edge.updateSourceOrDestination(endVertex);
                }
                return edge;
            })
        );
        groupRelation.children.forEach((childEdge) => {
            this.removeChild(childEdge);
        });
        this.addChild(groupRelation, firstEdge.isToTheLeft(), index);
        groupRelations.push(groupRelation);
    });
    groupRelations.forEach((groupRelation) => {
        groupRelations.forEach((otherGroupRelation) => {
            if (groupRelation.deleted || otherGroupRelation.deleted) {
                return;
            }
            if (groupRelation.getId() === otherGroupRelation.getId()) {
                return;
            }
            if (groupRelation.getParentBubble().getId() !== otherGroupRelation.getParentBubble().getId()) {
                return;
            }
            if (groupRelation.shouldBeChildOfGroupRelation(otherGroupRelation)) {
                if (groupRelation.getNumberOfChild() === otherGroupRelation.getNumberOfChild()) {
                    otherGroupRelation.addIdentifications(groupRelation.getIdentifiers());
                    groupRelation.getParentBubble().removeChild(groupRelation);
                    groupRelation.deleted = true;
                    return;
                }
                let index = groupRelation.getIndexInTree();
                let isToTheLeft = groupRelation.isToTheLeft();
                groupRelation.getParentBubble().removeChild(groupRelation);
                otherGroupRelation.addChild(groupRelation, isToTheLeft, index);
                groupRelation.getNextChildren().forEach((child) => {
                    otherGroupRelation.removeChild(child);
                });
            }
        })
    });
    return groupRelations;
};

api.Vertex = Vertex;

export default api;
