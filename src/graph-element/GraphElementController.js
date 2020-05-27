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
import TagService from '@/tag/TagService'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import RelationService from '@/relation/RelationService'
import Vertex from '@/vertex/Vertex'
import Relation from '@/relation/Relation'
import SubGraphController from '@/graph/SubGraphController'
import TagRelation from "@/tag/TagRelation";
import TagVertex from "@/tag/TagVertex";
import Scroll from "../Scroll";
import ShareLevel from '@/vertex/ShareLevel'
import NbNeighborsRefresherOnRemove from "./NbNeighborsRefresherOnRemove";
import NbNeighborsRefresherOnSetShareLevel from './NbNeighborsRefresherOnSetShareLevel'
import LoadingFlow from "../LoadingFlow";
import ForkService from "../fork/ForkService";

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
    return this.isSingle() && !this.model().isCenterBubble() && (!Store.state.isPatternFlow || this.model().isMeta());
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
    return (!this.model().areTagsShown || this.model().isCollapsed) && this.isSingle() && this.isOwned() && this.model().getTagsAndSelfIfRelevant().length > 0;
};

GraphElementController.prototype.showTags = function () {
    if (this.model().areTagsShown && this.model().isCollapsed) {
        return this.expand(true, true);
    }
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

GraphElementController.prototype.setColorCanDo = function () {
    return this.isOwned() && this.isSingle() && !this.model().isRelation();
};

GraphElementController.prototype.setColor = function () {
    Store.dispatch("setIsColorFlow", true);
};

GraphElementController.prototype.setBackgroundColor = function (backgroundColor) {
    let model = this.model().isGroupRelation() ? this.model().getIdentification() : this.model();
    model.setBackgroundColor(backgroundColor);
    return GraphElementService.saveColors(
        model.getUri(),
        model.getColors()
    );
};

GraphElementController.prototype._addTagAsChild = function (tag) {
    let tagBubble = TagVertex.withUri(
        tag.getUri()
    );
    CurrentSubGraph.get().add(tagBubble);
    tagBubble.setOriginalMeta(tag);
    let tagRelation = new TagRelation(
        this.model().isForkType() ? this.model() : this.model().getParentFork(),
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

GraphElementController.prototype.hideTags = async function () {
    let children = this.model().getNextChildren();
    let l = children.length;
    while (l--) {
        let child = children[l];
        if (child.isMetaRelation()) {
            child.remove();
        }
    }
    this.model().areTagsShown = false;
    Store.dispatch("redraw");
    await Vue.nextTick();
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


GraphElementController.prototype.collapseOthersCanDo = function () {
    return this.isSingle() && !this.model().isCenter && this.model().isForkType();
};


GraphElementController.prototype.collapseOthers = function () {
    let ancestorsId = new Set();
    let selfId = this.model().getId();
    this.model().getAncestors().forEach((ancestor) => {
        if (!ancestor.isForkType()) {
            return;
        }
        ancestorsId.add(ancestor.getId());
        ancestor.getNextChildren().forEach((ancestorChild) => {
            if (!ancestorChild.isForkType()) {
                ancestorChild = ancestorChild.getNextBubble();
            }
            if (!ancestorsId.has(ancestorChild.getId()) && ancestorChild.getId() !== selfId && !ancestorChild.isCenter) {
                ancestorChild.collapse(true);
            }
        });
    });
    this.model().refreshChildren().then(() => {
        Scroll.centerBubbleForTreeIfApplicable(this.model());
    });
    return Promise.resolve();
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

GraphElementController.prototype.moveCompletelyUpCanDo = GraphElementController.prototype.moveCompletelyDownCanDo = GraphElementController.prototype.moveUpOneStepCanDo = GraphElementController.prototype.moveDownOneStepCanDo = function () {
    return this.isSingle() && this.isOwned() && !this.model().getParentVertex().isMetaGroupVertex();
};

GraphElementController.prototype.moveCompletelyUp = function () {
    let topMostBubble = this.model().getParentFork().getNextBubble(this.model().isToTheLeft());
    if (topMostBubble.isSameBubble(this.model()) || topMostBubble.isSameBubble(this.model().getParentBubble())) {
        return Promise.resolve();
    }
    if (topMostBubble.isVertex()) {
        topMostBubble = topMostBubble.getParentBubble();
    }
    return this.moveAbove(
        topMostBubble
    );
};

GraphElementController.prototype.moveCompletelyDown = function () {
    let parentFork = this.model().getParentFork();
    let bottomMostBubble = parentFork.getNextBottomBubble(this.model().isToTheLeft());
    if (bottomMostBubble.isSameBubble(this.model()) || bottomMostBubble.isSameBubble(this.model().getParentBubble())) {
        return Promise.resolve();
    }
    if (bottomMostBubble.isVertex()) {
        bottomMostBubble = bottomMostBubble.getParentBubble();
    }
    return this.moveBelow(
        bottomMostBubble
    );
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
    return this._moveTo(
        otherEdge,
        false,
        this.model().getParentFork()
    );
};

GraphElementController.prototype.moveAbove = function (otherEdge, preventAnimation) {
    if (otherEdge.isVertexType()) {
        otherEdge = otherEdge.getParentBubble();
    }
    if (!this._canMoveAboveOrUnder(otherEdge)) {
        return Promise.resolve();
    }
    return this._moveTo(
        otherEdge,
        true,
        this.model().getParentFork(),
        preventAnimation
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
    return this.expand(true, true).then(() => {
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

GraphElementController.prototype._moveTo = function (otherEdge, isAbove, previousParentFork, preventAnimation) {
    let previousIndex = this.model().getIndexInTree();
    let moveToCommand = new Command.forExecuteUndoAndRedo(
        () => {
            return this._moveToExecute(otherEdge, isAbove, previousParentFork, preventAnimation);
        },
        () => {
            let childAtIndex = previousParentFork.getChildAtIndex(previousIndex);
            if (!childAtIndex.isEdge()) {
                childAtIndex.getClosestChildrenOfType(GraphElementType.Relation)
            }
            return this._moveToExecute(
                childAtIndex,
                true,
                this.model().getParentVertex(),
                preventAnimation
            );
        },
    );
    return Command.executeCommand(
        moveToCommand
    );
};

GraphElementController.prototype._moveToExecute = async function (otherEdge, isAbove, previousParentFork, preventAnimation) {
    let model = this.model();
    let movedEdge = model.isVertexType() ?
        model.getParentBubble() :
        model;
    let promises = [];
    let parentOfOtherBubble = otherEdge.getParentBubble();
    let previousParentBubble = movedEdge.getParentBubble();
    // if (parentOfOtherBubble.isMeta()) {
    //     return parentOfOtherBubble.controller().becomeParent(
    //         movedEdge,
    //         otherEdge.isToTheLeft(),
    //         otherEdge.getIndexInTree(isAbove)
    //     );
    // }
    if (isAbove) {
        await model.moveAbove(otherEdge, preventAnimation);
    } else {
        await model.moveBelow(otherEdge, preventAnimation);
    }
    otherEdge.getParentFork().refreshChildren(true);
    let parentFork = otherEdge.getParentFork();
    if (!parentFork.isMeta() && previousParentFork.getUri() !== parentFork.getUri()) {
        promises.push(
            movedEdge.controller().replaceParentFork(
                parentFork,
                true
            )
        );
    }
    return Promise.all(promises).then(async () => {
        if (!parentOfOtherBubble.isSameUri(previousParentBubble)) {
            await previousParentBubble.controller().becomeExParent(movedEdge, otherEdge);
        }
        GraphElementService.changeChildrenIndex(
            parentFork
        );
        if (previousParentFork.getUri() !== parentFork.getUri()) {
            GraphElementService.changeChildrenIndex(
                previousParentFork
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

GraphElementController.prototype.addIdentifiersCanDo = function () {
    return this.addIdentificationCanDo();
};

GraphElementController.prototype.addIdentifiers = function (identifiers) {
    let promises = [];
    identifiers.forEach((identifier) => {
        promises.push(this.addIdentification(identifier));
    });
    return Promise.all(promises).then((arraysOfTags) => {
        return [].concat.apply([], arraysOfTags)
    });
};

GraphElementController.prototype.addIdentificationCanDo = function () {
    return true;
};

GraphElementController.prototype.addIdentification = function (tag, force) {
    if (this.model().hasIdentification(tag) && !force) {
        return Promise.resolve([tag])
    }
    return TagService.add(
        this.model(),
        tag
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
    }).catch(() => {
        this.model().removeTag(tag);
    });
};

GraphElementController.prototype.relateToDistantVertexWithUriCanDo = function (distantVertexUri) {
    return this.model().getSurround(true).every((child) => {
        return child.getUri() !== distantVertexUri && child.getNextBubble().getUri() !== distantVertexUri;
    });
};

GraphElementController.prototype.relateToDistantVertexWithUri = async function (distantVertexUri, index, isLeft, destinationShareLevel, identifiers) {
    let parentFork = this.model().isForkType() ? this.model() : this.model().getParentFork();
    let distantVertex = await SubGraphController.withVertex(
        Vertex.withUri(
            distantVertexUri
        )
    ).loadNonCenter();
    let newEdgeUri = await RelationService.createFromSourceAndDestinationUri(
        parentFork.getUri(),
        distantVertexUri,
        parentFork.getShareLevel(),
        destinationShareLevel
    );
    let newEdge = Relation.withUriAndSourceAndDestinationVertex(
        newEdgeUri,
        parentFork,
        distantVertex
    );
    if (identifiers) {
        newEdge.controller().addIdentifiers(identifiers);
    }
    distantVertex.parentBubble = newEdge;
    distantVertex.parentVertex = this.model().isVertexType() ? this.model() : this.model().getParentVertex();
    this.model().addChild(
        newEdge,
        isLeft,
        index
    );
    CurrentSubGraph.get().add(
        newEdge
    );
    await Vue.nextTick();
    Selection.setToSingle(distantVertex);
    this.model().refreshChildren();
    GraphElementService.changeChildrenIndex(
        parentFork
    );
    return newEdge;
};

GraphElementController.prototype.remove = function (skipConfirmation) {
    if (skipConfirmation === true) {
        return this.removeDo();
    }
    let selectedIsPristine = this.getUiArray().every((graphElement) => {
        return graphElement.isPristine() && (graphElement.getNumberOfChild() === 0);
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
        ForkService.removeCollection(
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
    let parentForksUri = new Set();
    let nbNeighborsRefresherOnRemove = NbNeighborsRefresherOnRemove.withGraphElements(graphElements);
    nbNeighborsRefresherOnRemove.prepare();
    graphElements.forEach((graphElement) => {
        let parentFork = graphElement.getParentFork();
        parentForksUri.add(parentFork.getUri());
        graphElement.remove();
    });
    nbNeighborsRefresherOnRemove.execute();
    let currentSubGraph = CurrentSubGraph.get();
    await Promise.all(Array.from(parentForksUri).map(async (parentForkUri) => {
        let parentFork = currentSubGraph.getHavingUri(parentForkUri);
        if (parentFork) {
            let toSelectFromBecomeEx = await parentFork.controller().becomeExParent();
            if (toSelectFromBecomeEx) {
                bubbleToSelect = toSelectFromBecomeEx;
            }
        }
    }));
    if (bubbleToSelect) {
        Selection.setToSingle(bubbleToSelect);
    } else {
        Selection.removeAll();
    }
    if (this.isSingle()) {
        GraphElementService.changeChildrenIndex(this.model().getParentFork());
    }
    Vue.nextTick(() => {
        Store.dispatch("redraw");
    });
    return bubbleToSelect;
};

GraphElementController.prototype.removeTag = async function (tag) {
    if (!this.model().hasIdentification(tag)) {
        return Promise.resolve();
    }
    this.model().removeTag(
        tag
    );
    let parentBubble = this.model().getParentBubble();
    return new Promise((resolve) => {
        TagService.remove(
            this.model().getUri(),
            tag
        ).then(() => {
            resolve();
            this.model().getDuplicates().forEach((duplicate) => {
                duplicate.removeTag(tag);
            });
            this.model().refreshImages();
            this.model().refreshButtons();
            if (this.model().areTagsShown === true) {
                this.model().getNextChildren().forEach((child) => {
                    if (child.isMetaRelation()) {
                        let meta = child.getNextBubble();
                        if (meta.getOriginalMeta().getExternalResourceUri() === tag.getExternalResourceUri()) {
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
    Store.dispatch("setSideMenuFlow", 1);
    return Promise.resolve();
};

GraphElementController.prototype.setShareLevelCanDo = function () {
    return !Store.state.isPatternFlow && this.isOwned() && this.getModelArray().some((model) => {
        return model.canChangeShareLevel();
    });
};

GraphElementController.prototype.setShareLevelDo = async function (shareLevel) {
    let graphElementsToUpdate = this.getUiArray().filter((bubble) => {
        return bubble.canChangeShareLevel() && bubble.getShareLevel() !== shareLevel.toUpperCase()
    });
    if (graphElementsToUpdate.length === 0) {
        return Promise.resolve();
    }
    let isInLoadingFlow = false;
    let nbNeighborsRefresherOnSetShareLevel = NbNeighborsRefresherOnSetShareLevel.withGraphElements(
        graphElementsToUpdate
    );
    nbNeighborsRefresherOnSetShareLevel.prepare();
    graphElementsToUpdate.forEach((bubble) => {
        bubble.getSurround(true).forEach((surround) => {
            let otherFork = surround.isEdge() ? surround.getOtherVertex(bubble) : bubble;
            otherFork.getNbNeighbors().decrementForShareLevel(bubble.getShareLevel());
            otherFork.getNbNeighbors().incrementForShareLevel(shareLevel);
        });
        bubble.getIdentifiers().forEach((tag) => {
            tag.getNbNeighbors().decrementForShareLevel(bubble.getShareLevel());
            tag.getNbNeighbors().incrementForShareLevel(shareLevel);
        });
        bubble.setShareLevel(shareLevel);
        bubble.refreshButtons();
    });
    Store.dispatch("shareRefresh");
    if (isInLoadingFlow) {
        LoadingFlow.leave();
    }
    await this.isMultiple() ?
        ForkService.setCollectionShareLevel(
            shareLevel, graphElementsToUpdate
        ) : GraphElementService.setShareLevel(
        shareLevel, this.model()
        );
    nbNeighborsRefresherOnSetShareLevel.execute();
};

GraphElementController.prototype._areAllElementsPublicWithLink = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.PUBLIC_WITH_LINK
    ]);
};

GraphElementController.prototype._areAllElementsPublic = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.PUBLIC_WITH_LINK,
        ShareLevel.PUBLIC
    ]);
};

GraphElementController.prototype._areAllElementsPrivate = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.PRIVATE
    ]);
};

GraphElementController.prototype._areAllElementsFriendsOnly = function () {
    return this._areAllElementsInShareLevels([
        ShareLevel.FRIENDS
    ]);
};

GraphElementController.prototype._areAllElementsInShareLevels = function (shareLevels) {
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

export default api;
