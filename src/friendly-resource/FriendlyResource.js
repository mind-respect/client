/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Image from '@/image/Image'
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'
import Focus from '@/Focus'
import Selection from '@/Selection'
import Store from '@/store'
import Icon from '@/Icon'
import Scroll from '@/Scroll'
import Vue from 'vue'
import GraphUi from '@/graph/GraphUi'
import CurrentSubGraph from "@/graph/CurrentSubGraph";
import UiUtils from '@/UiUtils'
import Color from '@/Color'
import colors from 'vuetify/es5/util/colors'
import KeyboardActions from '@/KeyboardActions'
import GraphElement from "../graph-element/GraphElement";

const MoveRelation = {
    "Parent": "parent",
    "After": "after",
    "Before": "before"
};

const FriendlyResource = {
    fromServerFormat: function (serverFormat) {
        return new FriendlyResource.FriendlyResource().init(serverFormat);
    },
    clone: function (friendlyResource) {
        return FriendlyResource.fromServerFormat({
            uri: friendlyResource.getUri(),
            label: friendlyResource.getLabel(),
            comment: friendlyResource.getComment(),
            colors: friendlyResource.getColors()
        });
    },
    buildObjectWithUri: function (uri) {
        return {
            uri: uri,
            label: ""
        };
    },
    buildServerFormatFromUi: function (friendlyResourceUi) {
        return {
            uri: friendlyResourceUi.getUri(),
            label: friendlyResourceUi.text(),
            comment: friendlyResourceUi.model().getComment()
        };
    },
    buildObjectWithUriAndLabel: function (uri, label) {
        return {
            uri: uri,
            label: label
        };
    },
    buildObjectWithUriLabelAndDescription: function (uri, label, description) {
        return {
            uri: uri,
            label: label,
            comment: description
        };
    },
    buildObjectWithUriLabelDescriptionAndImages: function (uri, label, description, images) {
        return {
            uri: uri,
            label: label,
            comment: description,
            images: images
        };
    },
    withUri: function (uri) {
        return FriendlyResource.withUriAndLabel(
            uri,
            ""
        );
    },
    withUriAndLabel: function (uri, label) {
        return FriendlyResource.fromServerFormat(
            FriendlyResource.buildObjectWithUriAndLabel(uri, label)
        );
    },
    withUriLabelAndDescription: function (uri, label, description) {
        return FriendlyResource.fromServerFormat(
            FriendlyResource.buildObjectWithUriLabelAndDescription(uri, label, description)
        );
    }
};

FriendlyResource.FriendlyResource = function () {
};


FriendlyResource.FriendlyResource.prototype.setColors = function (colors) {
    if (colors && typeof colors === 'string') {
        this._friendlyResourceServerFormat.colors = JSON.parse(
            colors
        );
    } else {
        this._friendlyResourceServerFormat.colors = colors || {
            background: Color.DEFAULT_BACKGROUND_COLOR
        }
    }
};

FriendlyResource.FriendlyResource.prototype.getColors = function () {
    if (!this._friendlyResourceServerFormat.colors) {
        this._friendlyResourceServerFormat.colors = {};
    }
    return this._friendlyResourceServerFormat.colors;
};

FriendlyResource.FriendlyResource.prototype.setBackgroundColor = function (backgroundColor) {
    return this.getColors().background = backgroundColor;
};

FriendlyResource.FriendlyResource.prototype.getBackgroundColor = function (resolve, forceRefresh) {
    let backgroundColor;
    if (resolve && this.resolvedBackgroundColor && !forceRefresh) {
        backgroundColor = this.resolvedBackgroundColor;
    } else if (resolve) {
        backgroundColor = this.resolvedBackgroundColor = this.resolveBackgroundColor();
    } else {
        backgroundColor = this.getColors().background;
    }
    return backgroundColor || Color.DEFAULT_BACKGROUND_COLOR;
};

FriendlyResource.FriendlyResource.prototype.isChipBackgroundColorDefined = function (resolve) {
    return this.getChipBackgroundColor(resolve) !== colors.indigo.darken4;
};

FriendlyResource.FriendlyResource.prototype.getChipBackgroundColor = function (resolve, forceRefresh) {
    let backgroundColor = this.getBackgroundColor(resolve, forceRefresh);
    return backgroundColor === Color.DEFAULT_BACKGROUND_COLOR ?
        colors.indigo.darken4 :
        backgroundColor;
};

FriendlyResource.FriendlyResource.prototype.shouldShowChipIcon = function (isPatternFlow) {
    return !this.isMeta() && ((this.isPattern() && !isPatternFlow) || !this.isVertex());
};

FriendlyResource.FriendlyResource.prototype.resolveBackgroundColor = function () {
    if (this.isRelation() || this.isMeta()) {
        if (this.isMeta()) {
            let parentVertex = this.getParentVertex();
            if (!this.isCenter && (!parentVertex.isBackgroundColorDefined() || this.getBackgroundColor() === parentVertex.getBackgroundColor())) {
                return Color.DEFAULT_BACKGROUND_COLOR;
            }
        } else {
            return Color.DEFAULT_BACKGROUND_COLOR;
        }
    }
    let backgroundColor = this.getBackgroundColor();
    if (!this.isBackgroundColorDefined()) {
        let tagsWithColors = this.getRelevantTags().filter((tag) => {
            let parentBubble = this.getParentBubble();
            let parentVertex = this.getParentVertex();
            if (parentBubble.isGroupRelation() && parentBubble.getGroupRelationInSequenceWithTag(tag)) {
                return false;
            } else if (parentVertex.isMeta() && parentVertex.getOriginalMeta().getUri() === tag.getUri()) {
                return false;
            } else {
                return tag.isBackgroundColorDefined() && (!CurrentSubGraph.get() || tag.getUri() !== CurrentSubGraph.get().center.getUri());
            }
        });
        if (tagsWithColors.length) {
            backgroundColor = tagsWithColors[0].getColors().background;
        } else {
            return Color.DEFAULT_BACKGROUND_COLOR;
        }
    }
    return backgroundColor
};

FriendlyResource.FriendlyResource.prototype.isBackgroundColorDefined = function () {
    return this.getBackgroundColor() !== Color.DEFAULT_BACKGROUND_COLOR;
};

FriendlyResource.FriendlyResource.prototype.getId = function () {
    return this.uiId;
};

FriendlyResource.FriendlyResource.prototype.isSameUri = function (bubble) {
    return this.getUri() === bubble.getUri();
};

FriendlyResource.FriendlyResource.prototype.isSameBubble = function (bubble) {
    if (!bubble) {
        return false;
    }
    return this.getId() === bubble.getId();
};

FriendlyResource.FriendlyResource.prototype.isBubbleAChild = function (bubble) {
    let isAChild = false;
    this.visitDescendants(function (child) {
        if (child.getId() === bubble.getId()) {
            isAChild = true;
        }
    });
    return isAChild;
};

FriendlyResource.FriendlyResource.prototype.getHtml = function () {
    let html = document.getElementById(this.uiId);
    if (!html) {
        console.warn("no html found for bubble " + this.getLabel())
        return;
    }
    return html;
};

FriendlyResource.FriendlyResource.prototype.getLabelHtml = function () {
    let html = this.getHtml();
    if (html) {
        return html.querySelectorAll('.bubble-label')[0];
    }
};

FriendlyResource.FriendlyResource.prototype.focus = function (event) {
    return new Promise((resolve) => {
        /*
            KeyboardActions.disable(); because problems happened when adding sibling and then pressing spacebar really quickly
       */
        KeyboardActions.disable();
        GraphUi.disableDragScroll();
        let interval;
        if (!focus.bind(this)()) {
            interval = setInterval(focus.bind(this), 100);
        }

        function focus() {
            setTimeout(() => {
                let labelHtml = this.getLabelHtml();
                if (!labelHtml) {
                    return false;
                }
                if (interval) {
                    clearInterval(interval);
                }
                labelHtml.contentEditable = "true";
                this.preventLeaveEditFlow = true;
                if (event) {
                    this.lastEvent = event;
                    Focus.focusAtPosition(event, labelHtml);
                } else {
                    Focus.focusEnd(labelHtml);
                }
                KeyboardActions.enable();
                resolve();
            });
            return true;
        }
    });
};

FriendlyResource.FriendlyResource.prototype.refocus = function () {
    if (this.lastEvent) {
        Focus.focusAtPosition(this.lastEvent, this.getLabelHtml());
    }
    this.lastEvent = false;
};


FriendlyResource.FriendlyResource.prototype.setLabel = function (label) {
    if (this.isLabelSameAsParentGroupRelation()) {
        label = "";
    }
    this._friendlyResourceServerFormat.label = label.trim().replace(
        /&nbsp;\\*/g, ''
    ).replace(
        /<br>\\*/g, ''
    );
};

FriendlyResource.FriendlyResource.prototype.getLabel = FriendlyResource.FriendlyResource.prototype.text = function () {
    return this._friendlyResourceServerFormat.label;
};

FriendlyResource.FriendlyResource.prototype.getLabelOrDefault = function () {
    return this.isLabelEmpty() ?
        this.getWhenEmptyLabel() :
        this.getLabel();
};

FriendlyResource.FriendlyResource.prototype.isLabelEmpty = function () {
    return this.getLabel().trim() === "";
};

FriendlyResource.FriendlyResource.prototype.isCenterBubble = function () {
    return this.isCenter;
};

FriendlyResource.FriendlyResource.prototype.getParentBubble = function () {
    return this.parentBubble || this;
};

FriendlyResource.FriendlyResource.prototype.getComment = function () {
    return this._friendlyResourceServerFormat.comment.trim();
};
FriendlyResource.FriendlyResource.prototype.setComment = function (comment) {
    return this._friendlyResourceServerFormat.comment = comment;
};
FriendlyResource.FriendlyResource.prototype.hasComment = function () {
    return this.getComment() !== '';
};
FriendlyResource.FriendlyResource.prototype.addImage = function (image) {
    this._images.push(image);
};
FriendlyResource.FriendlyResource.prototype.getImage = function () {
    return this._images[0]
};
FriendlyResource.FriendlyResource.prototype.setImages = function (images) {
    this._images = images;
};
FriendlyResource.FriendlyResource.prototype.getImages = function () {
    return this._images;
};
FriendlyResource.FriendlyResource.prototype.hasImages = function () {
    return this._images.length > 0;
};
FriendlyResource.FriendlyResource.prototype.setUri = function (uri) {
    this._friendlyResourceServerFormat.uri = uri;
    this.uriFacade = new IdUri.IdUri(
        this.getUri()
    );
};
FriendlyResource.FriendlyResource.prototype.getUri = function () {
    return decodeURIComponent(
        this._friendlyResourceServerFormat.uri
    );
};

FriendlyResource.FriendlyResource.prototype.uri = function () {
    return this.uriFacade
};
FriendlyResource.FriendlyResource.prototype.isSame = function (friendlyResource) {
    return this.getUri() === friendlyResource.getUri();
};

FriendlyResource.FriendlyResource.prototype.updateGraphElementType = function () {
    let graphElementType = this.getGraphElementType ? this.getGraphElementType() : IdUri.getGraphElementTypeFromUri(
        this.getUri()
    );
    this.type = Object.freeze(
        new GraphElementType.GraphElementType(graphElementType)
    );
};

//@deprecated
FriendlyResource.FriendlyResource.prototype.isVertex = function () {
    return this.type.isVertex();
};

//@deprecated
FriendlyResource.FriendlyResource.prototype.isEdge = function () {
    return this.type.isEdge();
};

//@deprecated
FriendlyResource.FriendlyResource.prototype.isRelation = function () {
    return this.type.isRelation();
};

//@deprecated
FriendlyResource.FriendlyResource.prototype.isGroupRelation = function () {
    return this.type.isGroupRelation();
};

//@deprecated
FriendlyResource.FriendlyResource.prototype.isMeta = function () {
    return this.type.isMeta();
};

FriendlyResource.FriendlyResource.prototype.isMetaRelation = function () {
    return this.type.isMetaRelation();
};

FriendlyResource.FriendlyResource.prototype.isMetaGroupVertex = function () {
    return this.type.isMetaGroupVertex();
};

//@deprecated
FriendlyResource.FriendlyResource.prototype.isVertexType = function () {
    return this.type.isVertexType();
};

FriendlyResource.FriendlyResource.prototype.isEdgeType = function () {
    return this.type.isEdgeType();
};

FriendlyResource.FriendlyResource.prototype.isForkType = function () {
    return this.isInTypes(GraphElementType.Fork)
};

FriendlyResource.FriendlyResource.prototype.select = function () {
    this.isSelected = true;
    this.refreshContent();
};

FriendlyResource.FriendlyResource.prototype.deselect = function () {
    this.blur();
    this.isSelected = false;
    this.refreshContent();
    if (this.redrawOnLeaveEdit) {
        Vue.nextTick().then(() => {
            Store.dispatch("redraw")
        });
        this.redrawOnLeaveEdit = false;
    }
};

FriendlyResource.FriendlyResource.prototype.blur = function () {
    let label = this.getLabelHtml();
    if (label) {
        label.blur();
    }
};

FriendlyResource.FriendlyResource.prototype.selectTree = function () {
    Selection.removeAll();
    Selection.setSelected(
        [this].concat(
            this.getDescendants().filter((bubble) => {
                return bubble.isInTypes([
                    GraphElementType.Vertex,
                    GraphElementType.GroupRelation
                ]);
            })
        )
    );
};

FriendlyResource.FriendlyResource.prototype.isToTheLeft = function () {
    return this.direction === "left";
};

FriendlyResource.FriendlyResource.prototype.makeLeft = function () {
    this.direction = "left";
};

FriendlyResource.FriendlyResource.prototype.makeRight = function () {
    this.direction = "right";
};

FriendlyResource.FriendlyResource.prototype.beforeExpand = function () {
    this.loading = true;
    this.defineScrollPosition();
    // this.draw = false
    // Vue.nextTick(function () {
    // Store.dispatch("redraw")
    // }.bind(this))
};

FriendlyResource.FriendlyResource.prototype.defineScrollPosition = function () {
    let html = this.getHtml();
    if (!html) {
        return;
    }
    this.scrollRect = html.getBoundingClientRect();
};

FriendlyResource.FriendlyResource.prototype.isScrollPositionDefined = function () {
    return this.scrollRect !== undefined;
};

FriendlyResource.FriendlyResource.prototype.resetScrollPosition = function () {
    delete this.scrollRect;
};


FriendlyResource.FriendlyResource.prototype.isInTypes = function (types) {
    return types.indexOf(this.getGraphElementType()) > -1;
};

FriendlyResource.FriendlyResource.prototype.travelLeft = function () {
    Selection.setToSingle(this.getLeftBubble(), true)
};

FriendlyResource.FriendlyResource.prototype.travelRight = function () {
    Selection.setToSingle(this.getRightBubble(), true)
};

FriendlyResource.FriendlyResource.prototype.travelDown = function () {
    Selection.setToSingle(this.getDownBubble(true), true)
};

FriendlyResource.FriendlyResource.prototype.travelUp = function () {
    Selection.setToSingle(this.getUpBubble(true), true)
};

FriendlyResource.FriendlyResource.prototype.getUpBubble = function (isForTravel) {
    return this._getUpOrDownBubble(false, isForTravel);
};
FriendlyResource.FriendlyResource.prototype.getDownBubble = function (isForTravel) {
    return this._getUpOrDownBubble(true, isForTravel);
};

FriendlyResource.FriendlyResource.prototype.getNextSibling = function () {
    let downBubble = this.getDownBubble();
    let upBubble = this.getUpBubble();
    if (downBubble && !downBubble.isCenter && !downBubble.isSameBubble(this) && downBubble.getParentFork().isSame(this.getParentFork())) {
        return downBubble;
    } else if (upBubble && !upBubble.isCenter && !upBubble.isSameBubble(this) && upBubble.getParentFork().isSame(this.getParentFork())) {
        return upBubble;
    } else {
        return this.getParentFork();
    }
};

FriendlyResource.FriendlyResource.prototype.canExpand = function () {
    if (this.isExpanded === undefined) {
        this.isExpanded = this.getNumberOfChild(undefined, true) === 0;
    }
    let nbChild = this.getNumberOfChild();
    return !this.isCenter && !this.isExpanded && nbChild > 0;
};

FriendlyResource.FriendlyResource.prototype.areDuplicatesExpanded = function () {
    return this.getExpandedDuplicates().length > 0;
};

FriendlyResource.FriendlyResource.prototype.getExpandedDuplicates = function () {
    return this.getDuplicates().filter((duplicate) => {
        return duplicate.isExpanded;
    });
};

FriendlyResource.FriendlyResource.prototype.getDuplicates = function () {
    return [];
};

FriendlyResource.FriendlyResource.prototype.moveTo = async function (otherBubble, relation, preventAnimation, forceLeft) {
    if (this.isForkType() && !this.isGroupRelation()) {
        return this.getParentBubble().moveTo(
            otherBubble,
            relation
        );
    }
    // const centerCoordinates = UiUtils.getCenterOffsetCoordinates(
    //     CurrentSubGraph.get().center
    // );
    const firstBoxes = UiUtils.buildElementsAnimationData(
        CurrentSubGraph.get().getGraphElements()
    );
    if (MoveRelation.Parent === relation) {
        this.getParentBubble().removeChild(this, false, true);
        this.setParentFork(
            otherBubble.isForkType() ? otherBubble : otherBubble.getParentFork()
        );
        otherBubble.addChild(this, forceLeft);
    } else {
        let parentFork = this.getParentFork();
        let otherParentFork = otherBubble.getParentFork();
        let isTemporaryRemove = parentFork.isSameBubble(otherParentFork);
        parentFork.removeChild(this, isTemporaryRemove, true);
        this.direction = otherBubble.direction;
        let index = otherParentFork.getChildIndex(otherBubble, MoveRelation.Before === relation);
        this.setParentFork(
            otherParentFork
        );
        otherParentFork.addChild(
            this,
            otherBubble.isToTheLeft(),
            index
        );
    }
    this.getDescendantsEvenIfCollapsed().forEach((descendant) => {
        descendant.direction = this.direction;
    });
    if (preventAnimation) {
        return;
    }
    UiUtils.isInAnimation = true;
    await Vue.nextTick();
    await UiUtils.animateGraphElementsWithAnimationData(
        CurrentSubGraph.get().getGraphElements(),
        firstBoxes
    );
    await Store.dispatch("redraw");
    setTimeout(() => {
        // let closestChildVertex = this.isExpanded ? this.getClosestChildrenOfType(GraphElementType.Vertex)[0] : this;
        // if (Scroll.isBubbleTreeFullyOnScreen(closestChildVertex)) {
        //     const afterOffset = UiUtils.getCenterOffsetCoordinates(CurrentSubGraph.get().center);
        //     const deltaX = afterOffset.x - centerCoordinates.x;
        //     const deltaY = afterOffset.y - centerCoordinates.y;
        //     document.scrollingElement.style['scroll-behavior'] = 'smooth';
        //     document.scrollingElement.scrollLeft = document.scrollingElement.scrollLeft + deltaX;
        //     document.scrollingElement.scrollTop = document.scrollingElement.scrollTop + deltaY;
        //     document.scrollingElement.style['scroll-behavior'] = 'inherit';
        // } else {
        //     Scroll.centerBubbleForTreeIfApplicable(closestChildVertex);
        // }
        CurrentSubGraph.get().getGraphElements().forEach((graphElement) => {
            graphElement.draw = true;
        });
        // Store.dispatch("redraw");
        //this.refreshChildren() so that it also redraws after 250ms
        this.refreshChildren();
    }, 500);
};

FriendlyResource.FriendlyResource.prototype.revertIdentificationIntegration = function (identifier) {
    identifier.getImages().forEach((image) => {
        this.removeImage(image);
    });
};

FriendlyResource.FriendlyResource.prototype.moveToParent = function (parent, preventAnimation, forceLeft) {
    return this.moveTo(
        parent,
        MoveRelation.Parent,
        preventAnimation,
        forceLeft
    );
};
FriendlyResource.FriendlyResource.prototype.moveAbove = function (newSibling, preventAnimation) {
    return this.moveTo(
        newSibling,
        MoveRelation.Before,
        preventAnimation
    );
};
FriendlyResource.FriendlyResource.prototype.moveBelow = function (newSibling, preventAnimation) {
    return this.moveTo(
        newSibling,
        MoveRelation.After,
        preventAnimation
    );
};

FriendlyResource.FriendlyResource.prototype._getUpOrDownBubble = function (isDown, isForTravel) {
    if (this.isCenter) {
        return this;
    }
    if (isForTravel === undefined) {
        isForTravel = false;
    }
    let indexAdjust = isDown ? 1 : -1;
    let forkBubble = this.getParentBubble();
    let childBubble = this;
    let distance = 0;
    let forkBubbleNbChild = forkBubble.getNextChildren(this.isToTheLeft()).length;
    let childBubbleIndex = forkBubble.getChildIndex(childBubble);
    while (!forkBubble.isCenter && (forkBubbleNbChild < 2 || (isDown && (childBubbleIndex + 1) === forkBubbleNbChild) || (!isDown && childBubbleIndex === 0))) {
        distance++;
        childBubble = forkBubble;
        forkBubble = forkBubble.getParentBubble();
        forkBubbleNbChild = forkBubble.getNextChildren(this.isToTheLeft()).length;
        childBubbleIndex = Math.max(
            forkBubble.getChildIndex(childBubble),
            0
        );
        if (forkBubble.isGroupRelation()) {
            distance++;
        }
    }
    let indexInForkBubble = forkBubble.getChildIndex(childBubble);
    if (indexInForkBubble + indexAdjust >= forkBubbleNbChild) {
        return this;
    }
    let bubbleAround = forkBubble.getChildAtIndex(
        Math.max(indexInForkBubble + indexAdjust, 0),
        this.isToTheLeft()
    );
    distance--;
    while (distance > 0) {
        distance--;
        bubbleAround = isDown ? bubbleAround.getNextBubble() : bubbleAround.getNextBottomBubble();
    }
    if (this.isVertexType()) {
        if (bubbleAround.isEdgeType()) {
            bubbleAround = bubbleAround.getNextBubble();
        }
        if (bubbleAround.isGroupRelation()) {
            if (bubbleAround.canExpand() || !isForTravel) {
                return bubbleAround;
            }
            let closestVertices = bubbleAround.getClosestChildrenInTypes(GraphElementType.getVertexTypes());
            bubbleAround = isDown ? closestVertices[0] : closestVertices[closestVertices.length - 1];
        }
    }
    if (this.isEdgeType()) {
        if (bubbleAround.isVertexType()) {
            bubbleAround = isDown ? bubbleAround.getNextBubble() : bubbleAround.getNextBottomBubble();
        }
        if (bubbleAround.isGroupRelation()) {
            if (bubbleAround.canExpand() || !isForTravel) {
                return bubbleAround;
            }
            let closestEdges = bubbleAround.getClosestChildrenInTypes(GraphElementType.getEdgeTypes());
            bubbleAround = isDown ? closestEdges[0] : closestEdges[closestEdges.length - 1];
        }
    }
    return bubbleAround;
};

FriendlyResource.FriendlyResource.prototype.replaceChild = function (existingChild, newChild) {
    let index = this.getChildIndex(existingChild);
    this.removeChild(existingChild, true);
    this.addChild(
        newChild,
        existingChild.isToTheLeft(),
        index,
        true
    );
};

FriendlyResource.FriendlyResource.prototype.getChildIndex = function (child, isToGoAbove) {
    let foundIndex = -1;
    let children = this.getNextChildren(child.isToTheLeft());
    for (let i = 0; i < children.length; i++) {
        let childAtIndex = children[i];
        if (childAtIndex.getGraphElementType() === child.getGraphElementType()) {
            if (childAtIndex.getId() === child.getId()) {
                foundIndex = i;
            }
        } else {
            let childrenOfType = childAtIndex.getClosestChildrenOfType(child.getGraphElementType());
            let hasChild = childrenOfType.some((deepChild) => {
                return deepChild.getId() === child.getId();
            });
            if (hasChild) {
                foundIndex = i;
            }
        }
    }
    return isToGoAbove === false ? foundIndex + 1 : foundIndex;
};

FriendlyResource.FriendlyResource.prototype.getChildAtIndex = function (index, isToTheLeft) {
    let foundChild;
    let children = this.getNextChildren(isToTheLeft);
    for (let i = 0; i < children.length; i++) {
        if (index === i) {
            foundChild = children[i];
        }
    }
    return foundChild;
};


FriendlyResource.FriendlyResource.prototype.getNextBottomBubble = function (isLeft) {
    return this._getNextBubble(true, isLeft);
};

FriendlyResource.FriendlyResource.prototype.getNextBubble = function (isLeft) {
    return this._getNextBubble(false, isLeft);
};

FriendlyResource.FriendlyResource.prototype._getNextBubble = function (bottom, isLeft) {
    if (isLeft === undefined) {
        isLeft = this.isToTheLeft();
    }
    let nextBubble = isLeft ? this.getLeftBubble(bottom) : this.getRightBubble(bottom);
    if (!nextBubble) {
        return this;
    }
    return nextBubble;
};

FriendlyResource.FriendlyResource.prototype.expand = function (avoidCenter, isFirstExpand) {
    if (!isFirstExpand && !this.isCenter && !this.canExpand()) {
        return;
    }
    this.loading = false;
    this.isExpanded = true;
    this.isCollapsed = false;
    if (Store.state.isShowTags) {
        this.controller().showTags();
    }
    if (avoidCenter !== true) {
        Vue.nextTick(() => {
            setTimeout(() => {
                Scroll.centerBubbleForTreeIfApplicable(this);
            }, 100);
        })
    }
};

FriendlyResource.FriendlyResource.prototype.getIsExpanded = function () {
    return this.isExpanded;
};

FriendlyResource.FriendlyResource.prototype.collapse = function (preventScroll, preventApplyToDescendants) {
    this.isExpanded = false;
    this.isCollapsed = true;
    if (!preventApplyToDescendants) {
        this.getDescendantsEvenIfCollapsed().forEach((descendant) => {
            if (descendant.isForkType()) {
                descendant.collapse(true, true);
            }
        });
    }
    if (!preventScroll) {
        Scroll.centerBubbleForTreeIfApplicable(this);
        this.refreshChildren();
    }
};

FriendlyResource.FriendlyResource.prototype.canExpandDescendants = function () {
    return this.getDescendants().some((descendant) => {
        return descendant.canExpand() && !descendant.areDuplicatesExpanded();
    });
};

FriendlyResource.FriendlyResource.prototype.getExpandableDescendants = function () {
    return this.getDescendants().filter((descendant) => {
        return descendant.canExpand() && !descendant.areDuplicatesExpanded();
    });
};

FriendlyResource.FriendlyResource.prototype.getDescendantsEvenIfCollapsed = function (toTheLeft, filter) {
    return this.getDescendants(
        toTheLeft,
        filter,
        true
    );
};

FriendlyResource.FriendlyResource.prototype.getDescendants = function (toTheLeft, filter, evenIfCollapsed) {
    const children = evenIfCollapsed ? this.getNextChildrenEvenIfCollapsed(toTheLeft) : this.getNextChildren(toTheLeft);
    return children.reduce((children, child) => {
        if (filter && !filter(child)) {
            return children;
        }
        children.push(child);
        if ((evenIfCollapsed && child.isAbsoluteLeaf()) || (!evenIfCollapsed && child.isLeaf())) {
            return children;
        } else {
            return children.concat(child.getDescendants(toTheLeft, filter, evenIfCollapsed));
        }
    }, []);
};

FriendlyResource.FriendlyResource.prototype.getAncestors = function () {
    let parentBubble = this.getParentBubble();
    if (parentBubble.getUri() === this.getUri()) {
        return [];
    }
    return [
        parentBubble
    ].concat(parentBubble.getAncestors());
};

FriendlyResource.FriendlyResource.prototype.visitDescendants = function (visitor) {
    this.visitAllImmediateChild(function (child) {
        visitor(child);
        return child.visitDescendants(
            visitor
        );
    });
};

FriendlyResource.FriendlyResource.prototype.isLeaf = function () {
    return this.getNextChildren().length === 0;
};

FriendlyResource.FriendlyResource.prototype.isAbsoluteLeaf = function () {
    return this.getNextChildrenEvenIfCollapsed().length === 0;
};

FriendlyResource.FriendlyResource.prototype.getIndexInTree = function (isToGoAbove) {
    return this.getParentFork().getChildIndex(this, isToGoAbove);
};

FriendlyResource.FriendlyResource.prototype.getParentFork = function () {
    return this.getClosestAncestorInTypes(GraphElementType.Fork);
};

FriendlyResource.FriendlyResource.prototype.getClosestAncestorInTypes = function (types) {
    let parentBubble = this.getParentBubble();
    if (this.isSameBubble(parentBubble)) {
        return this;
    }
    if (parentBubble.isInTypes(types)) {
        return parentBubble;
    }
    let ancestor = parentBubble.getClosestAncestorInTypes(types);
    return ancestor.isInTypes(types) ?
        ancestor :
        this;
};

FriendlyResource.FriendlyResource.prototype.hasAnExpandedChild = function () {
    return this.getDescendants().some((descendant) => {
        if (descendant.isInTypes([GraphElementType.Vertex, GraphElementType.GroupRelation])) {
            return descendant.getNumberOfChild() > 0 && descendant.isExpanded;
        }
        return false;
    });
};

FriendlyResource.FriendlyResource.prototype.getClosestChildVertices = function () {
    return this.getClosestChildrenOfType(
        GraphElementType.Vertex
    );
};

FriendlyResource.FriendlyResource.prototype.visitClosestChildVertices = function (visitor) {
    this.visitClosestChildOfType(
        GraphElementType.Vertex,
        visitor
    );
};
FriendlyResource.FriendlyResource.prototype.visitClosestChildRelations = function (visitor) {
    this.visitClosestChildOfType(
        GraphElementType.Relation,
        visitor
    );
};

FriendlyResource.FriendlyResource.prototype.getClosestChildRelations = function (getEventIfCollapsed) {
    return this.getClosestChildrenOfType(
        GraphElementType.Relation,
        getEventIfCollapsed
    );
};


FriendlyResource.FriendlyResource.prototype.getClosestChildrenOfType = function (type, getEventIfCollapsed) {
    return this.getClosestChildrenInTypes(
        [type],
        getEventIfCollapsed
    );
};

FriendlyResource.FriendlyResource.prototype.visitClosestChildOfType = function (type, visitor) {
    return this.visitClosestChildInTypes(
        [type],
        visitor
    );
};

FriendlyResource.FriendlyResource.prototype.getClosestChildrenInTypes = function (types, getEvenIfCollapsed) {
    let children = getEvenIfCollapsed ? this.getNextChildrenEvenIfCollapsed() : this.getNextChildren();
    return children.reduce((children, child) => {
        if (child.isInTypes(types)) {
            children.push(child)
        } else if (child.isLeaf()) {
            return [];
        } else {
            let childOfRightType = child.getClosestChildrenInTypes(
                types,
                getEvenIfCollapsed
            );
            if (childOfRightType) {
                return children.concat(childOfRightType);
            }
        }
        return children;
    }, []);
};

FriendlyResource.FriendlyResource.prototype.visitClosestChildInTypes = function (types, visitor) {
    this.visitAllImmediateChild(function (child) {
        if (child.isInTypes(types)) {
            return visitor(child);
        } else {
            return child.visitClosestChildInTypes(
                types,
                visitor
            );
        }
    });
};

FriendlyResource.FriendlyResource.prototype.visitAllImmediateChild = function (visitor) {
    this.getNextChildren().filter((child) => {
        return !child.loading;
    }).forEach(function (child) {
        visitor(child);
    });
};

FriendlyResource.FriendlyResource.prototype.getDeepestDescendant = function () {
    if (this.isLeaf() || this.isCollapsed) {
        return this;
    }
    let depths = this.getDescendantsDepths();
    let highestDepth = Object.keys(
        depths
    ).sort((a, b) => {
        return b - a;
    })[0];
    return depths[highestDepth].sort((a, b) => {
        return b.getLabel().length - a.getLabel().length;
    })[0];
};

FriendlyResource.FriendlyResource.prototype.getDescendantsDepths = function (depth, depths) {
    depth = depth || 0;
    depths = depths || {};
    depth++;
    this.getNextChildren().forEach((child) => {
        if (!depths[depth]) {
            depths[depth] = [];
        }
        depths[depth].push(child);
        if (!child.isLeaf()) {
            child.getDescendantsDepths(depth, depths);
        }
    });
    return depths;
};


FriendlyResource.FriendlyResource.prototype.getJsonFormat = function () {
    var serverFormat = this.getServerFormat();
    serverFormat.images = this.getImagesServerFormat();
    return serverFormat;
};

FriendlyResource.FriendlyResource.prototype.getImagesServerFormat = function () {
    return Image.arrayToServerJson(
        this._images
    );
};

FriendlyResource.FriendlyResource.prototype.cloneOwnServerFormat = function () {
    this._friendlyResourceServerFormat = FriendlyResource.clone(
        this
    )._friendlyResourceServerFormat;
};

/*
* @deprecated
*/
FriendlyResource.FriendlyResource.prototype.getServerFormat = function () {
    return this._friendlyResourceServerFormat;
};

FriendlyResource.FriendlyResource.prototype.getFriendlyJson = function () {
    return this._friendlyResourceServerFormat;
};

FriendlyResource.FriendlyResource.prototype.getCreationDate = function () {
    return this._friendlyResourceServerFormat.creationDate === undefined ?
        new Date() :
        new Date(
            this._friendlyResourceServerFormat.creationDate
        );
};

FriendlyResource.FriendlyResource.prototype._buildImages = function () {
    return undefined === this._friendlyResourceServerFormat.images ?
        [] :
        Image.arrayFromServerJson(
            this._friendlyResourceServerFormat.images
        );
};

FriendlyResource.FriendlyResource.prototype.model = function () {
    return this;
};

FriendlyResource.FriendlyResource.prototype.getParentVertex = function () {
    return this.parentVertex || this;
};

FriendlyResource.FriendlyResource.prototype.getIcon = function () {
    return Icon.getForGraphElement(this);
};

FriendlyResource.FriendlyResource.prototype.getChipIcon = function (isPatternFlow) {
    return this.isPattern() && !isPatternFlow ? "stars" : this.getIcon();
};

FriendlyResource.FriendlyResource.prototype.init = function (friendlyResourceServerFormat) {
    this._friendlyResourceServerFormat = friendlyResourceServerFormat;
    this.draw = true;
    this._images = this._buildImages();
    if (friendlyResourceServerFormat.comment === undefined) {
        friendlyResourceServerFormat.comment = "";
    }
    if (friendlyResourceServerFormat.label === undefined) {
        this._friendlyResourceServerFormat.label = "";
    }
    this.uiId = IdUri.uuid();
    this.uriFacade = new IdUri.IdUri(
        this.getUri()
    );
    this.loading = true;
    this.isExpanded = false;
    this.isCollapsed = false;
    this.isSelected = false;
    this.updateGraphElementType();
    this.setColors(this._friendlyResourceServerFormat.colors);
    return this;
};
export default FriendlyResource;
