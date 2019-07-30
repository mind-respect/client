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
    this.model().setLabel(
        newLabel
    );
    this.model().getDuplicates().forEach((duplicate) => {
        duplicate.setLabel(newLabel)
    });
    return FriendlyResourceService.updateLabel(
        this.model(),
        newLabel
    );
};

GraphElementController.prototype.note = function () {
    Store.dispatch("setIsDescriptionFlow", true);
};

GraphElementController.prototype.noteDo = function (note) {
    this.model().setComment(
        note
    );
    this.model().getDuplicates().forEach((duplicate) => {
        duplicate.setComment(note)
    });
    return GraphElementService.updateNote(
        this.model()
    ).then(() => {
        Store.dispatch("redraw");
    });
};

GraphElementController.prototype.focusCanDo = function () {
    return this.isOwned() && this.isSingle();
};

GraphElementController.prototype.focus = function () {
    this.model().focus();
};

GraphElementController.prototype.travelLeft = function () {
    this.model().travelLeft();
};

GraphElementController.prototype.travelRight = function () {
    this.model().travelRight();
};

GraphElementController.prototype.travelUp = function () {
    this.model().travelUp();
};

GraphElementController.prototype.travelDown = function () {
    this.model().travelDown();
};


GraphElementController.prototype.centerCanDo = function () {
    return this.isSingle() && !this.model().isCenterBubble();
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
    let comparedWithLabel = this.model().getComparedWith().getLabel();
    return FriendlyResourceService.updateLabel(
        this.model(),
        comparedWithLabel
    ).then(function () {
        this.model().setLabel(comparedWithLabel);
        this.model().labelUpdateHandle();
    }.bind(this));
};

GraphElementController.prototype.expandCanDo = function () {
    return this.isSingle() && (
        this.model().canExpand.bind(this.model())() ||
        this.model().canExpandDescendants() ||
        this.model().isCollapsed
    );
};

GraphElementController.prototype.expand = function (avoidCenter, avoidExpandChild, isChildExpand) {
    let promise = this.expandDescendantsIfApplicable();
    return promise.then(() => {
        this.model().expand(avoidCenter);
        var expandChildCalls = [];
        this.model().visitClosestChildVertices(function (childVertex) {
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
    if (this.model().isCollapsed) {
        return promise;
    }
    if (!this.model().canExpandDescendants()) {
        return promise;
    }
    let addChildTreeActions = [];
    let avoidCenter = true;
    this.model().visitExpandableDescendants(function (expandableLeaf) {
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
    this.model().collapse();
    Vue.nextTick(() => {
        Scroll.goToGraphElement(this.model());
    })
};

GraphElementController.prototype.cutCanDo = function () {
    return this.isSingleAndOwned() && !this.model().isCenterBubble() && (
        undefined === bubbleCutClipboard || !this.model().isSameBubble(
            bubbleCutClipboard
        )
    );
};

GraphElementController.prototype.cut = function () {
    bubbleCutClipboard = this.model();
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
    let separator = "" === this.model().getLabel().trim() ?
        "" : " ";
    this.setLabel(
        this.model().getLabel() + separator + clipText
    );
    Vue.nextTick(() => {
        this.model().focus();
    });
};

GraphElementController.prototype._pasteBubble = function () {
    if (!bubbleCutClipboard.getController()._canMoveUnderParent(this.model())) {
        return;
    }
    bubbleCutClipboard.getController().moveUnderParent(
        this.model()
    );
    bubbleCutClipboard = undefined;
};

GraphElementController.prototype.moveUpOneStep = function () {
    let bubbleAbove = this.model().getUpBubble();
    if (bubbleAbove.isSameBubble(this.model())) {
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
    if (!bubbleAbove.getParentVertex().isSameBubble(this.model().getParentVertex())) {
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
    if (!bubbleUnder.getParentVertex().isSameBubble(this.model().getParentVertex())) {
        return this.moveAbove(
            bubbleUnder
        );
    }
    return this.moveBelow(
        bubbleUnder
    );
};

GraphElementController.prototype._canMoveAboveOrUnder = function (otherEdge) {
    let graphElementToCompare = this.model().isVertex() ?
        this.model().getParentBubble() :
        this.model();
    return !graphElementToCompare.isSameUri(otherEdge);
};

GraphElementController.prototype.moveBelow = function (otherEdge) {
    if (!this._canMoveAboveOrUnder(otherEdge)) {
        return Promise.resolve();
    }
    let previousParentVertex = this.model().getParentVertex();
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
    let newParentIsSelf = this.model().getUri() === parent.getUri();
    if (newParentIsSelf) {
        return false;
    }
    let isParentVertex = this.model().getParentVertex().isSameBubble(parent);
    let isParentBubble = this.model().getParentBubble().isSameBubble(parent);
    if (isParentVertex || isParentBubble || this.model().isBubbleAChild(parent)) {
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
            previousParent = this.model().getParentVertex();
            return parent.getController().becomeParent(this.model(), forceLeft);
        },
        () => {
            return previousParent.getController().becomeParent(this.model());
        },
        () => {
            return parent.getController().becomeParent(this.model());
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
        //I don't know why I have to Selection.reset() to select the same bubble.
        Selection.reset();
        Selection.setToSingle(model);
    });
};

GraphElementController.prototype.mergeCanDo = function () {
    return false;
};

GraphElementController.prototype.becomeExParent = function () {
    return Promise.resolve();
};

GraphElementController.prototype.addIdentifiers = function (identifiers) {
    let promises = [];
    identifiers.forEach((identifier) => {
        promises.push(this.addIdentification(identifier));
    });
    return Promise.all(promises);
};

GraphElementController.prototype.addIdentification = function (identifier, force) {
    if (this.model().hasIdentification(identifier) && !force) {
        return Promise.resolve([identifier])
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
    if (skipConfirmation === true) {
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
    let selection = this.getModelArray().filter((selected) => {
        return selected.getController().removeCanDo();
    });
    if (selection.length === 0) {
        return Promise.resolve();
    }
    await this.isSingle() ?
        GraphElementService.remove(
            this.model()
        ) :
        GraphElementService.removeCollection(
            selection
        );

    let isCenterRemoved = selection.some((bubble) => {
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
    selection.forEach(function (bubble) {
        bubble.remove();
        bubble.getDuplicates().forEach((duplicate) => {
            duplicate.remove();
        });
    });
    if (bubbleToSelect) {
        Selection.setToSingle(bubbleToSelect);
    } else {
        Selection.removeAll();
    }
    if (this.isSingle()) {
        GraphElementService.changeChildrenIndex(this.model().getParentVertex());
    }
    Store.dispatch("redraw");
};

GraphElementController.prototype.removeIdentifier = function (identifier) {
    this.model().removeIdentifier(
        identifier
    );
    return new Promise((resolve) => {
        TagService.remove(
            this.model().getUri(),
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
    this.model().selectTree();
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
    if (this.isMultiple() || this.model().isCenterBubble()) {
        Selection.removeAll();
    }
};

GraphElementController.prototype.listManyIsPossible = true;

GraphElementController.prototype.listSingleIsPossible = false;

GraphElementController.prototype.listCanDo = function () {
    return this.isMultiple();
};

export default api;
