import GraphElementService from '@/graph-element/GraphElementService'

export default {
    withGraphElements: function (graphElements) {
        return new NbNeighborsRefresherOnSetShareLevel(graphElements);
    }
};

function NbNeighborsRefresherOnSetShareLevel(graphElements) {
    this.graphElements = graphElements;
    this.tagsToChangeNbNeighbors = {};
}

NbNeighborsRefresherOnSetShareLevel.prototype.prepare = function () {
    this.graphElements.forEach((graphElement) => {
        if (!graphElement.isVertex()) {
            return;
        }
        // if (graphElement.canExpand()) {
        //     if (!isInLoadingFlow) {
        //         LoadingFlow.enter();
        //         isInLoadingFlow = true;
        //     }
        //     await graphElement.controller().expand(true, true, true);
        //     graphElement.collapse();
        // }
        graphElement.getConnectedEdges(true).forEach((edge) => {
            edge.getIdentifiers().forEach((tag) => {
                if (!this.tagsToChangeNbNeighbors[tag.getUri()]) {
                    this.tagsToChangeNbNeighbors[tag.getUri()] = {
                        tag: tag,
                        previousShareLevels: [],
                        newShareLevels: []
                    }
                }
                this.tagsToChangeNbNeighbors[tag.getUri()].previousShareLevels.push(edge.getShareLevel());
            });
        });
    });
};

NbNeighborsRefresherOnSetShareLevel.prototype.execute = function () {
    this.graphElements.forEach((graphElement) => {
        if (!graphElement.isVertex()) {
            return;
        }
        graphElement.getConnectedEdges(true).forEach((edge) => {
            edge.getIdentifiers().forEach((tag) => {
                this.tagsToChangeNbNeighbors[tag.getUri()].newShareLevels.push(edge.getShareLevel());
            });
        });
    });
    Object.values(this.tagsToChangeNbNeighbors).forEach((tagObject) => {
        let tag = tagObject.tag;
        let nbNeighbors = tag.getNbNeighbors();
        tagObject.previousShareLevels.forEach((shareLevel) => {
            nbNeighbors.decrementForShareLevel(shareLevel);
        });
        tagObject.newShareLevels.forEach((shareLevel) => {
            nbNeighbors.incrementForShareLevel(shareLevel);
        });
        GraphElementService.setNbNeighbors(tag);
    });
};

