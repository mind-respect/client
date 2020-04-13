/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphService from '@/graph/GraphService'
import GraphElementService from '@/graph-element/GraphElementService'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import IdUri from '@/IdUri'
import Edge from '@/edge/Edge'
import SubGraph from '@/graph/SubGraph'
import MindMapInfo from '@/MindMapInfo'
import EdgeGrouper from "../group-relation/EdgeGrouper";

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
        let centerFromServer = subGraph.getHavingUri(centerUri);
        let centerFork = isParentAlreadyOnMap ? this.model() : centerFromServer;
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
            centerFromServer.getIdentifiers().forEach((tag) => {
                centerFork.addIdentification(tag);
            });
            subGraph.vertices[centerFork.getUri()] = [centerFork];
        } else {
            if (isCenterOnMap) {
                centerFork.makeCenter();
            }
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(centerFork);
            }
        }
        if (isParentAlreadyOnMap) {
            let hasModifiedChildrenIndex = centerFork.integrateChildrenIndex(centerFromServer.getChildrenIndex());
            if (hasModifiedChildrenIndex) {
                GraphElementService.saveChildrenIndex(
                    centerFork,
                    centerFork.getChildrenIndex()
                )
            }
        }
        let childrenIndex = centerFork.getChildrenIndex();

        // let groupRelations = EdgeGrouper.forEdgesAndCenterVertex(
        //     subGraph.sortedEdges(), centerVertex
        // ).group(isParentAlreadyOnMap);

        let parentBubble = centerFork.getParentBubble();
        let centerVertex = centerFork.isGroupRelation() ? centerFork.getParentVertex() : centerFork;
        subGraph.sortedEdgesAndGroupRelations().forEach((child) => {
            if (isParentAlreadyOnMap && (child.getUri() === parentBubble.getUri()) || child.getUri() === centerFork.getUri()) {
                return;
            }
            // if (child.getParentBubble().getId() !== centerVertex.getId()) {
            //     return;
            // }
            // let edge = child.getFirstEdge();
            // let child = child.getNumberOfChild() > 1 ? child : edge;
            let endFork = child.isEdge() ? child.getOtherVertex(centerVertex) : child;
            let childIndex = childrenIndex[endFork.getUri()] || childrenIndex[endFork.getPatternUri()];
            let addLeft;
            if (childIndex !== undefined) {
                addLeft = childIndex.toTheLeft;
            }
            centerFork.addChild(
                child,
                addLeft
            );
            child.parentVertex = centerVertex;
            child.parentBubble = centerFork;
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(child);
            }
        });
        // EdgeGrouper.expandGroupRelations(groupRelations);
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
