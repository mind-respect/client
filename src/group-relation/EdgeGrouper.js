import GroupRelation from '@/group-relation/GroupRelation'
import GraphElement from '@/graph-element/GraphElement'
import GraphElementType from '@/graph-element/GraphElementType'

export default {
    forEdgesAndCenterVertex: function (edges, centerVertex, tagToExclude) {
        return new EdgeGrouper(edges, centerVertex, tagToExclude);
    },
    expandGroupRelations: function (groupRelations) {
        groupRelations.forEach((groupRelation) => {
            if (groupRelation.getNumberOfChild() < 2) {
                return;
            }
            if (groupRelation.hasFewEnoughBubblesToExpand()) {
                groupRelation.expand(true);
            } else {
                groupRelation.collapse(true);
            }
        });
    }
};

function EdgeGrouper(edges, centerVertex, tagToExclude) {
    this.edges = edges;
    this.centerVertex = centerVertex;
    this.childrenIndex = centerVertex.getChildrenIndex();
    this.tagToExclude = tagToExclude;
}

EdgeGrouper.prototype.group = function (isParentAlreadyOnMap) {
    let parentVertex = this.centerVertex.getParentVertex();
    let edgesInGroupRelations = this.edges.reduce((groupRelations, edge) => {
        let endVertex = edge.getOtherVertex(this.centerVertex);
        if (isParentAlreadyOnMap && parentVertex.getUri() === endVertex.getUri()) {
            return groupRelations;
        }
        this._getTagsForEdge(edge).forEach((tag) => {
            if (groupRelations[tag.getUri()] === undefined) {
                let groupRelation = GroupRelation.withTagAndChildren(
                    tag,
                    []
                );
                groupRelation.parentBubble = groupRelation.parentVertex = this.centerVertex;
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
                if (parentBubble.getNumberOfChild() > 1 && !groupRelation.shouldBeChildOfGroupRelation(parentBubble)) {
                    edge = edge.clone();
                    let endVertex = edge.getOtherVertex(this.centerVertex);
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
                groupRelation.children.forEach((child) => {
                    let childHasOtherGroupRelation = child.isGroupRelation() && child.getSerialGroupRelations().some((groupRelation) => {
                        return groupRelation.children.some((grandChild) => {
                            return grandChild.getId() === otherGroupRelation.getId();
                        });
                    });
                    if (childHasOtherGroupRelation) {
                        otherGroupRelation.children.forEach((child) => {
                            groupRelation.removeChild(child, true, true);
                        });
                    }
                });
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
    return this.sortedGroupRelations(groupRelations)
};

EdgeGrouper.prototype._getTagsForEdge = function (edge) {
    let tags = edge.getIdentifiersIncludingSelf();
    if (!this.tagToExclude) {
        return tags;
    }
    return tags.filter((tag) => {
        return this.tagToExclude.getUri() !== tag.getUri() || tag.getExternalResourceUri() === edge.getUri();
    });
};

EdgeGrouper.prototype.sortedGroupRelations = function (groupRelations) {
    return groupRelations.sort((a, b) => {
        let firstEdgeA = a.getFirstEdge();
        let firstEdgeB = b.getFirstEdge();
        let vertexA = firstEdgeA.getOtherVertex(this.centerVertex);
        let vertexB = firstEdgeB.getOtherVertex(this.centerVertex);
        return GraphElement.sortCompare(
            vertexA,
            vertexB,
            this.childrenIndex
        );
    });
};
