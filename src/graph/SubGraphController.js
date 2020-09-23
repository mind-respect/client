/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphService from '@/graph/GraphService'
import GraphElementService from '@/graph-element/GraphElementService'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import IdUri from '@/IdUri'
import Relation from '@/relation/Relation'
import SubGraph from '@/graph/SubGraph'
import MindMapInfo from '@/MindMapInfo'

const api = {};

api.withVertex = function (vertex) {
    return new api.SubGraphController(vertex);
};

api.withVertices = function (vertices) {
    return new api.SubGraphController(vertices);
};

function SubGraphController(vertices) {
    this.vertices = vertices;
}

api.SubGraphController = SubGraphController;

SubGraphController.prototype.loadForParentIsAlreadyOnMap = function (preventAddInCurrentGraph) {
    return this.load(true, false, preventAddInCurrentGraph);
};

SubGraphController.prototype.loadNonCenter = function () {
    return this.load(false, false, false);
};

SubGraphController.prototype.model = function () {
    return this.vertices;
};

SubGraphController.prototype.load = function (isParentAlreadyOnMap, isCenterOnMap, preventAddInCurrentGraph) {
    if (isCenterOnMap === undefined) {
        isCenterOnMap = true;
    }
    isParentAlreadyOnMap = isParentAlreadyOnMap || false;
    return GraphService.getForCentralBubbleUri(
        this.model().getUri()
    ).then((response) => {
        let serverGraph = response.data;
        let centerUri = this.model().getUri();
        let isCenterEdge = IdUri.isEdgeUri(this.model().getUri());
        if (isCenterEdge) {
            let centerEdge = Relation.fromServerFormat(
                serverGraph.edges[this.model().getUri()]
            );
            centerUri = centerEdge.getSourceVertex().getUri();
        }
        let subGraph = SubGraph.fromServerFormatAndCenterUri(
            serverGraph,
            centerUri
        );
        let centerFromServer = subGraph.getHavingUri(
            centerUri
        );
        let centerFork = isParentAlreadyOnMap ? this.model() : centerFromServer;
        let centerIsMissingSourceFork = false;
        if (isParentAlreadyOnMap) {
            centerFork.setLabel(
                centerFromServer.getLabel()
            );
            centerFork.setComment(
                centerFromServer.getComment()
            );
            centerFork.setBackgroundColor(
                centerFromServer.getBackgroundColor()
            );
            centerFork.setFont(
                centerFromServer.getFont()
            );
            centerFork.setChildrenIndex(
                centerFromServer.getChildrenIndex()
            );
            centerFromServer.getIdentifiers().forEach((tag) => {
                centerFork.addIdentification(tag);
            });
            if (centerFork.isGroupRelation()) {
                if (centerFork.getSourceForkUri() === "undefined") {
                    centerFork.setSourceForkUri(
                        subGraph.groupRelations[centerFork.getUri()].getSourceForkUri()
                    );
                    centerIsMissingSourceFork = true;
                }
                subGraph.groupRelations[centerFork.getUri()] = centerFork;
            } else {
                subGraph.vertices[centerFork.getUri()] = [centerFork];
            }
            let hasModifiedChildrenIndex = centerFork.integrateChildrenIndex(centerFromServer.getChildrenIndex());
            if (hasModifiedChildrenIndex) {
                GraphElementService.saveChildrenIndex(
                    centerFork,
                    centerFork.getChildrenIndex()
                )
            }
        } else {
            if (isCenterOnMap) {
                centerFork.makeCenter();
            }
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(centerFork);
            }
        }
        let childrenIndex = centerFork.getChildrenIndex();

        let centerParentBubble = centerFork.getParentBubble();
        let centerParentFork = centerFork.getParentFork();
        let centerVertex = centerFork.isGroupRelation() ? centerFork.getParentVertex() : centerFork;
        const addedUris = new Set();
        subGraph.sortedGraphElements(centerFork).forEach((child) => {
            if (child.getUri() === centerFork.getParentBubble().getUri()) {
                return;
            }
            if (child.isRelation() && child.getOtherVertex(centerVertex).getUri() === centerParentFork.getUri()) {
                return;
            }
            if (child.isVertex() && (!centerFork.isGroupRelation() || centerFork.getSourceForkUri() !== child.getUri())) {
                return;
            }
            let childHasMissingSourceFork = centerIsMissingSourceFork && child.getUri() === centerFork.getUri();
            if (!childHasMissingSourceFork && isParentAlreadyOnMap && (child.getUri() === centerParentBubble.getUri()) || child.getUri() === centerParentFork.getUri()) {
                return;
            }
            if (!childHasMissingSourceFork && child.isGroupRelation() && child.getSourceForkUri() !== centerFork.getUri()) {
                return;
            }

            let endFork;
            if (childHasMissingSourceFork) {
                endFork = subGraph.getHavingUri(centerFork.getSourceForkUri());
            } else {
                endFork = child.isEdge() ? child.getOtherVertex(centerFork) : child;
            }
            let childIndex = childrenIndex[endFork.getUri()];
            if (!childIndex) {
                if (endFork.isGroupRelation()) {
                    childIndex = childrenIndex[endFork.getIndexVertexUri()] || childrenIndex[endFork.getPatternUri()];
                } else {
                    childIndex = childrenIndex[endFork.getPatternUri()];
                }
            }
            let addLeft;
            if (childIndex !== undefined) {
                addLeft = childIndex.toTheLeft;
            }

            if (childHasMissingSourceFork) {
                if (addedUris.has(endFork.getUri())) {
                    return;
                }
                addedUris.add(endFork.getUri())
                centerFork.addChild(
                    endFork,
                    addLeft
                );
            } else {
                if (addedUris.has(child.getUri())) {
                    return;
                }
                addedUris.add(child.getUri())
                child.parentVertex = centerVertex;
                child.parentBubble = centerFork;
                centerFork.addChild(
                    child,
                    addLeft
                );
            }
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(child);
            }
        });
        let isChildrenIndexBuilt = Object.keys(childrenIndex).length > 0;
        centerFork.isExpanded = true;
        centerFork.isCollapsed = false;
        return isChildrenIndexBuilt || MindMapInfo.isViewOnly() ? Promise.resolve(centerFork) :
            GraphElementService.changeChildrenIndex(
                centerFork
            ).then(() => {
                return centerFork;
            });
    });
};

export default api;
