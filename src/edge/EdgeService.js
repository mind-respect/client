/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import IdUri from '@/IdUri'
import UserService from '@/service/UserService'
import Edge from '@/edge/Edge'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'

const api = {};
api.add = function (sourceVertex, destinationVertex, callback) {
    api._add(
        sourceVertex.getUri(),
        destinationVertex.getUri(),
        callback
    );
};
api.addToFarVertex = function (sourceVertex, destinationVertexUri) {
    return api._add(
        sourceVertex.getUri(),
        destinationVertexUri
    );
};
api.remove = function (edge, callback) {
    return $.ajax({
        type: 'DELETE',
        url: edge.getUri()
    }).then(function () {
        api._removeCallback(
            edge,
            callback
        );
    });
};
api._removeCallback = function (edge, callback) {
    var sourceVertex = edge.getSourceVertex(),
        destinationVertex = edge.getDestinationVertex(),
        sourceVertexUri = sourceVertex.getUri(),
        destinationVertexUri = destinationVertex.getUri(),
        sourceVertexId = sourceVertex.getId(),
        destinationVertexId = destinationVertex.getId();
    if (undefined !== callback) {
        callback(
            edge,
            edge.getUri(),
            sourceVertexUri,
            destinationVertexUri
        );
    }
};
api.updateLabel = function (edge, label) {
    return FriendlyResourceService.updateLabel(
        edge,
        label
    );
};
api.inverse = function (edge) {
    return $.ajax({
        type: 'PUT',
        url: edge.getUri() + "/inverse"
    });
};
api.changeSourceVertex = function (sourceVertex, edge, callback) {
    return $.ajax({
        type: 'PUT',
        url: edge.getUri() + "/source-vertex/" + IdUri.elementIdFromUri(sourceVertex.getUri())
    }).then(callback);
};
api.changeDestinationVertex = function (destinationVertex, edge, callback) {
    return $.ajax({
        type: 'PUT',
        url: edge.getUri() + "/destination-vertex/" + IdUri.elementIdFromUri(destinationVertex.getUri())
    }).then(callback);
};

api._add = function (sourceVertexUri, destinationVertexUri) {
    var sourceVertexUriFormatted = IdUri.encodeUri(sourceVertexUri);
    var destinationVertexUriFormatted = IdUri.encodeUri(destinationVertexUri);
    var deferred = $.Deferred();
    $.ajax({
        type: 'POST',
        url: edgesUrl() +
        '?sourceVertexId=' + sourceVertexUriFormatted +
        '&destinationVertexId=' + destinationVertexUriFormatted
    }).then(function (data, textStatus, jqXHR) {
            var newEdgeUri = IdUri.resourceUriFromAjaxResponse(
                jqXHR
            );
            deferred.resolve(
                api._buildAfterAddReturnObject(
                    newEdgeUri,
                    sourceVertexUri,
                    destinationVertexUri
                )
            );
        }
    );
    return deferred.promise();
};
api._buildAfterAddReturnObject = function (newEdgeUri, sourceVertexUri, destinationVertexUri, callback) {
    Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
        newEdgeUri,
        sourceVertexUri,
        destinationVertexUri
    );
};

export default api;

function edgesUrl() {
    return UserService.currentUserUri() + "/graph/edge";
}
