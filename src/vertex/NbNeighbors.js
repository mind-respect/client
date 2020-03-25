import ShareLevel from "./ShareLevel";

const api = {};

api.fromServerFormat = function (serverFormat, hooks) {
    return new NbNeighbors(serverFormat, hooks);
};

api.withZeros = function (hooks) {
    return new NbNeighbors({
        private_: 0,
        friend: 0,
        public_: 0
    }, hooks);
};

api.difference = function (a, b) {
    return new NbNeighbors({
        private_: Math.max(a.getPrivate() - b.getPrivate(), 0),
        friend: Math.max(a.getFriend() - b.getFriend(), 0),
        public_: Math.max(a.getPublic() - b.getPublic(), 0)
    });
};


function NbNeighbors(serverFormat, hooks) {
    this.nbPrivate = serverFormat.private_ || 0;
    this.nbFriend = serverFormat.friend || 0;
    this.nbPublic = serverFormat.public_ || 0;
    this.hooks = hooks;
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

NbNeighbors.prototype.decrementForShareLevel = function (shareLevel, preventHook) {
    if (!preventHook && this.hooks && this.hooks.decrementForShareLevel) {
        this.hooks.decrementForShareLevel(shareLevel);
    } else {
        this[this._getVariableNameForShareLevel(shareLevel)]--;
    }
};

NbNeighbors.prototype.incrementForShareLevel = function (shareLevel, preventHook) {
    if (!preventHook && this.hooks && this.hooks.incrementForShareLevel) {
        this.hooks.incrementForShareLevel(shareLevel);
    } else {
        this[this._getVariableNameForShareLevel(shareLevel)]++;
    }
};

NbNeighbors.prototype.substract = function (nbNeighbors) {
    this.nbPrivate = Math.max(this.nbPrivate - nbNeighbors.getPrivate(), 0);
    this.nbFriend = Math.max(this.nbFriend - nbNeighbors.getFriend(), 0);
    this.nbPublic = Math.max(this.nbPublic - nbNeighbors.getPublic(), 0);
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
NbNeighbors.prototype.clone = function () {
    return api.fromServerFormat(
        this.toJsonObject()
    );
};
export default api;
