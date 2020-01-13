/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import SubGraph from '@/graph/SubGraph'
import Tag from "./Tag";

const api = {};
api.fromServerFormatAndCenterUri = function (serverFormat, centerUri) {
    return new api.TagGraph(
        serverFormat,
        centerUri
    );
};
api.TagGraph = function (serverFormat, centerUri) {
    this.subGraph = SubGraph.fromServerFormat(serverFormat);
    this.centerUri = centerUri;
    this.metaCenter = Tag.fromServerFormat(serverFormat.centerTag);
};

api.TagGraph.prototype.getMetaCenter = function () {
    return this.metaCenter;
};

api.TagGraph.prototype.setMetaCenter = function (metaCenter) {
    return this.metaCenter = metaCenter;
};

api.TagGraph.prototype.getSubGraph = function () {
    return this.subGraph;
};

api.TagGraph.prototype.getCenterUri = function () {
    return this.centerUri;
};

export default api;
