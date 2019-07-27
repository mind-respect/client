/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElementController from '@/graph-element/GraphElementController'
import GraphService from '@/graph/GraphService'
import GraphElementService from '@/graph-element/GraphElementService'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import IdUri from '@/IdUri'
import Edge from '@/edge/Edge'
import SubGraph from '@/graph/SubGraph'
import MindMapInfo from '@/MindMapInfo'
import GroupRelation from '@/group-relation/GroupRelation'
import GraphElement from '@/graph-element/GraphElement'
import GraphElementType from '@/graph-element/GraphElementType'

const api = {};

api.withVertex = function (vertex) {
    return new api.SubGraphController(vertex);
};

api.withVertices = function (vertices) {
    return new api.SubGraphController(vertices);
};

function SubGraphController(vertices) {
    this.vertices = vertices;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.vertices
    );
}

api.SubGraphController = SubGraphController;

SubGraphController.prototype = new GraphElementController.GraphElementController();

SubGraphController.prototype.loadForParentIsAlreadyOnMap = function () {
    return this.load(true);
};

SubGraphController.prototype.load = function (isParentAlreadyOnMap) {
    return GraphService.getForCentralBubbleUri(
        this.model().getUri()
    ).then((response) => {
        let serverGraph = response.data;
        let centerUri = this.model().getUri();
        let isCenterEdge = IdUri.isEdgeUri(this.model().getUri());
        if (isCenterEdge) {
            let centerEdge = Edge.fromServerFormat(
                serverGraph.edges[this.model().getUri()]
            );
            centerUri = centerEdge.getSourceVertex().getUri();
        }
        let subGraph = SubGraph.fromServerFormatAndCenterUri(
            serverGraph,
            centerUri
        );
        let centerFromServer = subGraph.getVertexWithUri(centerUri);
        let centerVertex = isParentAlreadyOnMap ? this.model() : centerFromServer;
        if (isParentAlreadyOnMap) {
            centerVertex.setLabel(
                centerFromServer.getLabel()
            );
            subGraph.vertices[centerVertex.getUri()] = [centerVertex];
        } else {
            centerVertex.makeCenter();
            CurrentSubGraph.get().add(centerVertex);
        }
        let childrenIndex = centerVertex.getChildrenIndex();
        let parentVertex = centerVertex.getParentVertex();
        let edgesInGroupRelations = subGraph.sortedEdges().reduce((groupRelations, edge) => {
            let endVertex = edge.getOtherVertex(centerVertex);
            if (isParentAlreadyOnMap && parentVertex.getUri() === endVertex.getUri()) {
                return groupRelations;
            }
            edge.getIdentifiersIncludingSelf().forEach((tag) => {
                if (groupRelations[tag.getUri()] === undefined) {
                    let groupRelation = GroupRelation.withTagAndChildren(
                        tag,
                        []
                    );
                    groupRelation.parentBubble = groupRelation.parentVertex = centerVertex;
                    groupRelations[tag.getUri()] = groupRelation;
                }
                groupRelations[tag.getUri()].addChild(edge);
            });
            return groupRelations;
        }, {});
        let groupRelations = Object.values(edgesInGroupRelations).sort((a, b) => {
            return a.getNumberOfChild() - b.getNumberOfChild();
        });
        let l = groupRelations.length;
        while (l--) {
            let groupRelation = groupRelations[l];
            if (groupRelation.getNumberOfChild() < 2) {
                let firstEdge = groupRelation.getFirstEdge();
                if (firstEdge.isInGroupRelation || firstEdge.isUnderVertex) {
                    groupRelations.splice(l, 1);
                } else {
                    firstEdge.isUnderVertex = true;
                }
            } else {
                groupRelation.children = groupRelation.children.map((edge) => {
                    edge.isInGroupRelation = true;
                    let parentBubble = edge.getParentBubble();
                    if (parentBubble.getNumberOfChild() > 1 && !parentBubble.hasIdentification(groupRelation.getIdentification())) {
                        edge = edge.clone();
                        let endVertex = edge.getOtherVertex(centerVertex);
                        endVertex = endVertex.clone();
                        edge.updateSourceOrDestination(endVertex);
                    }
                    return edge;
                });
            }
        }
        groupRelations.forEach((groupRelation) => {
            groupRelations.forEach((otherGroupRelation) => {
                if (groupRelation.getNumberOfChild() < 2 || otherGroupRelation.getNumberOfChild() < 2) {
                    return;
                }
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
                    if (groupRelation.getClosestChildrenOfType(GraphElementType.Relation).length === otherGroupRelation.getClosestChildrenOfType(GraphElementType.Relation).length) {
                        otherGroupRelation.addIdentifications(groupRelation.getIdentifiers());
                        groupRelation.getParentBubble().removeChild(groupRelation, true, true);
                        otherGroupRelation.deleted = true;
                        return;
                    }
                    let firstEdge = groupRelation.getFirstEdge();
                    let index = 0;
                    for (let i = 0; i < otherGroupRelation.children.length; i++) {
                        if (otherGroupRelation.children[i].getUri() === firstEdge.getUri()) {
                            index = i;
                        }
                    }
                    let isToTheLeft = groupRelation.isToTheLeft();
                    groupRelation.getParentBubble().removeChild(groupRelation, true, true);
                    otherGroupRelation.addChild(groupRelation, isToTheLeft, index);
                    groupRelation.children.forEach((child) => {
                        otherGroupRelation.removeChild(child, true, true);
                    });
                }
            })
        });
        groupRelations = groupRelations.filter((groupRelation) => {
            return !groupRelation.deleted
        });
        api.sortedGroupRelations(groupRelations, childrenIndex, centerVertex).forEach((groupRelation) => {
            if (groupRelation.getParentBubble().getId() !== centerVertex.getId()) {
                return;
            }
            let edge = groupRelation.getFirstEdge();
            let endVertex = edge.getOtherVertex(centerVertex);
            let childIndex = childrenIndex[endVertex.getUri()];
            let addLeft;
            if (childIndex !== undefined) {
                addLeft = childIndex.toTheLeft;
            }
            centerVertex.addChild(
                groupRelation.getNumberOfChild() > 1 ? groupRelation : edge,
                addLeft
            )
        });

        groupRelations.forEach((groupRelation) => {
            if (groupRelation.getNumberOfChild() < 2) {
                return;
            }
            if (groupRelation.hasFewEnoughBubblesToExpand()) {
                groupRelation.expand(true);
            } else {
                groupRelation.collapse();
            }
        });
        let isChildrenIndexBuilt = Object.keys(childrenIndex).length > 0;
        return isChildrenIndexBuilt || MindMapInfo.isViewOnly() ? Promise.resolve(centerVertex) :
            GraphElementService.changeChildrenIndex(
                centerVertex
            ).then(() => {
                return centerVertex;
            });
    });
};

api.sortedGroupRelations = function (groupRelations, childrenIndex, centerVertex) {
    return groupRelations.sort((a, b) => {
        let firstEdgeA = a.getFirstEdge();
        let firstEdgeB = b.getFirstEdge();
        let vertexA = firstEdgeA.getOtherVertex(centerVertex);
        let vertexB = firstEdgeB.getOtherVertex(centerVertex);
        return GraphElement.sortCompare(
            vertexA,
            vertexB,
            childrenIndex
        );
    });
};

export default api;
