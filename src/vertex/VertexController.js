/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexService from '@/vertex/VertexService'
import EdgeService from '@/edge/EdgeService'
import SelectionHandler from '@/SelectionHandler'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementController from '@/graph-element/GraphElementController'
import GraphElementService from '@/graph-element/GraphElementService'
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'
import ShareLevel from '@/vertex/ShareLevel'
import SubGraphController from '@/graph/SubGraphController'
import LoadingFlow from '@/LoadingFlow'
import Scroll from '@/Scroll'
import Vue from 'vue'
import Store from '@/store'

const api = {};

function VertexController(vertices) {
    this.vertices = vertices;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.vertices
    );
    this.subGraphController = SubGraphController.withVertices(
        this.vertices
    );
}

VertexController.prototype = new GraphElementController.GraphElementController();

VertexController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned() && !this.getModel().isPristine();
};

VertexController.prototype.addChild = function (isToTheLeft) {
    let triple;
    let promise = this.getModel().isCenter ? Promise.resolve() : this.expand();
    promise.then(() => {
        return VertexService.addTuple(
            this.getModel()
        );
    }).then((_triple) => {
        triple = _triple;
        this.getModel().addChild(triple.edge, isToTheLeft);
        Vue.nextTick(() => {
            SelectionHandler.setToSingle(triple.destination);
        });
        GraphElementService.changeChildrenIndex(
            triple.source
        );
        Store.dispatch("redraw");
        if (ShareLevel.PRIVATE === this.getModel().getModel().getShareLevel()) {
            triple.destination.setShareLevel(ShareLevel.PRIVATE);
        } else {
            //not returning promise to allow faster process
            triple.destination.getController().setShareLevel(
                this.getModel().getShareLevel()
            );
        }
        return triple;
    });
};

VertexController.prototype.convertToRelationCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    if (!this.getUi().isExpanded) {
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
        var childRelation = this.getUi().getNextBubble();
        return childRelation.isRelation() && childRelation.getModel().isPristine();
    }
    return true;
};

VertexController.prototype.convertToRelation = function () {
    let parentRelation = this.getUi().getParentBubble();
    let promises = [];
    let label = this.getModel().getLabel();
    let toSelect;
    if (this.getModel().getNumberOfChild() === 1) {
        var childRelation = this.getUi().getNextBubble();
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
    return Promise.all(promises).then(() => {
        SelectionHandler.setToSingle(toSelect);
    });
};

VertexController.prototype.convertToGroupRelationCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    if (!this.getUi().isExpanded) {
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
        SelectionHandler.setToSingle(parentRelation);
    });
};

VertexController.prototype.addSiblingCanDo = function () {
    return this.isSingleAndOwned() && !this.getModel().isCenter &&
        !this.getUi().getParentBubble().getParentBubble().isMeta() &&
        !this.getModel().isPristine();
};

VertexController.prototype.addSibling = function () {
    let parent = this.getModel().getClosestAncestorInTypes([
        GraphElementType.Vertex,
        GraphElementType.GroupRelation
    ]);
    return parent.getController().addChild(
        this.getModel().isToTheLeft()
    );
};

VertexController.prototype.removeManyIsPossible = true;

VertexController.prototype.removeCanDo = function () {
    return this.isOwned();
};

VertexController.prototype.remove = function (skipConfirmation) {
    Store.dispatch("setIsRemoveFlow", true);
};

VertexController.prototype.imagesCanDo = function () {
    return false;
    // return this.isSingleAndOwned();
};

VertexController.prototype.images = function () {
//
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

VertexController.prototype.makePrivate = function () {
    if (this.isSingle()) {
        VertexService.makePrivate(
            this.getModel()
        ).then(() => {
            this.getModel().makePrivate();
        });
    } else {
        let publicVertices = [];
        this.getUi().forEach((vertex) => {
            if (vertex.isPublic()) {
                publicVertices.push(
                    vertex
                );
            }
        });
        VertexService.makeCollectionPrivate(
            publicVertices
        ).then(function () {
            publicVertices.forEach(function (vertex) {
                vertex.makePrivate();
            })
        });
    }
};


VertexController.prototype.makePublicCanDo = function () {
    return this.isOwned() && (
        (this.isMultiple() && !this._areAllElementsPublic()) || (
            this.isSingle() && !this.getUi().getModel().isPublic()
        )
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
    return this.getUi().every(function (ui) {
        return shareLevels.indexOf(
            ui.getModel().getShareLevel()
        ) !== -1;
    });
};

VertexController.prototype.makePublic = function () {
    if (this.isSingle()) {
        return VertexService.makePublic(
            this.getUi()
        ).then(() => {
            this.getModel().makePublic();
        });
    } else {
        let privateVertices = [];
        this.getUi().forEach((vertex) => {
            if (!vertex.isPublic()) {
                privateVertices.push(
                    vertex
                );
            }
        });
        return VertexService.makeCollectionPublic(
            privateVertices
        ).then(function () {
            privateVertices.forEach(function (vertex) {
                vertex.makePublic()
            });
        });
    }
};

// VertexController.prototype.share = function () {
//     var $shareMenu = $("#share-menu");
//     var $shareList = $("#share-list").empty();
//     var $copyShareLink = $("#copy-share-link");
//     this.getUiArray().forEach(function (bubble) {
//         $shareList.append(
//             $("<li>").text(bubble.text())
//         );
//     });
//     $shareMenu.find(".multiple-flow")[
//         this.isMultiple() ? 'removeClass' : 'addClass'
//         ]("hidden");
//     $copyShareLink[this.isMultiple() ? 'addClass' : 'removeClass'](
//         "hidden"
//     );
//     var $radios = $shareMenu.find("input[name=shareLevel]");
//     if (this._areAllElementsPrivate()) {
//         $radios.val(["private"]);
//         $copyShareLink.prop('disabled', true);
//     } else if (this._areAllElementsFriendsOnly()) {
//         $radios.val(["friends"]);
//     } else if (this._areAllElementsInShareLevels([ShareLevel.PUBLIC_WITH_LINK])) {
//         $radios.val(["public_with_link"]);
//     }
//     else if (this._areAllElementsInShareLevels([ShareLevel.PUBLIC])) {
//         $radios.val(["public"]);
//     } else {
//         $radios.val([""]);
//     }
//     $shareMenu.modal();
// };

VertexController.prototype.setShareLevel = function (shareLevel) {
    this.getUiArray().forEach(function (vertexUi) {
        if (vertexUi.getModel().isPublic()) {
            vertexUi.getParentVertex().getModel().decrementNbPublicNeighbors();
        }
        if (vertexUi.getModel().isFriendsOnly()) {
            vertexUi.getParentVertex().getModel().decrementNbFriendNeigbors();
        }
    });
    let promise = this.isMultiple() ?
        VertexService.setCollectionShareLevel(
            shareLevel, this.getUi()
        ) : VertexService.setShareLevel(
            shareLevel, this.getUi()
        );
    return promise.then(() => {
        this.getUiArray().forEach(function (vertexUi) {
            if (ShareLevel.isPublic(shareLevel)) {
                vertexUi.getParentVertex().getModel().incrementNbPublicNeighbors();
            }
            if (shareLevel === ShareLevel.FRIENDS) {
                vertexUi.getParentVertex().getModel().incrementNbFriendNeighbors();
            }
            vertexUi.getModel().setShareLevel(shareLevel.toUpperCase());
        });
    });
};

VertexController.prototype.becomeParent = function (child) {
    let promises = [];
    let uiChild;
    if (child.isGroupRelation()) {
        child.expand();
        child.visitClosestChildOfType(
            GraphElementType.Relation,
            moveEdge.bind(this)
        );
        uiChild = child;
    } else {
        uiChild = child.isRelation() ? child : child.getParentBubble();
        moveEdge.bind(this)(uiChild);
    }

    return Promise.all(promises).then(() => {
        uiChild.moveToParent(
            this.getUi()
        );
        Vue.nextTick(() => {
            GraphElementService.changeChildrenIndex(this.getModel());
        });
    });

    function moveEdge(movedEdge) {
        promises.push(
            movedEdge.getController().replaceParentVertex(
                this.getUi()
            ).then(()=>{
                movedEdge.moveToParent(
                    this.getModel()
                )
            })
        );
        if (!child.isGroupRelation()) {
            promises.push(
                movedEdge.getParentBubble().getController().becomeExParent(movedEdge)
            );
        }
    }
};


// VertexController.prototype.subElementsCanDo = function () {
//     return this.isSingle() && this.getModel().hasIncludedGraphElements();
// };

// VertexController.prototype.subElements = function () {
//     IncludedGraphElementsMenu.ofVertex(
//         this.vertices
//     ).create();
// };

// VertexController.prototype.suggestionsCanDo = function () {
//     return this.isSingleAndOwned() && this.vertices.hasSuggestions();
// };

// VertexController.prototype.suggestions = function () {
//     var suggestionMethod = this.vertices.areSuggestionsShown() ?
//         "hide" : "show";
//     this.vertices.visitAllImmediateChild(function (child) {
//         if (child.isSuggestion()) {
//             child[suggestionMethod]();
//         }
//     });
// };

// VertexController.prototype.createVertexFromSchema = function (schema) {
//     var newVertex;
//     var deferred = $.Deferred();
//     VertexService.createVertex().then(
//         addIdentification
//     ).then(
//         addSuggestions
//     ).then(function () {
//         deferred.resolve(
//             newVertex
//         );
//     });
//     return deferred;
//
//     function addIdentification(newVertexServerFormat) {
//         newVertex = Vertex.fromServerFormat(
//             newVertexServerFormat
//         );
//         var identification = Identification.fromFriendlyResource(
//             schema
//         );
//         identification.makeGeneric();
//         return GraphElementService.addIdentification(
//             newVertex,
//             identification
//         );
//     }
//
//     function addSuggestions() {
//         return SchemaSuggestion.addSchemaSuggestionsIfApplicable(
//             newVertex,
//             schema.getUri()
//         );
//     }
// };

VertexController.prototype.copyCanDo = function () {
    return !this.isSingle() || !this.getUi().isLabelEmpty();
};

VertexController.prototype.copy = function () {

};

VertexController.prototype.groupCanDo = function () {
    return this.isGroupAndOwned();
};
VertexController.prototype.group = function () {
    // var selectedGraphElements = {
    //     edges: {},
    //     vertices: {}
    // };
    // EdgeUi.visitAllEdges(function (edge) {
    //     var sourceVertex = edge.getSourceVertex();
    //     var destinationVertex = edge.getDestinationVertex();
    //     var isSourceVertexSelected = sourceVertex.isSelected();
    //     var isDestinationVertexSelected = destinationVertex.isSelected();
    //     if (isSourceVertexSelected) {
    //         selectedGraphElements.vertices[
    //             sourceVertex.getUri()
    //             ] = "";
    //     }
    //     if (isDestinationVertexSelected) {
    //         selectedGraphElements.vertices[
    //             destinationVertex.getUri()
    //             ] = "";
    //     }
    //     if (isSourceVertexSelected && isDestinationVertexSelected) {
    //         selectedGraphElements.edges[
    //             edge.getUri()
    //             ] = "";
    //     }
    // });
    // VertexService.group(
    //     selectedGraphElements,
    //     GraphDisplayer.displayUsingCentralBubbleUri
    // );
};
VertexController.prototype.expand = function (avoidCenter, avoidExpandChild, isChildExpand) {
    if (!this.getModel().isCenter && !this.getModel().canExpand()) {
        this.getModel().isExpanded = true;
        return Promise.resolve();
    }
    let promise = Promise.resolve();
    LoadingFlow.enterNoSpinner();
    this.getModel().loading = false;
    avoidExpandChild = avoidExpandChild || false;
    isChildExpand = isChildExpand || false;
    this.getModel().beforeExpand();
    if (!this.getModel().isExpanded) {
        if (!this.getModel().isCollapsed) {
            promise = this.subGraphController.load().then(() => {
                if (avoidExpandChild) {
                    return true;
                }
                let expandChildCalls = [];
                this.getUi().visitClosestChildVertices(function (childVertex) {
                    if (childVertex.getModel().hasOnlyOneHiddenChild()) {
                        expandChildCalls.push(
                            childVertex.getController().expand(true, true, true)
                        );
                    }
                });
                return Promise.all(expandChildCalls);
            });
        }
    } else {
        this.getModel().loading = false;
        promise = this.expandDescendantsIfApplicable();
    }
    return promise.then(function () {
        this.getUi().expand(avoidCenter, isChildExpand);
        Vue.nextTick(() => {
            LoadingFlow.leave();
            Store.dispatch("redraw");
            Scroll.goToGraphElement(this.getModel());
        });
    }.bind(this));
};

VertexController.prototype.convertToDistantBubbleWithUriCanDo = function (distantVertexUri) {
    if (!IdUri.isGraphElementUriOwnedByCurrentUser(distantVertexUri)) {
        return false;
    }
    if (!IdUri.isVertexUri(distantVertexUri)) {
        return false;
    }
    let parent = this.getUi().getParentVertex();
    let grandParent = parent.getParentVertex();
    if (distantVertexUri === grandParent.getUri()) {
        return false;
    }
    let canDo = true;
    parent.visitClosestChildVertices(function (child) {
        if (distantVertexUri === child.getUri()) {
            canDo = false;
        }
    });
    return canDo;
};

VertexController.prototype.convertToDistantBubbleWithUri = function (distantVertexUri) {
    if (!this.convertToDistantBubbleWithUriCanDo(distantVertexUri)) {
        return Promise.reject();
    }
    // this.getUi().beforeConvertToDistantBubbleWithUri();
    let parentVertex = this.getModel().getParentVertex();
    return VertexService.mergeTo(this.getModel(), distantVertexUri).then(() => {
        this.getModel().remove();
        return SubGraphController.withVertex(
            parentVertex
        ).loadForParentIsAlreadyOnMap();
    }).then(() => {
        parentVertex.visitClosestChildVertices((childVertex) => {
            if (childVertex.getUri() === distantVertexUri) {
                childVertex.getController().expand();
            }
        });
    });
};

VertexController.prototype.mergeCanDo = function () {
    return this.isSingle() && this.isOwned();
};

VertexController.prototype._relateToDistantVertexWithUri = function (distantVertexUri) {
    return EdgeService.addToFarVertex(this.getUi(), distantVertexUri).then(() => {
        return GraphDisplayer.connectVertexToVertexWithUri(
            this.getUi(),
            distantVertexUri
        );
    });
};

api.VertexController = VertexController;

export default api;
