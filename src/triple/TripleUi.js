/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

const api = {};
api.TripleUi = function (edgeUi, sourceVertexUi, destinationVertexUi) {
    this.edge = function () {
        return edgeUi;
    };
    this.sourceVertex = function () {
        return sourceVertexUi;
    };
    this.destinationVertex = function () {
        return destinationVertexUi;
    };
    this.setServerFormat = function (serverFormat) {
        this.serverFormat = serverFormat;
    };
    this.getServerFormat = function () {
        return this.serverFormat;
    };
};

export default api;
