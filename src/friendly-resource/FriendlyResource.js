/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Image from '@/image/Image'
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'

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
    buildObjectWithUri: function () {
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
    this.uriFacade = new IdUri.IdUri(
        this.getUri()
    );
    return this;
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
    return undefined;
};

FriendlyResource.FriendlyResource.prototype.isVertex = function () {
    return this.getGraphElementType() === GraphElementType.Vertex;
};

FriendlyResource.FriendlyResource.prototype._buildImages = function () {
    return undefined === this.friendlyResourceServerFormat.images ?
        [] :
        Image.arrayFromServerJson(
            this.friendlyResourceServerFormat.images
        );
};
export default FriendlyResource;
