/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import GraphService from '@/graph/GraphService'
import GraphDisplayerAsTreeCommon from '@/graph/GraphDisplayerAsTreeCommon'
import VertexUiBuilder from '@/vertex/VertexUiBuilder'
import VertexUiBuilderViewOnly from '@/vertex/VertexUiBuilderViewOnly'
import GraphUi from '@/graph/GraphUi'
import RelativeTreeDisplayerTemplates from '@/graph/RelativeTreeDisplayerTemplates'
import EdgeUi from '@/edge/EdgeUi'
import EventBus from '@/EventBus'
import IdUri from '@/IdUri'
import RelativeTreeVertex from '@/vertex/RelativeTreeVertex'
import EdgeUiBuilder from '@/edge/EdgeUiBuilder'
import EdgeUiBuilderViewOnly from '@/edge/EdgeUiBuilderViewOnly'
import TreeEdge from '@/edge/TreeEdge'
import Point from '@/Point'
import VertexController from '@/vertex/VertexController'
import GroupRelationController from '@/group-relation/GroupRelationController'
import EdgeController from '@/edge/EdgeController'
import GraphController from '@/graph/GraphController'
    "triple_brain.graph_controller",
    "mr.app_controller",
    "mr.meta_controller",
    "mr.group-vertex-under-meta_controller",
    "mr.meta_relation_controller",
    "triple_brain.graph_element_controller",
    "triple_brain.graph_element",
    "triple_brain.keyboard_actions_handler",
    "triple_brain.edge",
    "triple_brain.identification",
    "mr.group-relation-ui-builder",
    "triple_brain.group_relation_ui",
    "triple_brain.schema_service",
    "triple_brain.schema",
    "mr.schema-ui-builder",
    "triple_brain.schema_ui",
    "triple_brain.schema_controller",
    "mr.property-ui-builder",
    "triple_brain.property_controller",
    "triple_brain.property_ui",
    "mr.suggestion-ui-builder",
    "mr.suggestion-relation-ui-builder",
    "triple_brain.suggestion_bubble_ui",
    "triple_brain.suggestion_relation_ui",
    "mr.meta_ui",
    "mr.group-vertex-under-meta-ui",
    "mr.meta_relation_ui",
    "triple_brain.suggestion_vertex_controller",
    "triple_brain.suggestion_relation_controller",
    "triple_brain.triple_ui",
    "triple_brain.selection_handler",
    "triple_brain.group_relation",
    "triple_brain.graph_element_main_menu",
    "triple_brain.mind_map_info",
    "mr.graph-ui-builder",
    "mr.meta_graph_ui",
    "mr.meta_graph"
], function ($, GraphService, TreeDisplayerCommon, VertexUiBuilder, ViewOnlyVertexUiBuilder, GraphUi, RelativeTreeTemplates, EdgeUi, EventBus, IdUri, RelativeTreeVertex, EdgeBuilder, EdgeBuilderForViewOnly, TreeEdge, Point, VertexController, GroupRelationController, EdgeController, GraphController, AppController, MetaController, GroupVertexUnderMetaController, MetaRelationController, GraphElementController, GraphElement, KeyboardActionsHandler, Edge, Identification, GroupRelationUiBuilder, GroupRelationUi, SchemaService, SchemaServerFacade, SchemaUiBuilder, SchemaUi, SchemaController, PropertyUiBuilder, PropertyController, PropertyUi, SuggestionUiBuilder, SuggestionRelationUiBuilder, SuggestionBubbleUi, SuggestionRelationUi, MetaUi, GroupVertexUnderMetaUi, MetaRelationUi, SuggestionVertexController, SuggestionRelationController, TripleUi, SelectionHandler, GroupRelation, GraphElementMainMenu, MindMapInfo, GraphUiBuilder, MetaGraphUi, MetaGraph) {
    "use strict";
    KeyboardActionsHandler.init();
    var api = {};
    api.displayForBubbleWithUri = function (centralBubbleUri, callback, errorCallback) {
        var deferred = $.Deferred();
        GraphService.getForCentralBubbleUri(
            centralBubbleUri,
            function (graph) {
                if (
                    IdUri.isEdgeUri(
                        centralBubbleUri
                    )
                ) {
                    var centerEdge = Edge.fromServerFormat(
                        graph.edges[centralBubbleUri]
                    );
                    centralBubbleUri = centerEdge.getSourceVertex().getUri();
                }
                api.makeForCenterVertex(
                    graph,
                    centralBubbleUri
                );
                callback();
                deferred.resolve();
            },
            errorCallback
        );
        return deferred.resolve();
    };
    api.displayForSchemaWithUri = function (uri, callback) {
        SchemaService.get(uri, function (schemaFromServer) {
            api.makeForSchema(
                SchemaServerFacade.fromServerFormat(schemaFromServer)
            );
            if (callback !== undefined) {
                callback();
            }
        });
    };
    api.displayForMetaWithUri = function (uri, callback) {
        GraphService.getForCentralBubbleUri(uri, function (subGraphServerFormat) {
            MetaGraphUi.buildFromMetaSubGraph(
                MetaGraph.fromServerFormatAndCenterUri(
                    subGraphServerFormat,
                    uri
                )
            ).then(function () {
                callback();
            });
        });
    };
    api.canAddChildTree = function () {
        return true;
    };
    api.addChildTree = function (parentVertex) {
        var deferred = $.Deferred();
        GraphService.getForCentralBubbleUri(
            parentVertex.getUri(),
            function (serverGraph) {
                api.addChildTreeUsingGraph(
                    parentVertex,
                    serverGraph
                );
                deferred.resolve(parentVertex);
                return parentVertex;
            }
        );
        return deferred.promise();
    };
    api.addChildTreeUsingGraph = function (parentVertex, serverGraph) {
        var parentUri = parentVertex.getUri();
        var graphBuilder = GraphUiBuilder.withDefaultHtmlBuilders();
        var nbRelationsWithGrandParent = removeRelationWithGrandParentAndChildFromServerGraph();
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            serverGraph,
            parentUri
        );
        var parentVertexServerFormat = serverGraph.vertices[parentUri];
        parentVertex.getModel().isLeftOriented = parentVertex.isToTheLeft();
        parentVertex.getModel().groupRelationRoots = parentVertexServerFormat.groupRelationRoots;
        if (nbRelationsWithGrandParent >= 1) {
            graphBuilder.buildChildrenHtmlTreeRecursivelyEvenIfGrandParentAndIncludingDuplicates(
                parentVertex,
                serverGraph.vertices
            );
        } else {
            graphBuilder.buildChildrenHtmlTreeRecursively(
                parentVertex,
                serverGraph.vertices
            );
        }
        parentVertex.hideHiddenRelationsContainer();
        parentVertex.visitAllImmediateChild(function (childBubble) {
            if (childBubble.isGroupRelation()) {
                GroupRelationUiBuilder.completeBuild(childBubble);
            }
            GraphUiBuilder.flagSuggestionsToNotDisplayGivenParentAndChildVertex(
                parentVertex,
                childBubble.getModel()
            );
            if (childBubble.isRelation()) {
                childBubble.resetOtherInstances();
                childBubble.reviewInLabelButtonsVisibility();
                childBubble.visitAllImmediateChild(function (childVertex) {
                    VertexUiBuilder.completeBuild(
                        childVertex
                    );
                    childVertex.resetOtherInstances();
                    childVertex.reviewInLabelButtonsVisibility();
                });
            }
        });
        GraphUiBuilder.addSuggestionsToVertex(
            parentVertex.getModel().getSuggestions(),
            parentVertex
        );
        GraphElementMainMenu.showWholeGraphButtonOnlyIfApplicable(
            GraphElementMainMenu.getExpandAllButton()
        );

        function removeRelationWithGrandParentAndChildFromServerGraph() {
            var parentRelation = parentVertex.getRelationWithUiParent();
            var relationWithGrandParentUri = parentRelation.getUri();
            var grandParent = parentVertex.getParentVertex();
            var grandParentUriToCompare = grandParent.getUri();
            var nbRelationsWithGrandParent = 0;
            var alreadyPresentChildEdgesUri = [];
            parentVertex.visitClosestChildRelations(function (edge) {
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
        }
    };
    api.connectVertexToVertexWithUri = function (parentVertex, destinationVertexUri, callback) {
        var deferred = $.Deferred();
        GraphService.getForCentralBubbleUri(
            destinationVertexUri,
            function (serverGraph) {
                var drawnTree = api.makeForNonCenterVertex(
                    serverGraph,
                    destinationVertexUri,
                    parentVertex
                    ),
                    farVertex = RelativeTreeVertex.lastAddedWithUri(
                        destinationVertexUri
                    ),
                    relation = farVertex.getParentBubble();
                SelectionHandler.setToSingleRelation(relation);
                farVertex.visitVerticesChildren(VertexUiBuilder.completeBuild);
                farVertex.sideCenterOnScreenWithAnimation();
                if (callback !== undefined) {
                    callback(drawnTree, farVertex);
                }
                deferred.resolve(new TripleUi.TripleUi(
                    relation,
                    parentVertex,
                    farVertex
                ));
            }
        );
        return deferred.promise();
    };
    api.name = function () {
        return "relative_tree";
    };

    api.addProperty = function (property, schema) {
        var graphUiBuilder = GraphUiBuilder.usingEdgeUiBuilder(
            new PropertyUiBuilder.PropertyUiBuilder()
        );
        var propertyUi = graphUiBuilder.addEdge(
            property,
            schema
        );
        PropertyUiBuilder.completeBuild(propertyUi);
        return propertyUi;
    };
    api.allowsMovingVertices = function () {
        return false;
    };

    api.addEdgeAndVertex = function (sourceBubbleUi, edge, destinationVertex, relationOver) {
        var graphUiBuilder = GraphUiBuilder.withDefaultHtmlBuilders();
        var edgeUi = graphUiBuilder.addEdge(
            edge,
            sourceBubbleUi,
            relationOver
        );
        var destinationVertexUi = graphUiBuilder.addVertex(
            destinationVertex,
            edgeUi
        );
        EdgeBuilder.afterChildBuilt(
            edgeUi,
            sourceBubbleUi,
            destinationVertexUi
        );
        VertexUiBuilder.completeBuild(destinationVertexUi);
        var parentVertexUi = sourceBubbleUi.isGroupRelation() ?
            sourceBubbleUi.getParentVertex() : sourceBubbleUi;
        return new TripleUi.TripleUi(
            edgeUi,
            parentVertexUi,
            destinationVertexUi
        );
    };
    api.addSuggestionToSourceVertex = function (suggestion, parentVertexUi) {
        var graphUiBuilder = GraphUiBuilder.withDefaultHtmlBuilders();
        var relationSuggestionUi = graphUiBuilder.buildBubbleHtmlIntoContainer(
            suggestion,
            parentVertexUi,
            new SuggestionRelationUiBuilder.SuggestionRelationUiBuilder()
        );
        relationSuggestionUi.getModel().isLeftOriented = relationSuggestionUi.getSuggestion().isLeftOriented;
        var destinationSuggestionUi = graphUiBuilder.buildBubbleHtmlIntoContainer(
            suggestion,
            relationSuggestionUi,
            new SuggestionUiBuilder.SuggestionUiBuilder()
        );
        destinationSuggestionUi.getModel().isLeftOriented = destinationSuggestionUi.getSuggestion().isLeftOriented;
        SuggestionUiBuilder.completeBuild(
            destinationSuggestionUi
        );
        SuggestionRelationUiBuilder.afterChildBuilt(
            relationSuggestionUi
        );
        return new TripleUi.TripleUi(
            relationSuggestionUi,
            parentVertexUi,
            destinationSuggestionUi
        );
    };
    api.getEdgeSelector = function () {
        return TreeEdge;
    };
    api.getVertexSelector = function () {
        return RelativeTreeVertex;
    };
    api.getSchemaSelector = function () {
        return SchemaUi;
    };
    api.getPropertySelector = function () {
        return PropertyUi;
    };
    api.getGroupRelationSelector = function () {
        return GroupRelationUi;
    };
    api.getVertexMenuHandler = function () {
        return VertexController;
    };
    api.getRelationMenuHandler = function () {
        return EdgeController;
    };
    api.getGroupRelationMenuHandler = function () {
        return GroupRelationController;
    };
    api.getSchemaMenuHandler = function () {
        return SchemaController;
    };
    api.getPropertyMenuHandler = function () {
        return PropertyController;
    };
    api.getGraphElementMenuHandler = function () {
        return GraphElementController;
    };
    api.getGraphMenuHandler = function () {
        return GraphController;
    };
    api.getAppController = function () {
        return AppController;
    };
    api.getMetaController = function () {
        return MetaController;
    };
    api.getGroupVertexUnderMetaController = function () {
        return GroupVertexUnderMetaController;
    };
    api.getMetaRelationController = function () {
        return MetaRelationController;
    };
    api.getVertexSuggestionController = function () {
        return SuggestionVertexController;
    };
    api.getRelationSuggestionMenuHandler = function () {
        return SuggestionRelationController;
    };
    api.getVertexSuggestionSelector = function () {
        return SuggestionBubbleUi;
    };
    api.getRelationSuggestionSelector = function () {
        return SuggestionRelationUi;
    };
    api.getMetaUiSelector = function () {
        return MetaUi;
    };
    api.getGroupVertexUnderMetaUiSelector = function () {
        return GroupVertexUnderMetaUi;
    };
    api.getMetaUiRelationSelector = function () {
        return MetaRelationUi;
    };
    api.buildIncludedGraphElementsView = function (vertex, container) {
        var serverGraph = {
            vertices: vertex.getModel().getIncludedVertices(),
            edges: vertex.getModel().getIncludedEdges()
        };
        return api.makeForIncludedVerticesView(
            serverGraph,
            container
        );
    };
    api.expandGroupRelation = function (groupRelationUi) {
        var graphUiBuilder = GraphUiBuilder.withDefaultHtmlBuilders();
        var groupRelation = groupRelationUi.getGroupRelation();
        graphUiBuilder.buildGroupRelationToExpand(
            groupRelation,
            groupRelationUi
        );
        $.each(groupRelation.getSortedVertices(
            groupRelationUi.getParentVertex().getModel().getChildrenIndex()
        ), function (key, verticesWithSameUri) {
            $.each(verticesWithSameUri, function (vertexHtmlId) {
                VertexUiBuilder.completeBuild(
                    RelativeTreeVertex.withId(vertexHtmlId)
                );
            });
        });
        groupRelationUi.hideHiddenRelationsContainer();
        GraphElementMainMenu.showWholeGraphButtonOnlyIfApplicable(
            GraphElementMainMenu.getExpandAllButton()
        );
    };

    api.addNewGroupRelation = function (identifiers, parentBubble, addToLeft, previousEdge) {
        var graphUiBuilder = GraphUiBuilder.withDefaultHtmlBuilders();
        graphUiBuilder.setDirectionAroundCenter(
            addToLeft
        );
        var newGroupRelation = graphUiBuilder.buildBubbleHtmlIntoContainer(
            GroupRelation.usingIdentification(identifiers),
            parentBubble,
            new GroupRelationUiBuilder.GroupRelationUiBuilder(),
            undefined,
            previousEdge
        );
        GroupRelationUiBuilder.completeBuild(newGroupRelation);
        return newGroupRelation;
    };

    api.makeForSchema = function (schema) {
        var graphUiBuilder = GraphUiBuilder.usingVertexAndEdgeHtmlBuilder(
            new SchemaUiBuilder.SchemaUiBuilder()
        );
        var container = GraphUiBuilder.buildRootBubbleContainer();
        graphUiBuilder.buildRootBubble(
            schema,
            container
        );
        $.each(schema.getProperties(), function () {
            var propertyServerFacade = this;
            graphUiBuilder.buildBubbleHtmlIntoContainer(
                propertyServerFacade,
                graphUiBuilder.rootBubble,
                new PropertyUiBuilder.PropertyUiBuilder()
            );
        });
        return container;
    };
    api.makeForCenterVertex = function (serverGraph, centralVertexUri) {
        return makeInContainerUsingServerGraphAndCentralVertexUri(
            serverGraph,
            centralVertexUri,
            GraphUiBuilder.buildRootBubbleContainer()
        );
    };
    api.makeForNonCenterVertex = function (serverGraph, destinationVertexUri, parentVertex) {
        TreeDisplayerCommon.setUiTreeInfoToVertices(serverGraph, parentVertex.getUri());
        var serverVertex = serverGraph.vertices[parentVertex.getUri()];
        serverVertex.isLeftOriented = parentVertex.isToTheLeft();
        parentVertex.setModel(serverVertex);
        var graphUiBuilder = GraphUiBuilder.withDefaultHtmlBuilders();
        graphUiBuilder.buildChildrenHtmlTreeRecursively(parentVertex, serverGraph.vertices);
        parentVertex.visitVerticesChildren(function (vertex) {
            var wasAlreadyShownInGraph = serverGraph.vertices[vertex.getUri()] === undefined;
            if (wasAlreadyShownInGraph) {
                return;
            }
            VertexUiBuilder.completeBuild(vertex);
            vertex.visitAllImmediateChild(function (childBubble) {
                if (childBubble.isGroupRelation()) {
                    GroupRelationUiBuilder.completeBuild(childBubble);
                }
            });
        });
        return serverGraph;
    };
    api.makeForIncludedVerticesView = function (serverGraph, container) {
        var verticesContainer = RelativeTreeTemplates[
            "root_vertex_super_container"
            ].merge();
        container.append(
            verticesContainer
        );
        var centralVertexUri = Object.keys(
            serverGraph.vertices
        )[0];
        return makeInContainerUsingServerGraphAndCentralVertexUri(
            serverGraph,
            centralVertexUri,
            verticesContainer,
            GraphUiBuilder.usingVertexAndEdgeHtmlBuilder(
                new ViewOnlyVertexUiBuilder.ViewOnlyVertexUiBuilder(),
                new EdgeBuilderForViewOnly.EdgeBuilderForViewOnly()
            )
        );
    };

    function makeInContainerUsingServerGraphAndCentralVertexUri(serverGraph, rootVertexUri, verticesContainer, graphUiBuilder) {
        graphUiBuilder = graphUiBuilder || GraphUiBuilder.withDefaultHtmlBuilders();
        TreeDisplayerCommon.setUiTreeInfoToVertices(
            serverGraph,
            rootVertexUri
        );
        var vertices = serverGraph.vertices;
        buildVerticesHtml();
        return verticesContainer;

        function buildVerticesHtml() {
            var serverRootVertex = vertexWithId(rootVertexUri);
            graphUiBuilder.buildRootBubble(
                serverRootVertex,
                verticesContainer
            );
            graphUiBuilder.buildGroupRelations(
                serverRootVertex,
                graphUiBuilder.rootBubble
            );
            if (graphUiBuilder.rootBubble.hasSuggestions()) {
                GraphUiBuilder.addSuggestionsToVertex(
                    graphUiBuilder.rootBubble.getModel().getSuggestions(),
                    graphUiBuilder.rootBubble
                );
            }
        }

        function vertexWithId(vertexId) {
            return vertices[vertexId];
        }
    }

    return api;
});
