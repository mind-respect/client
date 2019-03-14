/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Image from '@/image/Image'
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'
import Focus from '@/Focus'
import SelectionHandler from '@/SelectionHandler'

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
            comment: friendlyResourceUi.getModel().getComment()
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

FriendlyResource.FriendlyResource.prototype.init = function (friendlyResourceServerFormat) {
    this.friendlyResourceServerFormat = friendlyResourceServerFormat;
    this._images = this._buildImages();
    if (friendlyResourceServerFormat.comment === undefined) {
        friendlyResourceServerFormat.comment = "";
    }
    if (friendlyResourceServerFormat.label === undefined) {
        this.friendlyResourceServerFormat.label = "";
    }
    this.uiId = IdUri.uuid();
    this.uriFacade = new IdUri.IdUri(
        this.getUri()
    );
    this.isSelected = false;
    this.isSingleSelected = false;
    this.loading = false;
    this.isExpanded = false;
    this.isCollapsed = false;
    return this;
};

FriendlyResource.FriendlyResource.prototype.getId = function () {
    return this.uiId;
};

FriendlyResource.FriendlyResource.prototype.getHtml = function () {
    return document.getElementById(this.uiId);
};

FriendlyResource.FriendlyResource.prototype.getLabelHtml = function () {
    let html = this.getHtml();
    return html.querySelectorAll('.bubble-label')[0];
};

FriendlyResource.FriendlyResource.prototype.focus = function (event) {
    let labelHtml = this.getLabelHtml();
    labelHtml.contentEditable = "true";
    if (event) {
        Focus.focusAtPosition(event, labelHtml);
    } else {
        Focus.focusEnd(labelHtml);
    }
};

FriendlyResource.FriendlyResource.prototype.setLabel = function (label) {
    this.friendlyResourceServerFormat.label = label;
};

FriendlyResource.FriendlyResource.prototype.getLabel = function () {
    return this.friendlyResourceServerFormat.label;
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

FriendlyResource.FriendlyResource.prototype.getComment = function () {
    return this.friendlyResourceServerFormat.comment;
};
FriendlyResource.FriendlyResource.prototype.setComment = function (comment) {
    return this.friendlyResourceServerFormat.comment = comment;
};
FriendlyResource.FriendlyResource.prototype.hasComment = function () {
    return this.friendlyResourceServerFormat.comment.length > 0;
};
FriendlyResource.FriendlyResource.prototype.addImage = function (image) {
    this._images.push(image);
};
FriendlyResource.FriendlyResource.prototype.getImages = function () {
    return this._images;
};
FriendlyResource.FriendlyResource.prototype.hasImages = function () {
    return this._images.length > 0;
};
FriendlyResource.FriendlyResource.prototype.setUri = function (uri) {
    this.friendlyResourceServerFormat.uri = uri;
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

FriendlyResource.FriendlyResource.prototype.isVertex = function () {
    return this.getGraphElementType() === GraphElementType.Vertex;
};

FriendlyResource.FriendlyResource.prototype.isEdge = function () {
    return GraphElementType.isEdgeType(this.getGraphElementType())
};

FriendlyResource.FriendlyResource.prototype.isGroupRelation = function () {
    return GraphElementType.GroupRelation === this.getGraphElementType();
};

FriendlyResource.FriendlyResource.prototype.select = function () {
    this.isSelected = true;
};

FriendlyResource.FriendlyResource.prototype.deselect = function () {
    this.isSelected = false;
    this.isSingleSelected = false;
    this.getLabelHtml().blur();
};

FriendlyResource.FriendlyResource.prototype.isToTheLeft = function () {
    return this.orientation === "left";
};

FriendlyResource.FriendlyResource.prototype.makeSingleSelected = function () {
    this.isSelected = true;
    this.isSingleSelected = true;
};

FriendlyResource.FriendlyResource.prototype.removeSingleSelected = function () {
    this.isSingleSelected = false;
};

FriendlyResource.FriendlyResource.prototype.beforeExpand = function () {
    this.loading = true;
};

FriendlyResource.FriendlyResource.prototype.isInTypes = function (types) {
    return types.indexOf(this.getGraphElementType()) > -1;
};

FriendlyResource.FriendlyResource.prototype.travelLeft = function () {
    SelectionHandler.setToSingle(this.getLeftBubble())
};

FriendlyResource.FriendlyResource.prototype.travelRight = function () {
    SelectionHandler.setToSingle(this.getRightBubble())
};

// FriendlyResource.FriendlyResource.prototype.isSingleSelected = function () {
//     return this.isSingleSelected;
// };

FriendlyResource.FriendlyResource.prototype.travelDown = function () {
    SelectionHandler.setToSingle(this.getDownBubble())
};

FriendlyResource.FriendlyResource.prototype.travelUp = function () {
    SelectionHandler.setToSingle(this.getUpBubble())
};

FriendlyResource.FriendlyResource.prototype.getUpBubble = function () {
    return this._getUpOrDownBubble(false);
};
FriendlyResource.FriendlyResource.prototype.getDownBubble = function () {
    return this._getUpOrDownBubble(true);
};

FriendlyResource.FriendlyResource.prototype.canExpand = function () {
    return !this.isCenter && !this.isExpanded && this.getNumberOfChild() > 0;
};

FriendlyResource.FriendlyResource.prototype._getUpOrDownBubble = function (isDown) {
    if (this.isCenter) {
        return this;
    }
    let indexAdjust = isDown ? 1 : -1;
    let forkBubble = this.parentBubble;
    let childBubble = this;
    let distance = 0;
    let forkBubbleNbChild = forkBubble.getImmediateChild(this.isToTheLeft()).length;
    let childBubbleIndex = forkBubble.getChildIndex(childBubble);
    while (!forkBubble.isCenter && (forkBubbleNbChild < 2 || (isDown && (childBubbleIndex + 1) === forkBubbleNbChild) || (!isDown && childBubbleIndex === 0))) {
        distance++;
        childBubble = forkBubble;
        forkBubble = forkBubble.parentBubble;
        forkBubbleNbChild = forkBubble.getImmediateChild(this.isToTheLeft()).length;
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
            bubbleAround = isDown ? bubbleAround.getFirstVertex(0) : bubbleAround.getLastVertex(0);
        }
    }

    if (this.isEdge()) {
        if (bubbleAround.isVertex()) {
            bubbleAround = isDown ? bubbleAround.getNextBubble() : bubbleAround.getNextBottomBubble();
        }
        if (bubbleAround.isGroupRelation()) {
            bubbleAround = isDown ? bubbleAround.getFirstEdge(0) : bubbleAround.getLastEdge(0);
        }
    }

    return bubbleAround;
};

FriendlyResource.FriendlyResource.prototype.getChildIndex = function (child) {
    let foundIndex = -1;
    let children = this.getImmediateChild(child.isToTheLeft());
    for (let i = 0; i < children.length; i++) {
        let childAtIndex = children[i];
        if (childAtIndex.getId() === child.getId()) {
            foundIndex = i;
        }
    }
    return foundIndex;
};

FriendlyResource.FriendlyResource.prototype.getChildAtIndex = function (index, isToTheLeft) {
    let foundChild;
    let children = this.getImmediateChild(isToTheLeft);
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
    this.isExpanded = true;
};

FriendlyResource.FriendlyResource.prototype.canExpandDescendants = function () {
    let hasHiddenRelations = false;
    this.visitChildrenDeep(function (child) {
        if (child.canExpand()) {
            hasHiddenRelations = true;
        }
    });
    return hasHiddenRelations;
};

FriendlyResource.FriendlyResource.prototype.visitExpandableDescendants = function (visitor) {
    this.visitChildrenDeep(function (child) {
        if (child.getNumberOfChild() > 0 && !child.isExpanded) {
            visitor(child);
        }
    });
};

FriendlyResource.FriendlyResource.prototype.visitChildrenDeep = function (visitor) {
    this.visitAllImmediateChild(function (child) {
        if (child.isLeaf()) {
            return visitor(child);
        } else {
            return child.visitChildrenDeep(
                visitor
            );
        }
    });
};

FriendlyResource.FriendlyResource.prototype.getNumberOfChildDeep = function () {
    let nbChild = 0;
    this.visitChildrenDeep(function () {
        nbChild++
    });
    return nbChild;
};


FriendlyResource.FriendlyResource.prototype.isLeaf = function () {
    return this.getNumberOfChild() === 0 || this.canExpand();
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
FriendlyResource.FriendlyResource.prototype.visitClosestChildOfType = function (type, visitor) {
    return this.visitClosestChildInTypes(
        [type],
        visitor
    );
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
    this.getImmediateChild().forEach(function (child) {
        visitor(child);
    });
};

FriendlyResource.FriendlyResource.prototype.getJsonFormat = function () {
    var serverFormat = this.getServerFormat();
    serverFormat.images = this.getImagesServerFormat();
    return JSON.stringify(
        serverFormat
    );
};
FriendlyResource.FriendlyResource.prototype.getImagesServerFormat = function () {
    return Image.arrayToServerJson(
        this._images
    );
};
FriendlyResource.FriendlyResource.prototype.getServerFormat = function () {
    return this.friendlyResourceServerFormat;
};
FriendlyResource.FriendlyResource.prototype.getCreationDate = function () {
    return this.friendlyResourceServerFormat.creationDate === undefined ?
        new Date() :
        new Date(
            this.friendlyResourceServerFormat.creationDate
        );
};
FriendlyResource.FriendlyResource.prototype.isToTheLeft = function () {
    return this.orientation === "left";
};

FriendlyResource.FriendlyResource.prototype._buildImages = function () {
    return undefined === this.friendlyResourceServerFormat.images ?
        [] :
        Image.arrayFromServerJson(
            this.friendlyResourceServerFormat.images
        );
};

FriendlyResource.FriendlyResource.prototype.getModel = function () {
    return this;
};


export default FriendlyResource;
