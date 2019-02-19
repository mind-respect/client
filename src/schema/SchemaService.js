/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import UserService from '@/service/UserService'
import IdUri from '@/IdUri'
import MindMapInfo from '@/MindMapInfo'

const api = {};
let baseUri;
api.create = function (callback) {
    return $.ajax({
        type: 'POST',
        url: getBaseUri()
    }).then(function (data, textStatus, jqXHR) {
        callback(
            IdUri.resourceUriFromAjaxResponse(
                jqXHR
            )
        );
    });
};
api.get = function (uri, callback) {
    return $.ajax({
        type: 'GET',
        url: adaptSchemaUri(uri)
    }).then(callback);
};
api.list = function (callback) {
    return $.ajax({
        type: 'GET',
        url: "/service/schemas"
    }).then(callback);
};
api.createProperty = function (schema, callback) {
    return $.ajax({
        type: 'POST',
        url: schema.getUri() + "/property"
    }).then(function (data, textStatus, jqXHR) {
        callback(
            IdUri.resourceUriFromAjaxResponse(
                jqXHR
            )
        );
    });
};
export default api;

function getBaseUri() {
    if (baseUri === undefined) {
        baseUri = UserService.currentUserUri() + "/graph/schema";
    }
    return baseUri;
}

function adaptSchemaUri(uri) {
    if (MindMapInfo.isAnonymous() || !IdUri.isGraphElementUriOwnedByCurrentUser(uri)) {
        return IdUri.convertGraphElementUriToNonOwnedUri(uri);
    }
    return uri;
}
