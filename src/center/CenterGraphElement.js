/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElement from '@/graph-element/GraphElement'
import DateUtil from '@/DateUtil'
import IdUri from '@/IdUri'
import NbNeighbors from '@/vertex/NbNeighbors'

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
    this.nbNeighbors = NbNeighbors.fromServerFormat(serverFormat.nbNeighbors);
    GraphElement.GraphElement.apply(
        this.centerGraphElementServerFormat.graphElement
    );
    GraphElement.GraphElement.prototype.init.call(
        this,
        this.centerGraphElementServerFormat.graphElement
    );
    return this;
};

CenterGraphElement.prototype.getNbNeighbors = function () {
    return this.nbNeighbors;
};

CenterGraphElement.prototype.getShareLevel = function () {
    return this.centerGraphElementServerFormat.shareLevel;
};

CenterGraphElement.prototype.getContext = function () {
    return this.centerGraphElementServerFormat.context || {};
};

CenterGraphElement.prototype.getLastCenterDate = function () {
    return this.centerGraphElementServerFormat.lastCenterDate ?
        new Date(this.centerGraphElementServerFormat.lastCenterDate) :
        this.getCreationDate();
};

CenterGraphElement.prototype.getLastCenterDateTime = function () {
    const lastCenterDate = this.getLastCenterDate();
    return lastCenterDate.getTime() + (lastCenterDate.getTimezoneOffset() * 60000);
};

CenterGraphElement.prototype.lastVisit = function () {
    return DateUtil.fromNow(this.getLastCenterDate());
};

CenterGraphElement.prototype.getCreationDateFormatted = function () {
    return DateUtil.fromNow(this.getCreationDate());
};

CenterGraphElement.prototype.getGraphElementType = function () {
    return IdUri.getGraphElementTypeFromUri(this.getUri())
};

CenterGraphElement.prototype.isPattern = function () {
    return this.centerGraphElementServerFormat.isPattern;
};



