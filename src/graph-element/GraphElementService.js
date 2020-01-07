/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/Service'

const api = {};

api.updateNote = function (graphElement) {
    return Service.geApi().post(
        graphElement.getUri() + '/comment',
        graphElement.getComment(),
        {headers: {"Content-Type": "text/plain"}}
    );
};

api.changeChildrenIndex = function (graphElement) {
    let childrenIndex = graphElement.buildChildrenIndex();
    graphElement.setChildrenIndex(childrenIndex);
    return api.saveChildrenIndex(
        graphElement,
        childrenIndex
    );
};
api.saveChildrenIndex = function (graphElement, childrenIndex) {
    return Service.geApi().post(
        graphElement.getUri() + "/childrenIndex",
        childrenIndex
    );
};

api.remove = function (graphElement) {
    return Service.geApi().delete(
        graphElement.getUri()
    );
};
api.removeCollection = function (graphElements) {
    return Service.geApi().request({
        url: graphElements[0].uri().withoutId() + '/collection',
        method: 'delete',
        data: api._getGraphElementsUrl(graphElements)
    });
};

api.saveColors = function (bubble, colors) {
    bubble = bubble || CurrentSubGraph.get().center;
    return Service.geApi().post(
        bubble.getUri() + '/colors',
        colors
    );
};

api._getGraphElementsUrl = function (graphElements) {
    return graphElements.map(function (graphElement) {
        return graphElement.getUri();
    });
};

export default api;
