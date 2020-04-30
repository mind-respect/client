import GraphElement from '@/graph-element/GraphElement'
import NbNeighbors from "../vertex/NbNeighbors";
import ShareLevel from "../vertex/ShareLevel";


export default {
    fromJsonObject: function (jsonObject) {
        return new Fork().init(jsonObject);
    },
    Fork: Fork
};

Fork.prototype = new GraphElement.GraphElement();

function Fork() {
}

Fork.prototype.init = function (jsonObject) {
    this._forkJsonObject = jsonObject;
    if (!this._forkJsonObject.shareLevel) {
        this.makePrivate();
    }
    this.nbNeighbors = NbNeighbors.fromServerFormat(
        jsonObject.nbNeighbors
    );
    this.originalNbNeighbors = NbNeighbors.fromServerFormat(
        jsonObject.nbNeighbors
    );
    GraphElement.GraphElement.apply(
        this
    );
    GraphElement.GraphElement.prototype.init.call(
        this,
        this._forkJsonObject.graphElement
    );
    return this;
};

Fork.prototype.isPublic = function () {
    return this.getShareLevel() === ShareLevel.PUBLIC ||
        this.getShareLevel() === ShareLevel.PUBLIC_WITH_LINK;
};

Fork.prototype.isPrivate = function () {
    return this.getShareLevel() === ShareLevel.PRIVATE;
};

Fork.prototype.isFriendsOnly = function () {
    return this.getShareLevel() === ShareLevel.FRIENDS;
};

Fork.prototype.getShareLevel = function () {
    return this._vertexServerFormat.shareLevel.toUpperCase();
};

Fork.prototype.makePrivate = function () {
    this.setShareLevel(ShareLevel.PRIVATE);
};

Fork.prototype.makePublic = function () {
    this.setShareLevel(ShareLevel.PUBLIC);
};

Fork.prototype.setShareLevel = function (shareLevel) {
    this._forkJsonObject.shareLevel = shareLevel.toUpperCase();
};

Fork.prototype.getOriginalNbNeighbors = function () {
    return this.originalNbNeighbors;
};

Fork.prototype.getNbNeighbors = function () {
    return this.nbNeighbors;
};

Fork.prototype.setNbNeighbors = function (nbNeighbors) {
    return this.nbNeighbors = nbNeighbors;
};

