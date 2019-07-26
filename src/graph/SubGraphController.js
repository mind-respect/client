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
        subGraph.sortedEdges().forEach((edge) => {
            let endVertex = edge.getOtherVertex(centerVertex);
            if (isParentAlreadyOnMap && parentVertex.getUri() === endVertex.getUri()) {
                return;
            }
            let childIndex = childrenIndex[endVertex.getUri()];
            let addLeft;
            if (childIndex !== undefined) {
                addLeft = childIndex.toTheLeft;
            }
            centerVertex.addChild(
                edge,
                addLeft
            )
        });
        let groupRelations = centerVertex.rebuildGroupRelations();
        groupRelations.forEach((groupRelation) => {
            if (groupRelation.hasFewEnoughBubblesToExpand()) {
                groupRelation.expand(true);
            } else {
                groupRelation.collapse();
            }
        });
        let isChildrenIndexBuilt = Object.keys(childrenIndex).length > 0;
        return isChildrenIndexBuilt && !MindMapInfo.isViewOnly() ? Promise.resolve(centerVertex) :
            GraphElementService.changeChildrenIndex(
                centerVertex
            ).then(() => {
                return centerVertex;
            });
    });
};

export default api;
