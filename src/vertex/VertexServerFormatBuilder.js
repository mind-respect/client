/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElement from '@/graph-element/GraphElement'

const api = {};
api.buildWithUri = function (uri) {
    return {
        graphElement: GraphElement.buildObjectWithUri(uri)
    };
};
api.getFriendlyResourceServerObject = function (serverFormat) {
    return serverFormat.graphElement.friendlyResource;
};

export default api;
