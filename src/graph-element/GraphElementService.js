/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/Service'
import UserService from '@/service/UserService'

const api = {};

api.setShareLevel = function (shareLevel, graphElement) {
    return Service.geApi().post(
        graphElement.getUri() + "/shareLevel",
        {
            shareLevel: shareLevel
        }
    );
};

api.setCollectionShareLevel = function (shareLevel, bubbles) {
    return Service.api().post(
        UserService.currentUserUri() + '/graph/graphElement/collection/share-level',
        {
            shareLevel: shareLevel,
            graphElementsUri: urisOfGraphElements(bubbles)
        }
    );
};

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

api.saveColors = function (uri, colors) {
    return Service.geApi().post(
        uri + '/colors',
        colors
    );
};

api.setNbNeighbors = function (graphElement) {
    return Service.geApi().post(
        graphElement.getUri() + '/nbNeighbors',
        JSON.stringify(
            graphElement.getNbNeighbors().toJsonObject()
        )
    );
};

api._getGraphElementsUrl = function (graphElements) {
    return graphElements.map(function (graphElement) {
        return graphElement.getUri();
    });
};

function urisOfGraphElements(graphElements) {
    return graphElements.map(function (graphElement) {
        return graphElement.getUri();
    });
}

export default api;
