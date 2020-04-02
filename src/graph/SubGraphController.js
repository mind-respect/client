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
        let centerFromServer = subGraph.getVertexWithUri(centerUri);
        let centerVertex = isParentAlreadyOnMap ? this.model() : centerFromServer;
        if (isParentAlreadyOnMap) {
            centerVertex.setLabel(
                centerFromServer.getLabel()
            );
            centerVertex.setComment(
                centerFromServer.getComment()
            );
            centerVertex.setBackgroundColor(
                centerFromServer.getBackgroundColor()
            );
            centerVertex.setFont(
                centerFromServer.getFont()
            );
            centerFromServer.getIdentifiers().forEach((tag) => {
                centerVertex.addIdentification(tag);
            });
            subGraph.vertices[centerVertex.getUri()] = [centerVertex];
        } else {
            if (isCenterOnMap) {
                centerVertex.makeCenter();
            }
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(centerVertex);
            }
        }
        if (isParentAlreadyOnMap) {
            let hasModifiedChildrenIndex = centerVertex.integrateChildrenIndex(centerFromServer.getChildrenIndex());
            if (hasModifiedChildrenIndex) {
                GraphElementService.saveChildrenIndex(
                    centerVertex,
                    centerVertex.getChildrenIndex()
                )
            }
        }
        let childrenIndex = centerVertex.getChildrenIndex();
        let groupRelations = EdgeGrouper.forEdgesAndCenterVertex(
            subGraph.sortedEdges(), centerVertex
        ).group(isParentAlreadyOnMap);
        groupRelations.forEach((groupRelation) => {
            if (groupRelation.getParentBubble().getId() !== centerVertex.getId()) {
                return;
            }
            let edge = groupRelation.getFirstEdge();
            let child = groupRelation.getNumberOfChild() > 1 ? groupRelation : edge;
            let endVertex = edge.getOtherVertex(centerVertex);
            let childIndex = childrenIndex[endVertex.getUri()] || childrenIndex[endVertex.getPatternUri()];
            let addLeft;
            if (childIndex !== undefined) {
                addLeft = childIndex.toTheLeft;
            }
            centerVertex.addChild(
                child,
                addLeft
            );
            child.parentVertex = child.parentBubble = centerVertex;
            if (!preventAddInCurrentGraph) {
                CurrentSubGraph.get().add(child);
            }
        });
        EdgeGrouper.expandGroupRelations(groupRelations);
        let isChildrenIndexBuilt = Object.keys(childrenIndex).length > 0;
        centerVertex.isExpanded = true;
        centerVertex.isCollapsed = false;
        return isChildrenIndexBuilt || MindMapInfo.isViewOnly() ? Promise.resolve(centerVertex) :
            GraphElementService.changeChildrenIndex(
                centerVertex
            ).then(() => {
                return centerVertex;
            });
    });
};

export default api;
