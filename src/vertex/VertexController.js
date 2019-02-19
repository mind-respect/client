/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import VertexService from '@/vertex/VertexService'
import EdgeService from '@/edge/EdgeService'
import SelectionHandler from '@/SelectionHandler'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementController from '@/graph-element/GraphElementController'
import BubbleDeleteMenu from '@/bubble/BubbleDeleteMenu'
import EdgeUi from '@/edge/EdgeUi'
import ImageMenu from '@/image/ImageMenu'
import IncludedGraphElementsMenu from '@/vertex/IncludedGraphElementsMenu'
import Vertex from '@/vertex/Vertex'
import Identification from '@/identifier/Identification'
import GraphElementService from '@/graph-element/GraphElementService'
import SchemaSuggestion from '@/schema/SchemaSuggestion'
import GraphElementUi from '@/graph-element/GraphElementUi'
import EventBus from '@/EventBus'
import IdUri from '@/IdUri'
import GraphElementType from '@/GraphElementType'
import ShareLevel from '@/vertex/ShareLevel'
import GraphUi from '@/graph/GraphUi'

const api = {};

function VertexController(vertices) {
    this.vertices = vertices;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.vertices
    );
}

VertexController.prototype = new GraphElementController.GraphElementController();

VertexController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned() && !this.getModel().isPristine();
};

VertexController.prototype.addChild = function () {
    return this._addChildToRealAndUiParent(
        this.getUi()
    );
};

VertexController.prototype.convertToRelationCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    if (!this.getUi().isExpanded()) {
        return false;
    }
    if (this.getModel().isLabelEmpty()) {
        return false;
    }
    var numberOfChild = this.getModel().getNumberOfChild();
    if (numberOfChild >= 2) {
        return false;
    }
    var parentBubble = this.getUi().getParentBubble();

    if (!parentBubble.isRelation() || !parentBubble.getModel().isPristine()) {
        return false;
    }
    if (numberOfChild === 1) {
        var childRelation = this.getUi().getTopMostChildBubble();
        return childRelation.isRelation() && childRelation.getModel().isPristine();
    }
    return true;
};

VertexController.prototype.convertToRelation = function () {
    var parentRelation = this.getUi().getParentBubble();
    var promises = [];
    var label = this.getModel().getLabel();
    var toSelect;
    if (this.getModel().getNumberOfChild() === 1) {
        var childRelation = this.getUi().getTopMostChildBubble();
        promises.push(
            childRelation.getController().setLabel(
                label
            )
        );
        promises.push(
            childRelation.getController().moveBelow(
                parentRelation
            )
        );
        promises.push(
            this.remove(true)
        );
        toSelect = childRelation;
    } else {
        promises.push(
            parentRelation.getController().setLabel(
                label
            )
        );
        this.setLabel(
            ""
        );
        toSelect = this.getUi();
    }
    return $.when.apply($, promises).then(function () {
        SelectionHandler.setToSingleGraphElement(toSelect);
    });
};

VertexController.prototype.convertToGroupRelationCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    if (!this.getUi().isExpanded()) {
        return false;
    }
    if (this.getModel().isLabelEmpty()) {
        return false;
    }
    var numberOfChild = this.getModel().getNumberOfChild();
    if (numberOfChild <= 1) {
        return false;
    }
    var allChildAreEmptyRelations = true;
    this.getUi().visitAllImmediateChild(function (child) {
        if (!child.isRelation() || !child.getModel().isPristine()) {
            allChildAreEmptyRelations = false;
        }
    });
    if (!allChildAreEmptyRelations) {
        return false;
    }
    var parentBubble = this.getUi().getParentBubble();
    return parentBubble.isRelation() && parentBubble.getModel().isPristine();
};

VertexController.prototype.convertToGroupRelation = function () {
    var parentRelation = this.getUi().getParentBubble();
    var promise = parentRelation.getController().setLabel(
        this.getModel().getLabel()
    );
    this.getUi().visitClosestChildOfType(GraphElementType.Vertex, function (childRelation) {
        promise = promise.then(function () {
            parentRelation = this.getUi().getParentBubble();
            if (parentRelation.getParentBubble().isGroupRelation()) {
                parentRelation = parentRelation.getParentBubble();
            }
            return childRelation.getController().moveUnderParent(
                parentRelation
            );
        }.bind(this));
    }.bind(this));
    promise = promise.then(function () {
        return this.remove(true);
    }.bind(this));
    return promise.then(function () {
        SelectionHandler.setToSingleGraphElement(parentRelation);
    });
};

VertexController.prototype.addSiblingCanDo = function () {
    return this.isSingleAndOwned() && !this.getUi().isCenterBubble() &&
        !this.getUi().getParentBubble().getParentBubble().isMeta() &&
        !this.getModel().isPristine();
};

VertexController.prototype.addSibling = function () {
    var edgeOver = this.getUi().getParentBubble();
    if (this.getUi().isImmediateChildOfGroupRelation()) {
        var groupRelation = this.getUi().getParentBubble().getParentBubble();
        return groupRelation.getController().addChild(
            edgeOver
        );
    }
    return this._addChildToRealAndUiParent(
        this.getUi().getParentVertex(),
        this.getUi().getParentBubble().getParentBubble(),
        edgeOver
    );
};

VertexController.prototype.removeManyIsPossible = true;

VertexController.prototype.removeCanDo = function () {
    return this.isOwned();
};

VertexController.prototype.remove = function (skipConfirmation) {
    var isPristine = this.getModelArray().every(function (model) {
        return model.isPristine();
    });
    if (skipConfirmation === undefined && isPristine) {
        skipConfirmation = true;
    }
    if (skipConfirmation) {
        return deleteAfterConfirmationBehavior.bind(this)(
            this.vertices
        );
    }
    return BubbleDeleteMenu.forVertices(
        this.vertices
    ).ask().then(
        deleteAfterConfirmationBehavior.bind(this)
    );

    function deleteAfterConfirmationBehavior() {
        var removePromise = this.isSingle() ?
            VertexService.remove(
                this.getUi()
            ) :
            VertexService.removeCollection(
                this.getUi()
            );
        return removePromise.then(function () {
            this.getUiArray().forEach(function (ui) {
                ui.remove();
            });
            return true;
        }.bind(this));
    }
};

VertexController.prototype.imagesCanDo = function () {
    return this.isSingleAndOwned();
};

VertexController.prototype.images = function () {
    ImageMenu.ofVertex(
        this.vertices
    ).build();
};

VertexController.prototype.togglePublicPrivate = function () {
    if (this._areAllElementsPrivate()) {
        this.makePublic();
    } else if (this._areAllElementsPublic()) {
        this.makePrivate();
    }
};


VertexController.prototype.makePrivateManyIsPossible = true;

VertexController.prototype.makePrivateCanDo = function () {
    return this.isOwned() && (
        (this.isMultiple() && !this._areAllElementsPrivate()) || (
            this.isSingle() && this.getUi().getModel().isPublic()
        )
    );
};

VertexController.prototype.privateShareLevelCanShowInLabel = function () {
    return $.Deferred().resolve(
        this.getModel().isPrivate()
    );
};

VertexController.prototype.publicShareLevelCanShowInLabel = function () {
    return $.Deferred().resolve(
        this.getModel().isPublic()
    );
};

VertexController.prototype.friendsShareLevelCanShowInLabel = function () {
    return $.Deferred().resolve(
        this.getModel().isFriendsOnly()
    );
};

VertexController.prototype.makePrivate = function () {
    var self = this;
    if (this.isSingle()) {
        VertexService.makePrivate(
            this.getUi()
        ).then(function () {
            self.getModel().makePrivate();
            self.getUi().makePrivate();
            publishVertexPrivacyUpdated(
                self.getUi()
            );
        });
    } else {
        var publicVertices = [];
        $.each(self.getUi(), function () {
            var vertex = this;
            if (this.getModel().isPublic()) {
                publicVertices.push(
                    vertex
                );
            }
        });
        VertexService.makeCollectionPrivate(
            publicVertices
        ).then(function () {
            $.each(publicVertices, function () {
                var ui = this;
                ui.getModel().makePrivate();
                ui.makePrivate();
                publishVertexPrivacyUpdated(ui);
            });
        });
    }
};

VertexController.prototype.makePublicManyIsPossible = true;

VertexController.prototype.makePublicCanDo = function () {
    return this.isOwned() && (
        (this.isMultiple() && !this._areAllElementsPublic()) || (
            this.isSingle() && !this.getUi().getModel().isPublic()
        )
    );
};

VertexController.prototype.makePublicCanShowInLabel = function () {
    return $.Deferred().resolve(
        !this.getModel().isPublic() && this.isOwned()
    );
};

VertexController.prototype._areAllElementsPublic = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.PUBLIC_WITH_LINK,
        ShareLevel.PUBLIC
    ]);
};

VertexController.prototype._areAllElementsPrivate = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.PRIVATE
    ]);
};

VertexController.prototype._areAllElementsFriendsOnly = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.FRIENDS
    ]);
};

VertexController.prototype._areAllElementsInShareLevels = function (shareLevels) {
    if (this.isSingle()) {
        return shareLevels.indexOf(
            this.getModel().getShareLevel()
        ) !== -1;
    }
    var allInShareLevel = true;
    this.getUi().forEach(function (ui) {
        var isInShareLevel = shareLevels.indexOf(
            ui.getModel().getShareLevel()
        ) !== -1;
        if (!isInShareLevel) {
            allInShareLevel = false;
        }
    });
    return allInShareLevel;
};

VertexController.prototype.makePublic = function () {
    var self = this;
    if (this.isSingle()) {
        return VertexService.makePublic(
            this.getUi()
        ).then(function () {
            self.getModel().makePublic();
            self.getUi().makePublic();
            publishVertexPrivacyUpdated(
                self.getUi()
            );
        });
    } else {
        var privateVertices = [];
        $.each(self.getUi(), function () {
            var vertex = this;
            if (!this.getModel().isPublic()) {
                privateVertices.push(
                    vertex
                );
            }
        });
        return VertexService.makeCollectionPublic(
            privateVertices
        ).then(function () {
            $.each(privateVertices, function () {
                var ui = this;
                ui.getModel().makePublic();
                ui.makePublic();
                publishVertexPrivacyUpdated(ui);
            });
        });
    }
};

VertexController.prototype.share = function () {
    var $shareMenu = $("#share-menu");
    var $shareList = $("#share-list").empty();
    var $copyShareLink = $("#copy-share-link");
    this.getUiArray().forEach(function (bubble) {
        $shareList.append(
            $("<li>").text(bubble.text())
        );
    });
    $shareMenu.find(".multiple-flow")[
        this.isMultiple() ? 'removeClass' : 'addClass'
        ]("hidden");
    $copyShareLink[this.isMultiple() ? 'addClass' : 'removeClass'](
        "hidden"
    );
    var $radios = $shareMenu.find("input[name=shareLevel]");
    if (this._areAllElementsPrivate()) {
        $radios.val(["private"]);
        $copyShareLink.prop('disabled', true);
    } else if (this._areAllElementsFriendsOnly()) {
        $radios.val(["friends"]);
    } else if (this._areAllElementsInShareLevels([ShareLevel.PUBLIC_WITH_LINK])) {
        $radios.val(["public_with_link"]);
    }
    else if (this._areAllElementsInShareLevels([ShareLevel.PUBLIC])) {
        $radios.val(["public"]);
    } else {
        $radios.val([""]);
    }
    $shareMenu.modal();
};

VertexController.prototype.setShareLevel = function (shareLevel) {
    this.getUiArray().forEach(function (vertexUi) {
        if (vertexUi.getModel().isPublic()) {
            vertexUi.getParentVertex().getModel().decrementNbPublicNeighbors();
        }
        if (vertexUi.getModel().isFriendsOnly()) {
            vertexUi.getParentVertex().getModel().decrementNbFriendNeigbors();
        }
    });
    var promise = this.isMultiple() ?
        VertexService.setCollectionShareLevel(
            shareLevel, this.getUi()
        ) : VertexService.setShareLevel(
            shareLevel, this.getUi()
        );
    return promise.then(function () {
        this.getUiArray().forEach(function (vertexUi) {
            if (ShareLevel.isPublic(shareLevel)) {
                vertexUi.getParentVertex().getModel().incrementNbPublicNeighbors();
            }
            if (shareLevel === ShareLevel.FRIENDS) {
                vertexUi.getParentVertex().getModel().incrementNbFriendNeighbors();
            }
            vertexUi.getModel().setShareLevel(shareLevel.toUpperCase());
            vertexUi.reviewInLabelButtonsVisibility(true);
        });
    }.bind(this));
};

VertexController.prototype.becomeParent = function (graphElementUi) {
    var promises = [];
    var uiChild;
    if (graphElementUi.isGroupRelation()) {
        graphElementUi.expand();
        graphElementUi.visitClosestChildOfType(
            GraphElementType.Relation,
            moveEdge.bind(this)
        );
        uiChild = graphElementUi;
    } else {
        uiChild = graphElementUi.isRelation() ? graphElementUi : graphElementUi.getParentBubble();
        moveEdge.bind(this)(uiChild);
    }

    return $.when.apply($, promises).then(function () {
        uiChild.moveToParent(
            this.getUi()
        );
        this.getModel().incrementNumberOfConnectedEdges();
    }.bind(this));

    function moveEdge(movedEdge) {
        promises.push(
            movedEdge.getController().changeEndVertex(
                this.getUi()
            )
        );
        if (!graphElementUi.isGroupRelation()) {
            promises.push(
                movedEdge.getParentBubble().getController().becomeExParent(movedEdge)
            );
        }
    }
};

function publishVertexPrivacyUpdated(ui) {
    EventBus.publish(
        '/event/ui/graph/vertex/privacy/updated',
        ui
    );
}

VertexController.prototype.subElementsCanDo = function () {
    return this.isSingle() && this.getModel().hasIncludedGraphElements();
};

VertexController.prototype.subElements = function () {
    IncludedGraphElementsMenu.ofVertex(
        this.vertices
    ).create();
};

VertexController.prototype.suggestionsCanDo = function () {
    return this.isSingleAndOwned() && this.vertices.hasSuggestions();
};

VertexController.prototype.suggestions = function () {
    var suggestionMethod = this.vertices.areSuggestionsShown() ?
        "hide" : "show";
    this.vertices.visitAllImmediateChild(function (child) {
        if (child.isSuggestion()) {
            child[suggestionMethod]();
        }
    });
};

VertexController.prototype.createVertexFromSchema = function (schema) {
    var newVertex;
    var deferred = $.Deferred();
    VertexService.createVertex().then(
        addIdentification
    ).then(
        addSuggestions
    ).then(function () {
        deferred.resolve(
            newVertex
        );
    });
    return deferred;

    function addIdentification(newVertexServerFormat) {
        newVertex = Vertex.fromServerFormat(
            newVertexServerFormat
        );
        var identification = Identification.fromFriendlyResource(
            schema
        );
        identification.makeGeneric();
        return GraphElementService.addIdentification(
            newVertex,
            identification
        );
    }

    function addSuggestions() {
        return SchemaSuggestion.addSchemaSuggestionsIfApplicable(
            newVertex,
            schema.getUri()
        );
    }
};

VertexController.prototype.copyManyIsPossible = true;

VertexController.prototype.copyCanDo = function () {
    return !this.isSingle() || "" !== this.getUi().text();
};

VertexController.prototype.copy = function () {
};

VertexController.prototype.groupCanDo = function () {
    return this.isGroupAndOwned();
};
VertexController.prototype.group = function () {
    var selectedGraphElements = {
        edges: {},
        vertices: {}
    };
    EdgeUi.visitAllEdges(function (edge) {
        var sourceVertex = edge.getSourceVertex();
        var destinationVertex = edge.getDestinationVertex();
        var isSourceVertexSelected = sourceVertex.isSelected();
        var isDestinationVertexSelected = destinationVertex.isSelected();
        if (isSourceVertexSelected) {
            selectedGraphElements.vertices[
                sourceVertex.getUri()
                ] = "";
        }
        if (isDestinationVertexSelected) {
            selectedGraphElements.vertices[
                destinationVertex.getUri()
                ] = "";
        }
        if (isSourceVertexSelected && isDestinationVertexSelected) {
            selectedGraphElements.edges[
                edge.getUri()
                ] = "";
        }
    });
    VertexService.group(
        selectedGraphElements,
        GraphDisplayer.displayUsingCentralBubbleUri
    );
};
VertexController.prototype.expand = function (avoidCenter, avoidExpandChild, isChildExpand) {
    var deferred = $.Deferred().resolve();
    avoidExpandChild = avoidExpandChild || false;
    isChildExpand = isChildExpand || false;
    this.getUi().beforeExpand();
    if (this.getUi().hasVisibleHiddenRelationsContainer()) {
        if (!this.getUi().isCollapsed()) {
            deferred = GraphDisplayer.addChildTree(
                this.getUi()
            ).then(function () {
                if (avoidExpandChild) {
                    return true;
                }
                var expandChildCalls = [];
                this.getUi().visitClosestChildVertices(function (childVertex) {
                    if (childVertex.getModel().hasOnlyOneHiddenChild()) {
                        expandChildCalls.push(
                            childVertex.getController().expand(true, true, true)
                        );
                    }
                });
                return $.when.apply($, expandChildCalls);
            }.bind(this));
        }
    } else {
        deferred = this.expandDescendantsIfApplicable();
    }
    return deferred.then(function () {
        this.getUi().expand(avoidCenter, isChildExpand);
    }.bind(this));
};

VertexController.prototype.convertToDistantBubbleWithUriCanDo = function (distantVertexUri) {
    if (!IdUri.isGraphElementUriOwnedByCurrentUser(distantVertexUri)) {
        return false;
    }
    if (!IdUri.isVertexUri(distantVertexUri)) {
        return false;
    }
    var parent = this.getUi().getParentVertex();
    var grandParent = parent.getParentVertex();
    if (distantVertexUri === grandParent.getUri()) {
        return false;
    }
    var canDo = true;
    parent.visitClosestChildVertices(function (child) {
        if (distantVertexUri === child.getUri()) {
            canDo = false;
        }
    });
    return canDo;
};

VertexController.prototype.convertToDistantBubbleWithUri = function (distantVertexUri) {
    if (!this.convertToDistantBubbleWithUriCanDo(distantVertexUri)) {
        return $.Deferred().reject();
    }
    this.getUi().beforeConvertToDistantBubbleWithUri();
    return VertexService.mergeTo(this.getModel(), distantVertexUri).then(function () {
        this.getUi().mergeTo(distantVertexUri);
        return GraphDisplayer.addChildTree(this.getUi());
    }.bind(this)).then(function () {
        this.getUi().afterConvertToDistantBubbleWithUri();
    }.bind(this));
};

VertexController.prototype.mergeCanDo = function () {
    return this.isSingle() && this.isOwned();
};

VertexController.prototype._relateToDistantVertexWithUri = function (distantVertexUri) {
    return EdgeService.addToFarVertex(this.getUi(), distantVertexUri).then(function () {
        return GraphDisplayer.connectVertexToVertexWithUri(
            this.getUi(),
            distantVertexUri
        );
    }.bind(this));
};
VertexController.prototype._addChildToRealAndUiParent = function (realParent, uiParent, edgeOver) {
    if (uiParent === undefined) {
        uiParent = realParent;
    }
    return uiParent.isExpanded() ?
        doIt() :
        uiParent.getController().expand().then(doIt);

    function doIt() {
        var triple;
        return VertexService.addRelationAndVertexToVertex(
            realParent,
            uiParent,
            edgeOver
        ).then(function (_triple) {
                triple = _triple;
                triple.destinationVertex().getModel().incrementNumberOfConnectedEdges();
                triple.sourceVertex().getModel().incrementNumberOfConnectedEdges();
                if (ShareLevel.PRIVATE === realParent.getModel().getShareLevel()) {
                    triple.destinationVertex().getModel().setShareLevel(ShareLevel.PRIVATE);
                    triple.destinationVertex().reviewInLabelButtonsVisibility();
                    return;
                }
                // GraphUi.refreshWidth();
                return triple.destinationVertex().getController().setShareLevel(
                    realParent.getModel().getShareLevel()
                );
            }
        ).then(function () {
            triple.sourceVertex().tripleAdded(triple);
            return GraphElementService.changeChildrenIndex(
                triple.sourceVertex()
            );
        }).then(function () {
            return triple;
        });
    }
};

VertexController.prototype.setFont = function (font) {
    var centerVertex = GraphElementUi.getCenterVertexOrSchema();
    centerVertex.getModel().setFont(font);
    centerVertex.setCenterBubbleFont(font);
    return VertexService.saveFont({
        family: font.family
    });
};

api.VertexController = VertexController;

export default api;
