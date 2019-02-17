/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import IdUri from '@/IdUri'
import MindMapInfo from '@/MindMapInfo'

const api = {};
api.getForCentralBubbleUri = function (centralBubbleUri, callback, errorCallback) {
    return $.ajax({
        type: 'GET',
        url: api.graphUriForCentralBubbleUri(centralBubbleUri)
    }).done(callback).fail(errorCallback);
};
api.getForCentralVertexUriAtDepth = function (centralVertexUri, depth) {
    return $.ajax({
        type: 'GET',
        url: api.graphUriForCentralBubbleUri(centralVertexUri) + "?depth=" + depth
    });
};
api.graphUriForCentralBubbleUri = function (centralBubbleUri) {
    if (!MindMapInfo.isAnonymous() && IdUri.isGraphElementUriOwnedByCurrentUser(centralBubbleUri)) {
        var uri = centralBubbleUri + "/surround_graph";
        if (MindMapInfo.getCenterBubbleUri() === centralBubbleUri) {
            uri += "?center=true";
        }
        return uri;
    } else {
        return IdUri.convertGraphElementUriToNonOwnedUri(centralBubbleUri);
    }
};
export default api;
