/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElementController from '@/graph-element/GraphElementController'
import GraphService from '@/graph/GraphService'
import TreeDisplayerCommon from '@/graph/TreeDisplayerCommon'
import SubGraph from '@/graph/SubGraph'
import $ from "jquery";
import Edge from '@/edge/Edge'

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

SubGraphController.prototype.load = function () {
    return GraphService.getForCentralBubbleUri(
        this.getModel().getUri()
    ).then(function (response) {
        let serverGraph = response.data;
        this.getModel().nbRelationsWithGrandParent = this._removeRelationWithGrandParentAndChildFromServerGraph(serverGraph);
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            serverGraph,
            this.getModel().getUri()
        );
        let graph = SubGraph.withFacadeAndCenterUri(
            serverGraph,
            this.getModel().getUri()
        );
        let parentAsCenter = graph.center;
        let modelToAddChild;
        if (this.getModel().isCenter) {
            parentAsCenter.makeCenter();
            modelToAddChild = parentAsCenter;
        } else {
            modelToAddChild = this.getModel();
        }
        parentAsCenter.groupRelationRoots.forEach(function (groupRelationRoot) {
            if (groupRelationRoot.isGroupRelation() && groupRelationRoot.isTrulyAGroupRelation()) {
                modelToAddChild.addChild(groupRelationRoot);
                return;
            }
            groupRelationRoot.sortedImmediateChild(parentAsCenter).forEach(function (child) {
                Object.keys(child).forEach(function (uId) {
                    let triple = child[uId];
                    triple.edge.setSourceVertex(modelToAddChild);
                    triple.edge.setDestinationVertex(triple.vertex);
                    triple.edge.uiId = uId;
                    modelToAddChild.addChild(triple.edge)
                }.bind(this));
            }.bind(this));
        }.bind(this));
        return graph;
    }.bind(this));
};

SubGraphController.prototype._removeRelationWithGrandParentAndChildFromServerGraph = function (serverGraph) {
    if (this.getModel().isCenter) {
        return 0;
    }
    let parentRelation = this.getModel().getRelationWithUiParent();
    let relationWithGrandParentUri = parentRelation.getUri();
    let grandParent = this.getModel().getParentVertex();
    let grandParentUriToCompare = grandParent.getUri();
    let nbRelationsWithGrandParent = 0;
    let alreadyPresentChildEdgesUri = [];
    this.getModel().visitClosestChildRelations(function (edge) {
        alreadyPresentChildEdgesUri.push(edge.getUri());
    });
    serverGraph.edges = getFilteredEdges();
    if (1 === nbRelationsWithGrandParent) {
        delete serverGraph.vertices[grandParentUriToCompare];
    }
    return nbRelationsWithGrandParent - 1;

    function getFilteredEdges() {
        var filteredEdges = {};
        $.each(serverGraph.edges, function () {
            var edge = this;
            var edgeFacade = Edge.fromServerFormat(
                edge
            );
            var sourceAndDestinationId = [
                edgeFacade.getSourceVertex().getUri(),
                edgeFacade.getDestinationVertex().getUri()
            ];
            if ($.inArray(
                grandParentUriToCompare,
                sourceAndDestinationId
            ) !== -1) {
                nbRelationsWithGrandParent++;
            }
            var alreadyChildEdge = alreadyPresentChildEdgesUri.indexOf(
                edgeFacade.getUri()
            ) !== -1;
            if (!alreadyChildEdge && relationWithGrandParentUri !== edgeFacade.getUri()) {
                filteredEdges[
                    edgeFacade.getUri()
                    ] = edge;
            }
        });
        return filteredEdges;
    }
};

export default api;
