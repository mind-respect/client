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
    this.forksToChangeNbNeighbors = {};
    this.tagsToChangeNbNeighbors = {};
}

NbNeighborsRefresherOnRemove.prototype.prepare = function () {
    this.graphElements.forEach((graphElement) => {
        let parentFork = graphElement.getParentFork();
        if (!this.forksToChangeNbNeighbors[parentFork.getUri()]) {
            this.forksToChangeNbNeighbors[parentFork.getUri()] = parentFork;
        }
        if (graphElement.isEdgeType() && (!this.forksToChangeNbNeighbors[parentFork.getUri()] || !this.forksToChangeNbNeighbors[parentFork.getUri()]._preventRebuildNbNeighbors)) {
            let otherVertex = graphElement.getOtherVertex(parentFork);
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
                otherVertex.getNbNeighbors().decrementForShareLevel(parentFork.getShareLevel());
            }
            this.forksToChangeNbNeighbors[otherVertex.getUri()] = otherVertex;
        }
        this._setupTagsForGraphElement(graphElement);
        graphElement.getSurround(true).forEach((surround) => {
            if (surround.isRelation()) {
                this._setupTagsForGraphElement(surround);
            }
        });
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
    Object.values(this.forksToChangeNbNeighbors).filter((forkToChangeNbNeighbors) => {
        return !this.graphElements.some((removedGraphElement) => {
            return removedGraphElement.getUri() === forkToChangeNbNeighbors.getUri();
        });
    }).forEach((vertexToChangeNbNeighbors) => {
        if (!vertexToChangeNbNeighbors._preventRebuildNbNeighbors) {
            let nbNeighborsBefore = vertexToChangeNbNeighbors.getNbNeighbors();
            vertexToChangeNbNeighbors.setNbNeighbors(
                vertexToChangeNbNeighbors.buildNbNeighbors()
            );
            if (vertexToChangeNbNeighbors.isMetaGroupVertex()) {
                let difference = NbNeighbors.difference(nbNeighborsBefore, vertexToChangeNbNeighbors.getNbNeighbors());
                vertexToChangeNbNeighbors.getOriginalNbNeighbors().substract(difference)
            }
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

