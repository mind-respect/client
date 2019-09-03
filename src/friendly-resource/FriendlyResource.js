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
            comment: friendlyResource.getComment()
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
    let labelHtml = this.getLabelHtml();
    labelHtml.contentEditable = "true";
    setTimeout(() => {
        if (event) {
            Focus.focusAtPosition(event, labelHtml);
        } else {
            Focus.focusEnd(labelHtml);
        }
    })
};

FriendlyResource.FriendlyResource.prototype.setLabel = function (label) {
    this.friendlyResourceServerFormat.label = label;
};

FriendlyResource.FriendlyResource.prototype.getLabel = FriendlyResource.FriendlyResource.prototype.text = function () {
    return this.friendlyResourceServerFormat.label;
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
    return this.parentBubble;
};

FriendlyResource.FriendlyResource.prototype.hasChildren = function () {
    return this.getNextChildren().length > 0;
};

FriendlyResource.FriendlyResource.prototype.getComment = function () {
    return this.friendlyResourceServerFormat.comment.trim();
};
FriendlyResource.FriendlyResource.prototype.setComment = function (comment) {
    return this.friendlyResourceServerFormat.comment = comment;
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
FriendlyResource.FriendlyResource.prototype.getImages = function () {
    return this._images;
};
FriendlyResource.FriendlyResource.prototype.hasImages = function () {
    return this._images.length > 0;
};
FriendlyResource.FriendlyResource.prototype.setUri = function (uri) {
    this.friendlyResourceServerFormat.uri = uri;
    this.uriFacade = new IdUri.IdUri(
        this.getUri()
    );
};
FriendlyResource.FriendlyResource.prototype.getUri = function () {
    return decodeURIComponent(
        this.friendlyResourceServerFormat.uri
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

FriendlyResource.FriendlyResource.prototype.select = function () {
    this.isSelected = true;
};

FriendlyResource.FriendlyResource.prototype.deselect = function () {
    this.blur();
    this.isSelected = false;
};

FriendlyResource.FriendlyResource.prototype.blur = function () {
    let label = this.getLabelHtml();
    if (label) {
        label.blur();
    }
};

FriendlyResource.FriendlyResource.prototype.selectTree = function () {
    Selection.removeAll();
    let selected = [];
    selected.push(this);
    this.getDescendants().forEach((descendant) => {
        if (descendant.isVertex()) {
            selected.push(
                descendant
            );
        }
    });
    Selection.setSelected(selected);
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
    Selection.setToSingle(this.getLeftBubble())
};

FriendlyResource.FriendlyResource.prototype.travelRight = function () {
    Selection.setToSingle(this.getRightBubble())
};

FriendlyResource.FriendlyResource.prototype.travelDown = function () {
    Selection.setToSingle(this.getDownBubble(true))
};

FriendlyResource.FriendlyResource.prototype.travelUp = function () {
    Selection.setToSingle(this.getUpBubble(true))
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

FriendlyResource.FriendlyResource.prototype.moveTo = async function (otherBubble, relation) {
    if (this.isGroupRelation()) {
        this.expand();
    }
    if (this.isVertex()) {
        return this.getParentBubble().moveTo(
            otherBubble,
            relation
        );
    }
    // let elm = this.getHtml();
    // const first = elm.getBoundingClientRect();
    if (MoveRelation.Parent === relation) {
        if (otherBubble.isGroupRelation()) {
            otherBubble.expand();
            // let identification = otherBubble.getIdentification();
            // if (this.hasIdentification(identification)) {
            //     this.revertIdentificationIntegration(identification);
            // }
        }
        this.getParentBubble().removeChild(this);
        let parentVertex = otherBubble.isVertex() ? otherBubble : otherBubble.getParentVertex();
        this.setParentVertex(
            parentVertex
        );
        otherBubble.addChild(this);
    } else {
        let parentBubble = this.getParentFork();
        let otherParentBubble = otherBubble.getParentFork();
        let isTemporaryRemove = parentBubble.isSameBubble(otherParentBubble);
        parentBubble.removeChild(this, isTemporaryRemove);
        this.direction = otherBubble.direction;
        let index = otherParentBubble.getChildIndex(otherBubble);
        this.setParentVertex(
            otherBubble.getParentVertex()
        );
        if (MoveRelation.Before === relation) {
            otherParentBubble.addChild(
                this,
                otherBubble.isToTheLeft(),
                index
            );
        } else {
            otherParentBubble.addChild(
                this,
                otherBubble.isToTheLeft(),
                index + 1
            );
        }
    }
    // await Vue.nextTick();
    // const last = elm.getBoundingClientRect();
    // const deltaX = first.left - last.left;
    // const deltaY = first.top - last.top;
    // // const deltaW = first.width / last.width;
    // // const deltaH = first.height / last.height;
    //
    // elm.animate([{
    //     transformOrigin: 'top left',
    //     transform: `
    //     translate(${deltaX}px, ${deltaY}px)
    //     `
    // }, {
    //     transformOrigin: 'top left',
    //     transform: 'none'
    // }], {
    //     duration: 300,
    //     easing: 'ease-in-out',
    //     fill: 'both'
    // });
    Store.dispatch("redraw");
};

FriendlyResource.FriendlyResource.prototype.revertIdentificationIntegration = function (identifier) {
    identifier.getImages().forEach((image) => {
        this.removeImage(image);
    });
};

FriendlyResource.FriendlyResource.prototype.moveToParent = function (parent) {
    return this.moveTo(
        parent,
        MoveRelation.Parent
    );
};
FriendlyResource.FriendlyResource.prototype.moveAbove = function (newSibling) {
    return this.moveTo(
        newSibling,
        MoveRelation.Before
    );
};
FriendlyResource.FriendlyResource.prototype.moveBelow = function (newSibling) {
    return this.moveTo(
        newSibling,
        MoveRelation.After
    );
};


FriendlyResource.FriendlyResource.prototype.buildChildrenIndex = function (index) {
    let whileCenterContextLeftRightIndex = this.isCenter ? {} : this.getChildrenIndex();
    index = index || 0;
    return this.getClosestChildrenInTypes(
        [GraphElementType.Vertex, GraphElementType.GroupRelation],
        true
    ).reduce((childrenIndex, child) => {
        if (child.isGroupRelation()) {
            let groupRelationIndex = child.buildChildrenIndex(index);
            index += Object.keys(groupRelationIndex).length;
            childrenIndex = Object.assign(childrenIndex, groupRelationIndex);
        } else {
            let leftRightIndexWhileCenter = whileCenterContextLeftRightIndex[child.getUri()];
            let isLeft = leftRightIndexWhileCenter ? leftRightIndexWhileCenter.toTheLeft : child.isToTheLeft();
            childrenIndex[child.getUri()] = {
                index: index,
                toTheLeft: isLeft,
                label: child.getLabel(),
                type: child.getGraphElementType()
            };
            index++;
        }
        return childrenIndex;
    }, {});
};

FriendlyResource.FriendlyResource.prototype._getUpOrDownBubble = function (isDown, isForTravel) {
    if (this.isCenter) {
        return this;
    }
    if (isForTravel === undefined) {
        isForTravel = false;
    }
    let indexAdjust = isDown ? 1 : -1;
    let forkBubble = this.parentBubble;
    let childBubble = this;
    let distance = 0;
    let forkBubbleNbChild = forkBubble.getNextChildren(this.isToTheLeft()).length;
    let childBubbleIndex = forkBubble.getChildIndex(childBubble);
    while (!forkBubble.isCenter && (forkBubbleNbChild < 2 || (isDown && (childBubbleIndex + 1) === forkBubbleNbChild) || (!isDown && childBubbleIndex === 0))) {
        distance++;
        childBubble = forkBubble;
        forkBubble = forkBubble.parentBubble;
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
    if (this.isVertex()) {
        if (bubbleAround.isEdge()) {
            bubbleAround = bubbleAround.getNextBubble();
        }
        if (bubbleAround.isGroupRelation()) {
            if (bubbleAround.canExpand() || !isForTravel) {
                return bubbleAround;
            }
            let closestVertices = bubbleAround.getClosestChildrenOfType(GraphElementType.Vertex);
            bubbleAround = isDown ? closestVertices[0] : closestVertices[closestVertices.length - 1];
        }
    }

    if (this.isEdge()) {
        if (bubbleAround.isVertex()) {
            bubbleAround = isDown ? bubbleAround.getNextBubble() : bubbleAround.getNextBottomBubble();
        }
        if (bubbleAround.isGroupRelation()) {
            if (bubbleAround.canExpand() || !isForTravel) {
                return bubbleAround;
            }
            let closestEdges = bubbleAround.getClosestChildrenOfType(GraphElementType.Relation);
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

FriendlyResource.FriendlyResource.prototype.getChildIndex = function (child) {
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
    return foundIndex;
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


FriendlyResource.FriendlyResource.prototype.getNextBottomBubble = function () {
    return this._getNextBubble(true);
};

FriendlyResource.FriendlyResource.prototype.getNextBubble = function () {
    return this._getNextBubble(false);
};

FriendlyResource.FriendlyResource.prototype._getNextBubble = function (bottom) {
    let nextBubble = this.isToTheLeft() ? this.getLeftBubble(bottom) : this.getRightBubble(bottom);
    if (!nextBubble) {
        return this;
    }
    return nextBubble;
};

FriendlyResource.FriendlyResource.prototype.expand = function (avoidCenter, isChildExpand) {
    // if (this.isExpanded) {
    //     return;
    // }
    this.loading = false;
    this.isExpanded = true;
    this.isCollapsed = false;
    // if (!avoidCenter && !isChildExpand) {
    //     Scroll.centerBubbleForTreeOrNotIfApplicable(this);
    // }
    // this.draw = true;
    // Vue.nextTick(function(){
    //     Store.dispatch("redraw")
    // })
};

FriendlyResource.FriendlyResource.prototype.getIsExpanded = function () {
    return this.isExpanded;
};

FriendlyResource.FriendlyResource.prototype.collapse = function (preventScroll) {
    this.isExpanded = false;
    this.isCollapsed = true;
    if (!preventScroll) {
        Scroll.centerBubbleForTreeIfApplicable(this);
        Store.dispatch("redraw");
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

FriendlyResource.FriendlyResource.prototype.getDescendants = function () {
    return this.getNextChildren().reduce((children, child) => {
        children.push(child);
        if (child.isLeaf()) {
            return children;
        } else {
            return children.concat(child.getDescendants());
        }
    }, []);
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

FriendlyResource.FriendlyResource.prototype.getIndexInTree = function () {
    return this.getParentFork().getChildIndex(this);
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


FriendlyResource.FriendlyResource.prototype.getClosestChildrenOfType = function (type) {
    return this.getClosestChildrenInTypes(
        [type]
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

/*
* @deprecated
*/
FriendlyResource.FriendlyResource.prototype.getServerFormat = function () {
    return this.friendlyResourceServerFormat;
};

FriendlyResource.FriendlyResource.prototype.getFriendlyJson = function () {
    return this.friendlyResourceServerFormat;
};

FriendlyResource.FriendlyResource.prototype.getCreationDate = function () {
    return this.friendlyResourceServerFormat.creationDate === undefined ?
        new Date() :
        new Date(
            this.friendlyResourceServerFormat.creationDate
        );
};

FriendlyResource.FriendlyResource.prototype._buildImages = function () {
    return undefined === this.friendlyResourceServerFormat.images ?
        [] :
        Image.arrayFromServerJson(
            this.friendlyResourceServerFormat.images
        );
};

FriendlyResource.FriendlyResource.prototype.model = function () {
    return this;
};

FriendlyResource.FriendlyResource.prototype.getParentVertex = function () {
    return this.parentVertex;
};

FriendlyResource.FriendlyResource.prototype.getIcon = function () {
    return Icon.getForGraphElement(this);
};

FriendlyResource.FriendlyResource.prototype.forceInLabelMenuUpdate = function () {
    this.inLabelMenuKey = IdUri.uuid();
}

FriendlyResource.FriendlyResource.prototype.init = function (friendlyResourceServerFormat) {
    this.friendlyResourceServerFormat = friendlyResourceServerFormat;
    this.draw = true;
    this._images = this._buildImages();
    if (friendlyResourceServerFormat.comment === undefined) {
        friendlyResourceServerFormat.comment = "";
    }
    if (friendlyResourceServerFormat.label === undefined) {
        this.friendlyResourceServerFormat.label = "";
    }
    this.uiId = IdUri.uuid();
    this.forceInLabelMenuUpdate();
    this.uriFacade = new IdUri.IdUri(
        this.getUri()
    );
    this.loading = true;
    this.isExpanded = false;
    this.isCollapsed = false;
    this.isSelected = false;
    this.updateGraphElementType();
    return this;
};
export default FriendlyResource;
