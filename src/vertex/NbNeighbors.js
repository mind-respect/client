import ShareLevel from "./ShareLevel";

const api = {};

api.fromServerFormat = function (serverFormat) {
    return new NbNeighbors(serverFormat);
};

api.withZeros = function () {
    return new NbNeighbors({
        private_: 0,
        friend: 0,
        public_: 0
    });
};


function NbNeighbors(serverFormat) {
    this.nbPrivate = serverFormat.private_ || 0;
    this.nbFriend = serverFormat.friend || 0;
    this.nbPublic = serverFormat.public_ || 0;
}

NbNeighbors.prototype.getPrivate = function () {
    return this.nbPrivate;
};

NbNeighbors.prototype.getFriend = function () {
    return this.nbFriend;
};

NbNeighbors.prototype.getPublic = function () {
    return this.nbPublic;
};

NbNeighbors.prototype.decrementForShareLevel = function (shareLevel) {
    this[this._getVariableNameForShareLevel(shareLevel)]--;
};

NbNeighbors.prototype.incrementForShareLevel = function (shareLevel) {
    this[this._getVariableNameForShareLevel(shareLevel)]++;
};

NbNeighbors.prototype._getVariableNameForShareLevel = function (shareLevel) {
    switch (shareLevel) {
        case ShareLevel.PRIVATE:
            return "nbPrivate";
        case ShareLevel.FRIENDS:
            return "nbFriend";
        default:
            return "nbPublic";
    }
};


NbNeighbors.prototype.getTotal = function () {
    return this.nbPrivate + this.nbFriend + this.nbPublic;
};

NbNeighbors.prototype.getTotalChildren = function () {
    return Math.max(
        this.getTotal() - 1,
        0
    );
};

NbNeighbors.prototype.toJsonObject = function () {
    return {
        private_: this.getPrivate(),
        friend: this.getFriend(),
        public_: this.getPublic()
    }
};
export default api;
