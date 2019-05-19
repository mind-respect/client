/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import IdUri from '@/IdUri'
import UserService from '@/service/UserService'
import Edge from '@/edge/Edge'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import Service from '@/Service'

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

api.updateLabel = function (edge, label) {
    return FriendlyResourceService.updateLabel(
        edge,
        label
    );
};
api.inverse = function (edge) {
    return Service.geApi().put(
        edge.getUri() + "/inverse"
    );
};
api.changeSourceVertex = function (sourceVertex, edge) {
    return Service.geApi().put(
        edge.getUri() + "/source-vertex/" + IdUri.elementIdFromUri(sourceVertex.getUri())
    )
};
api.changeDestinationVertex = function (destinationVertex, edge) {
    return Service.geApi().put(
        edge.getUri() + "/destination-vertex/" + IdUri.elementIdFromUri(destinationVertex.getUri())
    );
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
