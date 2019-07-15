/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import SubGraph from '@/graph/SubGraph'

const api = {};
api.fromServerFormatAndCenterUri = function (serverFormat, centerUri) {
    return new api.MetaGraph(
        serverFormat,
        centerUri
    );
};
api.MetaGraph = function (serverFormat, centerUri) {
    this.subGraph = SubGraph.fromServerFormat(serverFormat);
    this.centerUri = centerUri;
    this.metaCenter = this._getMetaCenter();
};

api.MetaGraph.prototype.getMetaCenter = function () {
    return this.metaCenter;
};

api.MetaGraph.prototype.setMetaCenter = function (metaCenter) {
    return this.metaCenter = metaCenter;
};

api.MetaGraph.prototype.getSubGraph = function () {
    return this.subGraph;
};

api.MetaGraph.prototype._getMetaCenter = function () {
    let centerMeta;
    this.subGraph.visitGraphElements((graphElement) => {
        graphElement.getIdentifiersIncludingSelf().forEach((identifier) => {
            if (identifier.getUri() === this.centerUri) {
                centerMeta = identifier;
            }
        });
    });
    return centerMeta;
};
api.MetaGraph.prototype.getCenterUri = function () {
    return this.centerUri;
};

export default api;
