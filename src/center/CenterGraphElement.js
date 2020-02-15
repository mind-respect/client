/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElement from '@/graph-element/GraphElement'
import DateUtil from '@/DateUtil'
import IdUri from '@/IdUri'
import GraphElementType from '@/graph-element/GraphElementType'
import Icon from '@/Icon'
import Color from '@/Color'
import colors from "vuetify/es5/util/colors";

export default {
    fromServerFormat: function (centersServerFormat) {
        let elements = [];
        centersServerFormat.forEach(function (centerServerFormat) {
            elements.push(
                new CenterGraphElement().init(
                    centerServerFormat
                )
            );
        });
        return elements;
    }
}

function CenterGraphElement() {
}

CenterGraphElement.prototype = new GraphElement.GraphElement();
CenterGraphElement.prototype.init = function (serverFormat) {
    this.centerGraphElementServerFormat = serverFormat;
    GraphElement.GraphElement.apply(
        this.centerGraphElementServerFormat.graphElement
    );
    GraphElement.GraphElement.prototype.init.call(
        this,
        this.centerGraphElementServerFormat.graphElement
    );
    return this;
};

CenterGraphElement.prototype.getNbNeighborsFromFlow = function (flow, isOwner) {
    switch (flow) {
        case "centers" : {
            if (isOwner) {
                return this.getNbAllNeighbors();
            }
            return this.isFriend ? this.getNbFriendNeighbors() + this.getNbPublicNeighbors() : this.getNbPublicNeighbors();
        }
        case "patterns" : {
            return this.getNbPublicNeighbors();
        }
        case "friends" : {
            return this.getNbFriendNeighbors() + this.getNbPublicNeighbors();
        }
        case "publicCenters" : {
            return this.getNbPublicNeighbors();
        }
    }
};

CenterGraphElement.prototype.getNbAllNeighbors = function () {
    return this.centerGraphElementServerFormat.numberOfConnectedEdges || 0;
};

CenterGraphElement.prototype.getNbPublicNeighbors = function () {
    return this.centerGraphElementServerFormat.nbPublicNeighbors || 0;
};

CenterGraphElement.prototype.getNbFriendNeighbors = function () {
    return this.centerGraphElementServerFormat.nbFriendNeighbors || 0;
};

CenterGraphElement.prototype.getNumberOfVisits = function () {
    if (!this.centerGraphElementServerFormat.numberOfVisits) {
        return 0;
    }
    if (this.centerGraphElementServerFormat.numberOfVisits > 999) {
        return 999;
    }
    return this.centerGraphElementServerFormat.numberOfVisits;
};
CenterGraphElement.prototype.getLastCenterDate = function () {
    return new Date(this.centerGraphElementServerFormat.lastCenterDate);
};

CenterGraphElement.prototype.getLastCenterDateTime = function () {
    const lastCenterDate = this.getLastCenterDate();
    return lastCenterDate.getTime() + (lastCenterDate.getTimezoneOffset() * 60000);
};

CenterGraphElement.prototype.getShareLevel = function () {
    return this.centerGraphElementServerFormat.shareLevel;
};

CenterGraphElement.prototype.getContext = function () {
    return this.centerGraphElementServerFormat.context || {};
};
CenterGraphElement.prototype.setVisitRank = function (rank) {
    this.visitRank = rank;
};
CenterGraphElement.prototype.getNumberOfVisitsRank = function () {
    return this.visitRank;
};
CenterGraphElement.prototype.getNbReferences = function () {
    return this.centerGraphElementServerFormat.nbReferences;
};
CenterGraphElement.prototype.lastVisit = function () {
    return DateUtil.fromNow(this.getLastCenterDate());
};

CenterGraphElement.prototype.getGraphElementType = function () {
    return IdUri.getGraphElementTypeFromUri(this.getUri())
};

CenterGraphElement.prototype.isPattern = function () {
    return this.centerGraphElementServerFormat.isPattern;
};



