/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElement from '@/graph-element/GraphElement'
import Icon from '@/Icon'
import DateUtil from '@/DateUtil'

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
CenterGraphElement.prototype.getContext = function () {
    return this.centerGraphElementServerFormat.context;
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
CenterGraphElement.prototype.getIcon = function () {
    return Icon.getForUri(this.getUri());
};

