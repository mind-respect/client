/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexService from '@/vertex/VertexService'
import EdgeService from '@/edge/EdgeService'
import Selection from '@/Selection'
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
import CurrentSubGraph from "../graph/CurrentSubGraph";

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
    return this.isSingleAndOwned() && !this.model().isPristine();
};

VertexController.prototype.addChild = function (index, isToTheLeft) {
    let promise = this.model().isCenter ? Promise.resolve() : this.expand();
    return promise.then(() => {
        let triple = VertexService.addTuple(
            this.model()
        ).optimistic;
        this.model().addChild(
            triple.edge,
            isToTheLeft,
            index
        );
        Vue.nextTick(() => {
            Selection.setToSingle(triple.destination);
            GraphElementService.changeChildrenIndex(
                this.model()
            );
            Store.dispatch("redraw");
        });
        if (ShareLevel.PRIVATE === this.model().model().getShareLevel()) {
            triple.destination.setShareLevel(ShareLevel.PRIVATE);
        } else {
            //not returning promise to allow faster process
            triple.destination.getController().setShareLevel(
                this.model().getShareLevel()
            );
        }
        return triple;
    })
};

VertexController.prototype.convertToRelationCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    if (!this.getUi().isExpanded) {
        return false;
    }
    if (this.model().isLabelEmpty()) {
        return false;
    }
    var numberOfChild = this.model().getNumberOfChild();
    if (numberOfChild >= 2) {
        return false;
    }
    var parentBubble = this.getUi().getParentBubble();

    if (!parentBubble.isRelation() || !parentBubble.model().isPristine()) {
        return false;
    }
    if (numberOfChild === 1) {
        var childRelation = this.getUi().getNextBubble();
        return childRelation.isRelation() && childRelation.model().isPristine();
    }
    return true;
};

VertexController.prototype.convertToRelation = function () {
    let parentRelation = this.getUi().getParentBubble();
    let promises = [];
    let label = this.model().getLabel();
    let toSelect;
    if (this.model().getNumberOfChild() === 1) {
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
        Selection.setToSingle(toSelect);
    });
};

VertexController.prototype.convertToGroupRelationCanDo = function () {
    if (!this.isSingleAndOwned()) {
        return false;
    }
    if (!this.getUi().isExpanded) {
        return false;
    }
    if (this.model().isLabelEmpty()) {
        return false;
    }
    var numberOfChild = this.model().getNumberOfChild();
    if (numberOfChild <= 1) {
        return false;
    }
    var allChildAreEmptyRelations = true;
    this.getUi().visitAllImmediateChild(function (child) {
        if (!child.isRelation() || !child.model().isPristine()) {
            allChildAreEmptyRelations = false;
        }
    });
    if (!allChildAreEmptyRelations) {
        return false;
    }
    var parentBubble = this.getUi().getParentBubble();
    return parentBubble.isRelation() && parentBubble.model().isPristine();
};

VertexController.prototype.convertToGroupRelation = function () {
    var parentRelation = this.getUi().getParentBubble();
    var promise = parentRelation.getController().setLabel(
        this.model().getLabel()
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
        Selection.setToSingle(parentRelation);
    });
};

VertexController.prototype.addSiblingCanDo = function () {
    return this.isSingleAndOwned() && !this.model().isCenter &&
        !this.getUi().getParentBubble().getParentBubble().isMeta() &&
        !this.model().isPristine();
};

VertexController.prototype.addSibling = function () {
    let parent = this.model().getParentFork();
    return parent.getController().addChild(
        this.model().getIndexInTree() + 1,
        this.model().isToTheLeft()
    );
};

VertexController.prototype.removeManyIsPossible = true;

VertexController.prototype.removeCanDo = function () {
    return this.isOwned();
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
            this.isSingle() && this.getUi().model().isPublic()
        )
    );
};

VertexController.prototype.makePrivate = function () {
    return this.setShareLevel(ShareLevel.PRIVATE);
};


VertexController.prototype.makePublicCanDo = function () {
    return this.isOwned() && (
        (this.isMultiple() && !this._areAllElementsPublic()) || (
            this.isSingle() && !this.getUi().model().isPublic()
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
            this.model().getShareLevel()
        ) !== -1;
    }
    return this.getUi().every(function (ui) {
        return shareLevels.indexOf(
            ui.model().getShareLevel()
        ) !== -1;
    });
};

VertexController.prototype.makePublic = function () {
    return this.setShareLevel(ShareLevel.PUBLIC);
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
    let verticesToUpdate = this.getUiArray().filter((vertex) => {
        return vertex.getShareLevel() !== shareLevel.toUpperCase()
    }).map((vertex) => {
        if (ShareLevel.isPublic(shareLevel)) {
            vertex.getParentVertex().incrementNbPublicNeighbors();
        }
        if (shareLevel === ShareLevel.FRIENDS) {
            vertex.getParentVertex().incrementNbFriendNeighbors();
        }
        vertex.setShareLevel(shareLevel);
        if (vertex.model().isPublic()) {
            vertex.getParentVertex().decrementNbPublicNeighbors();
        }
        if (vertex.model().isFriendsOnly()) {
            vertex.getParentVertex().decrementNbFriendNeigbors();
        }
        return vertex;
    });
    if (verticesToUpdate.length === 0) {
        return Promise.resolve();
    }
    return this.isMultiple() ?
        VertexService.setCollectionShareLevel(
            shareLevel, verticesToUpdate
        ) : VertexService.setShareLevel(
            shareLevel, this.model()
        );
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
            this.model()
        );
        Vue.nextTick(() => {
            GraphElementService.changeChildrenIndex(this.model());
        });
    });

    function moveEdge(movedEdge) {
        promises.push(
            movedEdge.getController().replaceParentVertex(
                this.model(),
                true
            )
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
    if (!this.model().isCenter && !this.model().canExpand()) {
        this.model().isExpanded = true;
        return Promise.resolve();
    }
    let promise = Promise.resolve();
    LoadingFlow.enterNoSpinner();
    this.model().loading = false;
    avoidExpandChild = avoidExpandChild || false;
    isChildExpand = isChildExpand || false;
    this.model().beforeExpand();
    if (!this.model().isExpanded) {
        if (!this.model().isCollapsed) {
            promise = this.subGraphController.loadForParentIsAlreadyOnMap().then(() => {
                if (avoidExpandChild) {
                    return true;
                }
                let expandChildCalls = [];
                this.model().getClosestChildVertices().forEach((childVertex) => {
                    if (childVertex.model().hasOnlyOneHiddenChild()) {
                        expandChildCalls.push(
                            childVertex.getController().expand(true, true, true)
                        );
                    }
                });
                return Promise.all(expandChildCalls);
            });
        }
    } else {
        this.model().loading = false;
        promise = this.expandDescendantsIfApplicable();
    }
    return promise.then(() => {
        this.model().expand(avoidCenter, isChildExpand);
        Vue.nextTick(() => {
            LoadingFlow.leave();
            if (!avoidCenter) {
                Scroll.centerBubbleForTreeIfApplicable(this.model());
                Store.dispatch("redraw");
            }
        });
    });
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
    let alreadyChildOfParent = parent.getClosestChildVertices().some((child) => {
        return child.getUri() === distantVertexUri;
    });
    return !alreadyChildOfParent;
};

VertexController.prototype.convertToDistantBubbleWithUri = function (distantVertexUri) {
    if (!this.convertToDistantBubbleWithUriCanDo(distantVertexUri)) {
        return Promise.reject();
    }
    let beforeMergeLabel = this.model().getLabel();
    return VertexService.mergeTo(this.model(), distantVertexUri).then(() => {
        this.model().setUri(distantVertexUri);
        CurrentSubGraph.get().add(this.model());
        return SubGraphController.withVertex(
            this.model()
        ).loadForParentIsAlreadyOnMap();
    }).then(() => {
        let concatenatedLabel = beforeMergeLabel + " " + this.model().getLabel();
        if (concatenatedLabel !== this.model().getLabel()) {
            this.setLabel(
                concatenatedLabel
            );
        }
        GraphElementService.changeChildrenIndex(
            this.model().getParentVertex()
        );
        Store.dispatch("redraw");
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
