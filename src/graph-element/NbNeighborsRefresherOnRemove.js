import GraphElementService from '@/graph-element/GraphElementService'
import NbNeighbors from '@/vertex/NbNeighbors'
import GraphElementType from '@/graph-element/GraphElementType'

export default {
    withGraphElements: function (graphElements) {
        return new NbNeighborsRefresherOnRemove(graphElements);
    }
};

function NbNeighborsRefresherOnRemove(graphElements) {
    this.graphElements = graphElements;
    this.verticesToChangeNbNeighbors = {};
    this.tagsToChangeNbNeighbors = {};
}

NbNeighborsRefresherOnRemove.prototype.prepare = function () {
    this.graphElements.forEach((graphElement) => {
        let parentVertex = graphElement.getParentVertex();
        if (!this.verticesToChangeNbNeighbors[parentVertex.getUri()]) {
            this.verticesToChangeNbNeighbors[parentVertex.getUri()] = parentVertex;
        }
        if (graphElement.isEdgeType() && (!this.verticesToChangeNbNeighbors[parentVertex.getUri()] || !this.verticesToChangeNbNeighbors[parentVertex.getUri()]._preventRebuildNbNeighbors)) {
            let otherVertex = graphElement.getOtherVertex(parentVertex);
            otherVertex._preventRebuildNbNeighbors = true;
            if (otherVertex.isExpanded) {
                let nbNeighbors = NbNeighbors.withZeros();
                otherVertex.getClosestChildrenInTypes(GraphElementType.getEdgeTypes()).filter((childRelation) => {
                    let childVertex = childRelation.getOtherVertex(otherVertex);
                    return !this.graphElements.some((removedGraphElement) => {
                        return removedGraphElement.getUri() === childRelation.getUri() ||
                            removedGraphElement.getUri() === childVertex.getUri()
                    });
                }).forEach((notRemovedChildRelation) => {
                    nbNeighbors.incrementForShareLevel(
                        notRemovedChildRelation.getOtherVertex(otherVertex).getShareLevel()
                    );
                });
                otherVertex.setNbNeighbors(nbNeighbors);
            } else {
                otherVertex.getNbNeighbors().decrementForShareLevel(parentVertex.getShareLevel());
            }
            this.verticesToChangeNbNeighbors[otherVertex.getUri()] = otherVertex;
        }
        this._setupTagsForGraphElement(graphElement);
        if (graphElement.isVertex()) {
            graphElement.getConnectedEdges(true).forEach((edge) => {
                this._setupTagsForGraphElement(edge);
            });
        }
    });
};

NbNeighborsRefresherOnRemove.prototype._setupTagsForGraphElement = function (graphElement) {
    graphElement.getIdentifiers().forEach((tag) => {
        if (!this.tagsToChangeNbNeighbors[tag.getUri()]) {
            this.tagsToChangeNbNeighbors[tag.getUri()] = {
                tag: tag,
                neighbors: {}
            };
        }
        if (!this.tagsToChangeNbNeighbors[tag.getUri()].neighbors[graphElement.getUri()]) {
            this.tagsToChangeNbNeighbors[tag.getUri()].neighbors[graphElement.getUri()] = graphElement.getShareLevel();
        }
    });
};

NbNeighborsRefresherOnRemove.prototype.execute = function () {
    Object.values(this.verticesToChangeNbNeighbors).filter((vertexToChangeNbNeighbors) => {
        return !this.graphElements.some((removedGraphElement) => {
            return removedGraphElement.getUri() === vertexToChangeNbNeighbors.getUri();
        });
    }).forEach((vertexToChangeNbNeighbors) => {
        if (!vertexToChangeNbNeighbors._preventRebuildNbNeighbors) {
            vertexToChangeNbNeighbors.setNbNeighbors(
                vertexToChangeNbNeighbors.buildNbNeighbors()
            );
        }
        GraphElementService.setNbNeighbors(
            vertexToChangeNbNeighbors
        );
    });
    Object.values(this.tagsToChangeNbNeighbors).forEach((tagObject) => {
        let tag = tagObject.tag;
        Object.values(tagObject.neighbors).forEach((shareLevel) => {
            tag.getNbNeighbors().decrementForShareLevel(shareLevel);
        });
        GraphElementService.setNbNeighbors(
            tag
        );
    });
};

