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
import Vue from 'vue'
import TagService from '@/identifier/TagService'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import EdgeService from '@/edge/EdgeService'
import Vertex from '@/vertex/Vertex'
import Edge from '@/edge/Edge'
import SubGraphController from '@/graph/SubGraphController'
import GraphDisplayer from '@/graph/GraphDisplayer'
import MetaRelation from "@/identifier/MetaRelation";
import Meta from "@/identifier/Meta";

const api = {};
let bubbleCutClipboard;

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
    Store.dispatch("labelRefresh");
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
    Store.dispatch("noteRefresh");
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

GraphElementController.prototype.addTagCanDo = function () {
    return this.isSingle() && this.isOwned();
};

GraphElementController.prototype.addTag = function () {
    Store.dispatch("setIsAddTagFlow", true);
    return Promise.resolve();
};

GraphElementController.prototype.showTagsCanDo = function () {
    return !this.model().areTagsShown && this.isSingle() && this.isOwned() && this.model().getTagsAndSelfIfRelevant().length > 0;
};

GraphElementController.prototype.showTags = function () {
    return this.expand(true, true).then(() => {
        this.model().getTagsAndSelfIfRelevant().sort((a, b) => {
            return b.getCreationDate() - a.getCreationDate();
        }).forEach((tag) => {
            this._addTagAsChild(tag);
        });
        this.model().areTagsShown = true;
        Store.dispatch("redraw");
    });
};

GraphElementController.prototype._addTagAsChild = function (tag) {
    let tagBubble = Meta.withUri(
        tag.getUri()
    );
    tagBubble.setLabel(tag.getLabel());
    tagBubble.setComment(tag.getComment());
    tagBubble.setImages(tag.getImages());
    tagBubble.setOriginalMeta(tag);
    CurrentSubGraph.get().add(tagBubble);
    let tagRelation = new MetaRelation(
        this.model().isVertexType() ? this.model() : this.model().getParentVertex(),
        tagBubble
    );
    this.model().addChild(
        tagRelation
    );
    CurrentSubGraph.get().add(tagRelation);
};

GraphElementController.prototype.hideTagsCanDo = function () {
    return this.model().areTagsShown;
};

GraphElementController.prototype.hideTags = function () {
    this.model().getNextChildren().forEach((child) => {
        if (child.isMetaRelation()) {
            child.remove();
        }
    });
    this.model().areTagsShown = false;
    Store.dispatch("redraw");
    return Promise.resolve();
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
        this.model().canExpand() ||
        this.model().canExpandDescendants()
    );
};

GraphElementController.prototype.expand = function (avoidCenter, avoidExpandChild) {
    let promise = avoidExpandChild ? Promise.resolve() : this.expandDescendantsIfApplicable();
    return promise.then(() => {
        this.model().expand(avoidCenter, true);
        const expandChildCalls = [];
        if (!avoidExpandChild) {
            this.model().visitClosestChildVertices(function (childVertex) {
                if (childVertex.getNumberOfChild() === 1) {
                    expandChildCalls.push(
                        childVertex.controller().expand(true, true, true)
                    );
                }
            });
        }
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
    let avoidCenter = true;
    return Promise.all(
        this.model().getExpandableDescendants().map((expandableLeaf) => {
            return expandableLeaf.controller().expand(avoidCenter);
        })
    );
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
    if (!bubbleCutClipboard.controller()._canMoveUnderParent(this.model())) {
        return;
    }
    bubbleCutClipboard.controller().moveUnderParent(
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
    if (this.model().isMeta()) {
        return false;
    }
    let graphElementToCompare = this.model().isVertex() ?
        this.model().getParentBubble() :
        this.model();
    return !graphElementToCompare.isSameUri(otherEdge);
};

GraphElementController.prototype.moveBelow = function (otherEdge) {
    if (otherEdge.isVertexType()) {
        otherEdge = otherEdge.getParentBubble();
    }
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
    if (otherEdge.isVertexType()) {
        otherEdge = otherEdge.getParentBubble();
    }
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
    if (this.model().isMeta()) {
        return false;
    }
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

GraphElementController.prototype.becomeParent = function (child) {
    return this.expand(true).then(() => {
        let children = this.model().getNextChildren();
        /*
            children length can only be zero for a vertex and one for an edge
            but this function 'becomeParent' is overriden for these types of bubbles
        */
        let lastChild = children[children.length - 1];
        return child.controller().moveBelow(lastChild);
    });
};

GraphElementController.prototype.moveUnderParent = function (parent, forceLeft) {
    if (!this._canMoveUnderParent(parent, forceLeft)) {
        return Promise.resolve();
    }
    let previousParent;
    let moveUnderParentCommand = new Command.forExecuteUndoAndRedo(
        () => {
            previousParent = this.model().getParentVertex();
            return parent.controller().becomeParent(this.model(), forceLeft);
        },
        () => {
            return previousParent.controller().becomeParent(this.model());
        },
        () => {
            return parent.controller().becomeParent(this.model());
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

GraphElementController.prototype._moveToExecute = async function (otherEdge, isAbove, previousParentVertex) {
    let model = this.model();
    let movedEdge = model.isVertexType() ?
        model.getParentBubble() :
        model;
    let promises = [];
    let parentOfOtherBubble = otherEdge.getParentBubble();
    if (!parentOfOtherBubble.isSameUri(movedEdge.getParentBubble())) {
        promises.push(
            movedEdge.getParentBubble().controller().becomeExParent(movedEdge)
        );
    }
    // if (parentOfOtherBubble.isMeta()) {
    //     return parentOfOtherBubble.controller().becomeParent(
    //         movedEdge,
    //         otherEdge.isToTheLeft(),
    //         otherEdge.getIndexInTree(isAbove)
    //     );
    // }
    if (isAbove) {
        model.moveAbove(otherEdge);
    } else {
        model.moveBelow(otherEdge);
    }
    otherEdge.getParentFork().refreshChildren(true);
    if (parentOfOtherBubble.isGroupRelation()) {
        let parentGroupRelation = parentOfOtherBubble;
        do {
            promises.push(
                movedEdge.controller().addIdentifiers(
                    parentGroupRelation.getIdentifiers(),
                    true
                )
            );
            parentGroupRelation = parentGroupRelation.getParentBubble();
        } while (parentGroupRelation.isGroupRelation());
    }
    let parentVertex = otherEdge.getParentVertex();
    if (!parentVertex.isMeta() && previousParentVertex.getUri() !== parentVertex.getUri()) {
        promises.push(
            movedEdge.controller().replaceParentVertex(
                otherEdge.getParentVertex(),
                true
            )
        );
    }
    return Promise.all(promises).then(() => {
        GraphElementService.changeChildrenIndex(
            parentVertex
        );
        if (previousParentVertex.getUri() !== parentVertex.getUri()) {
            GraphElementService.changeChildrenIndex(
                previousParentVertex
            );
        }
        //I don't know why I have to Selection.reset() to select the same bubble.
        Selection.removeAll();
        Selection.setToSingle(model);
        return this.model();
    });
};

GraphElementController.prototype.mergeCanDo = function () {
    return false;
};

GraphElementController.prototype.becomeExParent = function () {
    return Promise.resolve();
};

GraphElementController.prototype.addIdentifiers = function () {
    return this.addIdentificationCanDo();
};

GraphElementController.prototype.addIdentifiers = function (identifiers, preventMoving) {
    let promises = [];
    identifiers.forEach((identifier) => {
        promises.push(this.addIdentification(identifier, preventMoving));
    });
    return Promise.all(promises);
};

GraphElementController.prototype.addIdentificationCanDo = function () {
    return true;
};

GraphElementController.prototype.addIdentification = function (identifier, preventMoving, force) {
    if (this.model().hasIdentification(identifier) && !force) {
        return Promise.resolve([identifier])
    }
    if (!preventMoving) {
        let siblingWithSameIdentifier = this.model().getParentFork().getNextChildren().filter((sibling) => {
            return sibling.hasIdentification(identifier) && sibling.getId() !== this.model().getId()
        });
        if (siblingWithSameIdentifier.length) {
            return this.moveUnderParent(siblingWithSameIdentifier[0]).then((groupRelation) => {
                Selection.setToSingle(groupRelation);
                return groupRelation.getIdentifiers();
            });
        }
    }
    return TagService.add(
        this.model(),
        identifier
    ).then((identifications) => {
        return Promise.all(
            identifications.map((identifier) => {
                return identifier.buildExternalUrls();
            })
        ).then(() => {
            identifications.forEach((tag) => {
                if (this.model().hasIdentification(tag)) {
                    this.model().getIdentifierHavingExternalUri(tag.getExternalResourceUri()).setUri(
                        tag.getUri()
                    )
                }
            });
            this.model().addIdentifications(
                identifications
            );
            this.model().refreshImages();
            this.model().refreshButtons();
            if (this.model().areTagsShown) {
                identifications.forEach((tag) => {
                    this._addTagAsChild(tag);
                });
            }
            return identifications;
        })
    });
};

GraphElementController.prototype.relateToDistantVertexWithUri = function (distantVertexUri, index, isLeft, identifiers) {
    let distantVertex;
    let parentVertex = this.model().isVertexType() ? this.model() : this.model().getParentVertex();
    SubGraphController.withVertex(
        Vertex.withUri(
            distantVertexUri
        )
    ).loadNonCenter().then((_distantVertex) => {
        distantVertex = _distantVertex;
        return EdgeService.createFromSourceAndDestinationUri(parentVertex.getUri(), distantVertexUri);
    }).then((newEdgeUri) => {
        let newEdge = Edge.withUriAndSourceAndDestinationVertex(
            newEdgeUri,
            parentVertex,
            distantVertex
        );
        if (identifiers) {
            newEdge.controller().addIdentifiers(identifiers, true)
        }
        distantVertex.parentBubble = newEdge;
        distantVertex.parentVertex = parentVertex;
        this.model().addChild(
            newEdge,
            isLeft,
            index
        );
        CurrentSubGraph.get().add(
            newEdge
        );
        this.model().refreshChildren();
        Vue.nextTick(() => {
            Selection.setToSingle(distantVertex);
            GraphElementService.changeChildrenIndex(
                parentVertex
            );
            Store.dispatch("redraw");
        });
    });
};

GraphElementController.prototype.remove = function (skipConfirmation) {
    if (skipConfirmation === true) {
        return this.removeDo();
    }
    let selectedIsPristine = this.getUiArray().every((graphElement) => {
        return graphElement.isPristine() && (!graphElement.isForkType() || graphElement.getNumberOfChild() === 0);
    });
    if (selectedIsPristine) {
        return this.removeDo();
    }
    Store.dispatch("setIsRemoveFlow", true);
};

GraphElementController.prototype.removeDo = async function (skipSelect) {
    let graphElements = this.getModelArray().filter((selected) => {
        return selected.controller().removeCanDo();
    });
    if (graphElements.length === 0) {
        return Promise.resolve();
    }
    await this.isSingle() ?
        GraphElementService.remove(
            this.model()
        ) :
        GraphElementService.removeCollection(
            graphElements
        );

    let isCenterRemoved = graphElements.some((bubble) => {
        return bubble.isCenter;
    });
    if (isCenterRemoved) {
        router.push(
            "/"
        );
        return;
    }
    let bubbleToSelect;
    if (this.isSingle() && !skipSelect) {
        bubbleToSelect = this.model().getNextSibling();
        if (bubbleToSelect.isSameUri(this.model())) {
            bubbleToSelect = this.model().getParentFork();
        }
    }
    graphElements.forEach(function (bubble) {
        bubble.getDescendants().forEach((bubble) => {
            if (bubble.isVertex()) {
                CurrentSubGraph.get().removeVertex(bubble);
            } else if (bubble.isEdge()) {
                CurrentSubGraph.get().removeEdge(bubble);
            }
        });
        bubble.remove();
        if (bubble.isVertex()) {
            CurrentSubGraph.get().removeVertex(bubble);
        } else if (bubble.isEdge()) {
            CurrentSubGraph.get().removeEdge(bubble);
        }
        bubble.getDuplicates().forEach((duplicate) => {
            duplicate.remove();
            if (bubble.isVertex()) {
                CurrentSubGraph.get().removeVertex(bubble);
            } else if (bubble.isEdge()) {
                CurrentSubGraph.get().removeEdge(bubble);
            }
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
    Vue.nextTick(() => {
        Store.dispatch("redraw");
    });

};

GraphElementController.prototype.removeIdentifier = function (identifier, preventMoving) {
    if (!this.model().hasIdentification(identifier)) {
        return Promise.resolve();
    }
    this.model().removeIdentifier(
        identifier
    );
    let parentBubble = this.model().getParentBubble();
    if (!preventMoving && parentBubble.isGroupRelation()) {
        const groupRelation = parentBubble.getGroupRelationInSequenceWithTag(identifier);
        if (groupRelation) {
            this.moveBelow(groupRelation);
        }
    }
    return new Promise((resolve) => {
        TagService.remove(
            this.model().getUri(),
            identifier
        ).then(() => {
            resolve();
            this.model().getDuplicates().forEach((duplicate) => {
                duplicate.removeIdentifier(identifier);
            });
            this.model().refreshImages();
            this.model().refreshButtons();
            if (this.model().areTagsShown === true) {
                this.model().getNextChildren().forEach((child) => {
                    if (child.isMetaRelation()) {
                        let meta = child.getNextBubble();
                        if (meta.getOriginalMeta().getExternalResourceUri() === identifier.getExternalResourceUri()) {
                            child.remove();
                        }
                    }
                });
            }
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

GraphElementController.prototype.setShareLevel = function () {
    Store.dispatch("setSideMenuFlow", 3);
    return Promise.resolve();
};

GraphElementController.prototype.setShareLevelCanDo = function () {
    return this.getModelArray().some((model) => {
        return model.isVertex() && model.controller().setShareLevelCanDo();
    });
};

GraphElementController.prototype.makePublic = function () {
    return GraphDisplayer.getVertexMenuHandler().fromDifferentGraphElements(
        this.getModelArray()
    ).makePublic();
};

GraphElementController.prototype.makePublicCanDo = function () {
    if (this.isSingle()) {
        return false;
    }
    const atLeastOneSelectedVertex = this.getModelArray().some((model) => {
        return model.isVertex();
    });
    if (!atLeastOneSelectedVertex) {
        return false;
    }
    return this.getModelArray().every((model) => {
        return !model.isVertex() || (
            model.isVertex() && model.controller().makePublicCanDo()
        );
    });
};

GraphElementController.prototype.makePrivate = function () {
    return GraphDisplayer.getVertexMenuHandler().fromDifferentGraphElements(
        this.getModelArray()
    ).makePrivate();
};

GraphElementController.prototype.makePrivateCanDo = function () {
    if (this.isSingle()) {
        return false;
    }
    const atLeastOneSelectedVertex = this.getModelArray().some((model) => {
        return model.isVertex();
    });
    if (!atLeastOneSelectedVertex) {
        return false;
    }
    return this.getModelArray().every((model) => {
        return !model.isVertex() || (
            model.isVertex() && model.controller().makePrivateCanDo()
        );
    });
};


export default api;
