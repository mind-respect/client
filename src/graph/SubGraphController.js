/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElementController from '@/graph-element/GraphElementController'
import GraphService from '@/graph/GraphService'
import TreeDisplayerCommon from '@/graph/TreeDisplayerCommon'
import SubGraph from '@/graph/SubGraph'
import Edge from '@/edge/Edge'
import GraphElement from '@/graph-element/GraphElement'
import GraphElementService from '@/graph-element/GraphElementService'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import IdUri from '@/IdUri'

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
        if (isParentAlreadyOnMap) {
            this.model().nbRelationsWithGrandParent = this._removeRelationWithGrandParentAndChildFromServerGraph(serverGraph);
        }
        let centerUri = this.model().getUri();
        let isCenterEdge = IdUri.isEdgeUri(this.model().getUri());
        if (isCenterEdge) {
            let centerEdge = Edge.fromServerFormat(
                serverGraph.edges[this.model().getUri()]
            );
            centerUri = centerEdge.getSourceVertex().getUri();
        }
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            serverGraph,
            centerUri
        );
        let graph = SubGraph.withFacadeAndCenterUri(
            serverGraph,
            centerUri
        );
        let parentAsCenter = graph.center;
        let modelToAddChild;
        if (isParentAlreadyOnMap) {
            modelToAddChild = this.model();
            modelToAddChild.setLabel(
                parentAsCenter.getLabel()
            );
            graph.add(this.model())
        } else {
            parentAsCenter.makeCenter();
            modelToAddChild = parentAsCenter;
            graph.add(modelToAddChild);
        }
        let childrenIndex = parentAsCenter.getChildrenIndex();
        let isChildrenIndexBuilt = Object.keys(childrenIndex).length > 0;
        sortGroupRelationRootsByIsGroupRelationOrCreationDate(
            parentAsCenter.groupRelationRoots,
            childrenIndex
        ).forEach((groupRelationRoot) => {
            if (groupRelationRoot.isGroupRelation() && groupRelationRoot.isTrulyAGroupRelation()) {
                let childIndex = childrenIndex[groupRelationRoot.getFirstVertex(childrenIndex).getUri()];
                let addLeft;
                if (childIndex !== undefined) {
                    addLeft = childIndex.toTheLeft;
                }
                graph.groupRelations.push(groupRelationRoot);
                modelToAddChild.addChild(
                    groupRelationRoot,
                    addLeft
                );
                return;
            }
            groupRelationRoot.sortedImmediateChild(parentAsCenter.getChildrenIndex()).forEach((child) => {
                    Object.keys(child).forEach((uId) => {
                        let triple = child[uId];
                        triple.edge.uiId = uId;

                        let childIndex = childrenIndex[triple.vertex.getUri()];
                        let addLeft;
                        if (childIndex !== undefined) {
                            addLeft = childIndex.toTheLeft;
                        }
                        triple.edge.setSourceVertex(
                            graph.getVertexWithUri(
                                triple.edge.getSourceVertex().getUri()
                            )
                        );
                        triple.edge.setDestinationVertex(
                            graph.getVertexWithUri(
                                triple.edge.getDestinationVertex().getUri()
                            )
                        );
                        modelToAddChild.addChild(
                            triple.edge,
                            addLeft
                        )
                    });
                }
            );
        });
        graph.groupRelations.forEach((groupRelation) => {
            if (groupRelation.hasFewEnoughBubblesToExpand()) {
                groupRelation.expand(true);
            } else {
                groupRelation.collapse();
            }
        });
        return isChildrenIndexBuilt ? Promise.resolve(graph) :
            GraphElementService.changeChildrenIndex(
                modelToAddChild
            ).then(function () {
                return graph;
            });
    });
};

SubGraphController.prototype._removeRelationWithGrandParentAndChildFromServerGraph = function (serverGraph) {
    if (this.model().isCenter) {
        return 0;
    }
    let parentRelation = this.model().getParentBubble();
    let relationWithGrandParentUri = parentRelation.isMetaRelation() ? parentRelation.getEdgeUri() : parentRelation.getUri();
    let grandParent = this.model().getParentVertex();
    let grandParentUriToCompare = grandParent.getUri();
    let nbRelationsWithGrandParent = 0;
    let alreadyPresentChildEdgesUri = [];
    this.model().visitClosestChildRelations(function (edge) {
        alreadyPresentChildEdgesUri.push(edge.getUri());
    });
    serverGraph.edges = getFilteredEdges();
    if (1 === nbRelationsWithGrandParent) {
        delete serverGraph.vertices[grandParentUriToCompare];
    }
    return nbRelationsWithGrandParent - 1;

    function getFilteredEdges() {
        let filteredEdges = {};
        Object.values(serverGraph.edges).forEach((edge) => {
            let edgeFacade = Edge.fromServerFormat(
                edge
            );
            let sourceAndDestinationId = [
                edgeFacade.getSourceVertex().getUri(),
                edgeFacade.getDestinationVertex().getUri()
            ];
            if (sourceAndDestinationId.indexOf(grandParentUriToCompare) !== -1) {
                nbRelationsWithGrandParent++;
            }
            let alreadyChildEdge = alreadyPresentChildEdgesUri.indexOf(
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

function sortGroupRelationRootsByIsGroupRelationOrCreationDate(groupRelationRoots, childrenIndex) {
    return groupRelationRoots.sort(function (groupRelationA, groupRelationB) {
            let vertexA = groupRelationA.getFirstVertex(childrenIndex);
            let vertexB = groupRelationB.getFirstVertex(childrenIndex);
            return GraphElement.sortCompare(
                vertexA,
                vertexB,
                childrenIndex
            );
        }
    );
}

export default api;
