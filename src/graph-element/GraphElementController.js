/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElementType from '@/graph-element/GraphElementType'
import GraphElementService from '@/graph-element/GraphElementService'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import MindMapInfo from '@/MindMapInfo'
import Command from '@/Command'
import Selection from '@/Selection'
import Store from '@/store'
import router from '@/router'
import Scroll from '@/Scroll'
import Vue from 'vue'
import TagService from '@/identifier/TagService'

const api = {};
let bubbleCutClipboard,
    identificationBaseEventBusKey = "/event/ui/graph/identification/";

api.GraphElementController = GraphElementController;

function GraphElementController(graphElements) {
    if (graphElements) {
        this.init(graphElements);
    }
}

GraphElementController.prototype.init = function (graphElements) {
    if (graphElements instanceof Array && graphElements.length === 1) {
        graphElements = graphElements[0];
    }
    this.graphElements = graphElements;
};
GraphElementController.prototype.getUi = function () {
    return this.graphElements;
};
GraphElementController.prototype.getUiArray = function () {
    if (this.isSingle()) {
        return [this.graphElements];
    }
    return this.graphElements;
};
GraphElementController.prototype.model = function () {
    return this.graphElements;
};
GraphElementController.prototype.getModelArray = function () {
    return this.getUiArray().map(function (ui) {
        return ui.model();
    });
};
GraphElementController.prototype.noteCanDo = function () {
    return this.isSingle() && (
        this.isOwned() || this.model().hasComment()
    );
};

GraphElementController.prototype.setLabel = function (newLabel) {
    this.getUi().model().setLabel(
        newLabel
    );
    return FriendlyResourceService.updateLabel(
        this.model(),
        newLabel
    );
};

GraphElementController.prototype.note = function () {
    Store.dispatch("setIsDescriptionFlow", true);
};

GraphElementController.prototype.focusCanDo = function () {
    return this.isOwned() && this.isSingle();
};

GraphElementController.prototype.focus = function () {
    this.getUi().focus();
};

GraphElementController.prototype.travelLeft = function () {
    this.getUi().travelLeft();
};

GraphElementController.prototype.travelRight = function () {
    this.getUi().travelRight();
};

GraphElementController.prototype.travelUp = function () {
    this.getUi().travelUp();
};

GraphElementController.prototype.travelDown = function () {
    this.getUi().travelDown();
};


GraphElementController.prototype.centerCanDo = function () {
    return this.isSingle() && !this.getUi().isCenterBubble();
};

GraphElementController.prototype.center = function () {
    router.push(
        this.model().uri().url()
    );
};

GraphElementController.prototype.visitOtherInstancesCanDo = function () {
    return false;
};

GraphElementController.prototype.identifyHideIfDisabled = function () {
    return true;
};

GraphElementController.prototype.identifyCanDo = function () {
    return this.isSingle() && (
        (this.isOwned() && !this.model().hasIdentifications()) ||
        this.model().getIdentifiers().length === 1
    );
};

GraphElementController.prototype.identifyWhenManyHideIfDisabled = function () {
    return true;
};

GraphElementController.prototype.identifyWhenManyCanDo = function () {
    return this.isSingle() && this.model().getIdentifiers().length > 1;
};

GraphElementController.prototype.identifyWhenMany = GraphElementController.prototype.identify = function () {
    Store.dispatch("setIsTagFlow", true);
};

GraphElementController.prototype.acceptCanDo = function () {
    return false;
};

GraphElementController.prototype.accept = function () {
    let comparedWithLabel = this.getUi().getComparedWith().getLabel();
    return FriendlyResourceService.updateLabel(
        this.getUi(),
        comparedWithLabel
    ).then(function () {
        this.getUi().model().setLabel(comparedWithLabel);
        this.getUi().labelUpdateHandle();
    }.bind(this));
};

GraphElementController.prototype.expandCanDo = function () {
    return this.isSingle() && (
        this.getUi().canExpand.bind(this.getUi())() ||
        this.getUi().canExpandDescendants() ||
        this.getUi().isCollapsed
    );
};

GraphElementController.prototype.expand = function (avoidCenter, avoidExpandChild, isChildExpand) {
    let promise = this.expandDescendantsIfApplicable();
    return promise.then(() => {
        this.getUi().expand(avoidCenter);
        var expandChildCalls = [];
        this.getUi().visitClosestChildVertices(function (childVertex) {
            if (childVertex.model().hasOnlyOneHiddenChild()) {
                expandChildCalls.push(
                    childVertex.getController().expand(true, true, true)
                );
            }
        });
        return Promise.all(expandChildCalls);
    });
};

GraphElementController.prototype.expandDescendantsIfApplicable = function () {
    let promise = Promise.resolve();
    if (this.getUi().isCollapsed) {
        return promise;
    }
    if (!this.getUi().canExpandDescendants()) {
        return promise;
    }
    let addChildTreeActions = [];
    let avoidCenter = true;
    this.getUi().visitExpandableDescendants(function (expandableLeaf) {
        addChildTreeActions.push(
            expandableLeaf.getController().expand(avoidCenter)
        );
    });
    promise = Promise.all(addChildTreeActions);
    return promise;
};

GraphElementController.prototype.collapseCanDo = function () {
    return this.isSingle() && (
        (!this.model().isCenterBubble() && !this.model().isLeaf() && !this.model().isCollapsed) ||
        (this.model().isCenterBubble() && this.model().hasAnExpandedChild())
    );
};

GraphElementController.prototype.collapse = function () {
    this.model().defineScrollPosition();
    this.getUi().collapse();
    Vue.nextTick(() => {
        Scroll.goToGraphElement(this.model());
    })
};

GraphElementController.prototype.cutCanDo = function () {
    return this.isSingleAndOwned() && !this.getUi().isCenterBubble() && (
        undefined === bubbleCutClipboard || !this.getUi().isSameBubble(
            bubbleCutClipboard
        )
    );
};

GraphElementController.prototype.cut = function () {
    bubbleCutClipboard = this.getUi();
};

GraphElementController.prototype.pasteCanDo = function () {
    return this.isSingleAndOwned() && !MindMapInfo.isViewOnly() && bubbleCutClipboard !== undefined;
};

GraphElementController.prototype.paste = function (event) {
    document.execCommand('paste')
    if (bubbleCutClipboard === undefined) {
        this._pasteText(event);
    } else {
        this._pasteBubble();
    }
};

GraphElementController.prototype._pasteText = function (event) {
    let clipText = '';
    if (window.clipboardData) {
        clipText = window.clipboardData.getData('Text');
    } else if (typeof event === 'object' && event.clipboardData) {
        clipText = event.clipboardData.getData('text/plain');
    }
    let separator = "" === this.getUi().getLabel().trim() ?
        "" : " ";
    this.setLabel(
        this.model().getLabel() + separator + clipText
    );
    Vue.nextTick(() => {
        this.getUi().focus();
    });
};

GraphElementController.prototype._pasteBubble = function () {
    if (!bubbleCutClipboard.getController()._canMoveUnderParent(this.getUi())) {
        return;
    }
    bubbleCutClipboard.getController().moveUnderParent(
        this.getUi()
    );
    bubbleCutClipboard = undefined;
};

GraphElementController.prototype.moveUpOneStep = function () {
    let bubbleAbove = this.model().getUpBubble();
    if (bubbleAbove.isSameBubble(this.getUi())) {
        return Promise.resolve();
    }
    if (bubbleAbove.isVertex()) {
        bubbleAbove = bubbleAbove.getParentBubble();
    }
    let parentFork = this.model().getParentFork();
    let aboveParentFork = bubbleAbove.getParentFork();
    if (parentFork.isGroupRelation() && !parentFork.isSameBubble(aboveParentFork)) {
        return Promise.resolve();
    }
    if (!bubbleAbove.getParentVertex().isSameBubble(this.getUi().getParentVertex())) {
        return this.moveBelow(
            bubbleAbove
        );
    }
    return this.moveAbove(
        bubbleAbove
    );
};


GraphElementController.prototype.moveDownOneStep = function () {
    let bubbleUnder = this.model().getDownBubble();
    if (bubbleUnder.isSameBubble(this.model())) {
        return Promise.resolve();
    }
    if (bubbleUnder.isVertex()) {
        bubbleUnder = bubbleUnder.getParentBubble();
    }
    let parentFork = this.model().getParentFork();
    let belowParentFork = bubbleUnder.getParentFork();
    if (parentFork.isGroupRelation() && !parentFork.isSameBubble(belowParentFork)) {
        return Promise.resolve();
    }
    if (!bubbleUnder.getParentVertex().isSameBubble(this.getUi().getParentVertex())) {
        return this.moveAbove(
            bubbleUnder
        );
    }
    return this.moveBelow(
        bubbleUnder
    );
};

GraphElementController.prototype._canMoveAboveOrUnder = function (otherEdge) {
    let graphElementToCompare = this.getUi().isVertex() ?
        this.getUi().getParentBubble() :
        this.getUi();
    return !graphElementToCompare.isSameUri(otherEdge);
};

GraphElementController.prototype.moveBelow = function (otherEdge) {
    if (!this._canMoveAboveOrUnder(otherEdge)) {
        return Promise.resolve();
    }
    let previousParentVertex = this.getUi().getParentVertex();
    return this._moveTo(
        otherEdge,
        false,
        previousParentVertex
    );
};

GraphElementController.prototype.moveAbove = function (otherEdge) {
    if (!this._canMoveAboveOrUnder(otherEdge)) {
        return Promise.resolve();
    }
    let previousParentVertex = this.model().getParentVertex();
    return this._moveTo(
        otherEdge,
        true,
        previousParentVertex
    );
};

GraphElementController.prototype._canMoveUnderParent = function (parent, forceLeft) {
    let newParentIsSelf = this.getUi().getUri() === parent.getUri();
    if (newParentIsSelf) {
        return false;
    }
    let isParentVertex = this.getUi().getParentVertex().isSameBubble(parent);
    let isParentBubble = this.getUi().getParentBubble().isSameBubble(parent);
    if (isParentVertex || isParentBubble || this.getUi().isBubbleAChild(parent)) {
        if (forceLeft === true && !this.model().isToTheLeft()) {
            return true;
        }
        if (forceLeft === false && this.model().isToTheLeft()) {
            return true;
        }
        return false
    }
    return true;
};

GraphElementController.prototype.moveUnderParent = function (parent, forceLeft) {
    if (!this._canMoveUnderParent(parent, forceLeft)) {
        return Promise.resolve();
    }
    let previousParent;
    let moveUnderParentCommand = new Command.forExecuteUndoAndRedo(
        () => {
            previousParent = this.getUi().getParentVertex();
            return parent.getController().becomeParent(this.getUi(), forceLeft);
        },
        () => {
            return previousParent.getController().becomeParent(this.getUi());
        },
        () => {
            return parent.getController().becomeParent(this.getUi());
        }
    );
    return Command.executeCommand(
        moveUnderParentCommand
    );
};

GraphElementController.prototype._moveTo = function (otherEdge, isAbove, previousParentVertex) {
    let previousIndex = this.model().getIndexInTree();
    let moveToCommand = new Command.forExecuteUndoAndRedo(
        () => {
            return this._moveToExecute(otherEdge, isAbove, previousParentVertex);
        },
        () => {
            let childAtIndex = previousParentVertex.getChildAtIndex(previousIndex);
            if (!childAtIndex.isEdge()) {
                childAtIndex.getClosestChildrenOfType(GraphElementType.Relation)
            }
            return this._moveToExecute(
                childAtIndex,
                true,
                this.model().getParentVertex()
            );
        },() => {
            return this._moveToExecute(otherEdge, isAbove, previousParentVertex);
        },
    );
    return Command.executeCommand(
        moveToCommand
    );
};

GraphElementController.prototype._moveToExecute = function (otherEdge, isAbove, previousParentVertex) {
    let model = this.model();
    let movedEdge = model.isVertex() ?
        model.getParentBubble() :
        model;
    let promises = [];
    if (!otherEdge.getParentBubble().isSameUri(movedEdge.getParentBubble())) {
        promises.push(
            movedEdge.getParentBubble().getController().becomeExParent(movedEdge)
        );
    }
    if (isAbove) {
        model.moveAbove(otherEdge);
    } else {
        model.moveBelow(otherEdge);
    }
    let parentOfOtherBubble = otherEdge.getParentBubble();
    if (parentOfOtherBubble.isGroupRelation()) {
        let identification = parentOfOtherBubble.getIdentification();
        if (movedEdge.isGroupRelation()) {
            movedEdge.visitClosestChildRelations(function (relation) {
                promises.push(
                    relation.getController().addIdentification(
                        identification
                    )
                );
            });
        } else {
            promises.push(
                movedEdge.getController().addIdentification(
                    identification
                )
            );
        }
    }

    if (previousParentVertex.getUri() !== otherEdge.getParentVertex().getUri()) {
        if (movedEdge.isGroupRelation()) {
            movedEdge.expand();
            movedEdge.visitClosestChildRelations(function (relationUi) {
                promises.push(
                    relationUi.getController().replaceParentVertex(
                        otherEdge.getParentVertex()
                    )
                );
            });
        } else {
            promises.push(
                movedEdge.getController().replaceParentVertex(
                    otherEdge.getParentVertex()
                )
            );
        }
    }
    return Promise.all(promises).then(() => {
        GraphElementService.changeChildrenIndex(
            otherEdge.getParentVertex()
        );
        GraphElementService.changeChildrenIndex(
            previousParentVertex
        );
        Selection.setToSingle(model);
    });
};

GraphElementController.prototype.mergeCanDo = function () {
    return false;
};

GraphElementController.prototype.merge = function () {
    // if (!isMergePopoverBuilt) {
    //     this.getUi().getHtml().popoverLikeToolTip({
    //         animation: false,
    //         html: true,
    //         title: $('<div>').append($.t("merge.title"), $('<br>'), $("<small>").text($.t("merge.instruction"))),
    //         placement: 'auto left',
    //         container: '#drawn_graph',
    //         trigger: "manual",
    //         allowMultiplePopoverDisplayed: true,
    //         content: function () {
    //             return $("#merge-popover").html();
    //         }
    //     });
    // }
    // this.getUi().getHtml().popover("show").popover("show");
    // $('.popover-title').mousedown(function (event) {
    //     event.stopPropagation();
    // });
    // var searchInput = $('.popover').find("input").empty().mousedown(function (event) {
    //     event.stopPropagation();
    //     $(this).focus();
    // });
    // if (!searchInput.isMrAutocompleteSetup()) {
    //     var searchFetcher = this.getUi().isMeta() ?
    //         UserMapAutocompleteProvider.toFetchOwnTags :
    //         UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesExcept;
    //     searchInput.mrAutocomplete({
    //         select: function (event, ui) {
    //             event.preventDefault();
    //             if (event.keyCode === 13) {
    //                 return;
    //             }
    //             this.convertToDistantBubbleWithUri(ui.item.uri);
    //             this.setLabel(ui.item.label);
    //             this.getUi().getHtml().popover("hide");
    //         }.bind(this),
    //         resultsProviders: [
    //             searchFetcher(
    //                 this.getUi(),
    //                 {
    //                     noFilter: true,
    //                     additionalFilter: function (searchResults) {
    //                         return searchResults.filter(function (searchResult) {
    //                             return this.convertToDistantBubbleWithUriCanDo(
    //                                 searchResult.uri
    //                             );
    //                         }.bind(this));
    //                     }.bind(this)
    //                 }
    //             )
    //         ]
    //     });
    // }
    // searchInput.focus();
};

GraphElementController.prototype.becomeExParent = function () {
    return Promise.resolve();
};

GraphElementController.prototype.addIdentifiers = function (identifiers) {
    let promises = [];
    identifiers.forEach(function (identifier) {
        promises.push(this.addIdentification(identifier));
    }.bind(this));
    return Promise.all(promises);
};

GraphElementController.prototype.addIdentification = function (identifier) {
    if (this.model().hasIdentification(identifier)) {
        return Promise.resolve()
    }
    return TagService.add(
        this.model(),
        identifier
    ).then((identifications) => {
        return Promise.all(
            identifications.map((identifier) => {
                return identifier.getUrl();
            })
        ).then(() => {
            this.model().addIdentifications(
                identifications
            );
            return identifications;
        })
    });
};

GraphElementController.prototype.remove = function (skipConfirmation) {
    if (skipConfirmation) {
        return this.removeDo();
    }
    let selectedIsPristine = this.getUiArray().every((graphElement) => {
        return graphElement.isPristine();
    });
    if (selectedIsPristine) {
        return this.removeDo();
    }
    Store.dispatch("setIsRemoveFlow", true);
};

GraphElementController.prototype.removeDo = async function () {
    await this.isSingle() ?
        GraphElementService.remove(
            this.model()
        ) :
        GraphElementService.removeCollection(
            this.getModelArray()
        );
    let isCenterRemoved = this.getModelArray().some((bubble) => {
        return bubble.isCenter;
    });
    if (isCenterRemoved) {
        router.push(
            "/"
        );
        return;
    }
    let bubbleToSelect;
    if (this.isSingle()) {
        bubbleToSelect = this.model().getNextSibling();
        if (bubbleToSelect.isSameUri(this.model())) {
            bubbleToSelect = this.model().getParentFork();
        }
    }
    this.getModelArray().forEach(function (bubble) {
        bubble.remove();
    });
    if (bubbleToSelect) {
        Selection.setToSingle(bubbleToSelect);
    } else {
        Selection.removeAll();
    }
    if (this.isSingle()) {
        GraphElementService.changeChildrenIndex(this.model().getParentVertex());
    }
};

GraphElementController.prototype.removeIdentifier = function (identifier) {
    this.model().removeIdentifier(
        identifier
    );
    return new Promise((resolve) => {
        TagService.remove(
            this.model(),
            identifier
        ).then(() => {
            resolve();
            // this.getModel().applyToOtherInstances(function (otherUi) {
            //     otherUi.getModel().removeIdentifier(
            //         identifier
            //     );
            //     otherUi.removeIdentifier(identifier);
            // });
            // let eventBusKey = identificationBaseEventBusKey + "removed";
            // EventBus.publish(
            //     eventBusKey,
            //     [this.getModel(), identifier]
            // );
        });
    });
};
GraphElementController.prototype.selectTreeCanDo = function () {
    return this.isSingleAndOwned() && !this.model().isLeaf();
};

GraphElementController.prototype.selectTree = function () {
    this.getUi().selectTree();
};

GraphElementController.prototype.isSingleAndOwned = function () {
    return this.isSingle() && this.isOwned();
};

GraphElementController.prototype.isGroupAndOwned = function () {
    return !this.isSingle() && this.isOwned();
};

GraphElementController.prototype.isSingle = function () {
    return !(this.graphElements instanceof Array);
};
GraphElementController.prototype.isMultiple = function () {
    return !this.isSingle();
};
GraphElementController.prototype.isOwned = function () {
    return !MindMapInfo.isViewOnly();
};

GraphElementController.prototype.deselect = function () {
    if (this.isMultiple() || this.getUi().isCenterBubble()) {
        Selection.removeAll();
    }
};

GraphElementController.prototype.listManyIsPossible = true;

GraphElementController.prototype.listSingleIsPossible = false;

GraphElementController.prototype.listCanDo = function () {
    return this.isMultiple();
};

export default api;
