/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import EventBus from '@/EventBus'
import Triple from '@/triple/Triple'
import Suggestion from '@/suggestion/Suggestion'
import UserService from '@/service/UserService'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import IdUri from '@/IdUri'
import GraphElementUi from '@/graph-element/GraphElementUi'
import Service from '@/Service'
import Edge from '@/edge/Edge'
import Vertex from '@/vertex/Vertex'

const api = {};
api.getByUri = function (uri, callback) {
    return $.ajax({
        type: 'GET',
        url: uri,
        dataType: 'json'
    }).then(callback);
};
api.createVertex = function () {
    return $.ajax({
        type: 'POST',
        url: getVerticesUrl(),
        dataType: 'json'
    });
};
api.addRelationAndVertexToVertex = function (vertex, sourceBubble) {
    return Service.geApi().post(
        vertex.getUri(),
        {}
    ).then(function (response) {
        return Triple.fromEdgeAndSourceAndDestinationVertex(
            Edge.fromServerFormat(response.data.edge),
            sourceBubble,
            Vertex.fromServerFormat(response.data.end_vertex)
        );
    });
};

api.remove = function (vertex) {
    return Service.geApi().delete(
        vertex.getUri()
    );
};
api.removeCollection = function (vertices) {
    return $.ajax({
        type: 'DELETE',
        data: JSON.stringify(verticesUriFromVertices(vertices)),
        contentType: 'application/json;charset=utf-8',
        url: getVerticesUrl() + '/collection'
    });
};
api.updateLabel = function (vertex, label) {
    return FriendlyResourceService.updateLabel(
        vertex,
        label
    );
};
api.getSuggestions = function (vertex) {
    return $.ajax({
        type: 'GET',
        url: vertex.getUri() + '/suggestions',
        dataType: 'json'
    }).then(function (jsonSuggestions) {
        var suggestions = Suggestion.fromServerArray(
            jsonSuggestions
        );
        vertex.setSuggestions(
            suggestions
        );
        EventBus.publish(
            '/event/ui/graph/vertex/suggestions/updated',
            [vertex, suggestions]
        );
    });
};
api.addSuggestions = function (vertex, suggestions) {
    return api.addSuggestionsAjax(
        vertex, suggestions
    ).then(function () {
        vertex.addSuggestions(suggestions);
        EventBus.publish(
            '/event/ui/graph/vertex/suggestions/updated',
            [vertex, suggestions]
        );
    });
};
api.addSuggestionsAjax = function (vertex, suggestions) {
    return $.ajax({
        type: 'POST',
        url: vertex.getUri() + '/suggestions',
        data: Suggestion.formatAllForServer(suggestions),
        contentType: 'application/json;charset=utf-8'
    });
};
api.makePrivate = function (vertexUi) {
    return setPrivacy(
        false,
        vertexUi
    );
};
api.makePublic = function (vertexUi) {
    return setPrivacy(
        true,
        vertexUi
    );
};
api.setShareLevel = function (shareLevel, vertex) {
    return $.ajax({
        method: 'POST',
        url: vertex.getUri() + "/shareLevel",
        data: JSON.stringify({
            shareLevel: shareLevel
        }),
        contentType: 'application/json'
    });
};
api.setCollectionShareLevel = function (shareLevel, vertices) {
    return $.ajax({
        method: 'POST',
        url: getVerticesUrl() + '/collection/share-level',
        data: JSON.stringify({
            shareLevel: shareLevel,
            verticesUri: verticesUriFromVertices(vertices)
        }),
        contentType: 'application/json;charset=utf-8'
    });
};
api.makeCollectionPrivate = function (vertices) {
    return setCollectionPrivacy(
        false,
        vertices
    );
};
api.makeCollectionPublic = function (vertices) {
    return setCollectionPrivacy(
        true,
        vertices
    );
};
api.group = function (graphElementsUris, callback) {
    return $.ajax({
        type: 'POST',
        url: getVerticesUrl() + '/group',
        data: JSON.stringify(graphElementsUris),
        contentType: 'application/json;charset=utf-8'
    }).then(function (data, textStatus, jqXHR) {
            var createdVertexUri = jqXHR.getResponseHeader("Location");
            var relativeUri = createdVertexUri.substring(
                createdVertexUri.indexOf("/service")
            );
            callback(
                relativeUri
            );
        }
    );
};
api.mergeTo = function (vertex, distantVertexUri) {
    return $.ajax({
        type: 'POST',
        url: vertex.getUri() + '/mergeTo/' + IdUri.getGraphElementShortIdFromUri(distantVertexUri),
        dataType: 'json'
    });
};

api.saveColors = function (colors) {
    return $.ajax({
        type: 'POST',
        url: GraphElementUi.getCenterVertexOrSchema().getUri() + '/colors',
        data: JSON.stringify(colors),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json'
    });
};

api.saveFont = function (font) {
    return $.ajax({
        type: 'POST',
        url: GraphElementUi.getCenterVertexOrSchema().getUri() + '/font',
        data: JSON.stringify(font),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json'
    });
};

export default api;

function setCollectionPrivacy(isPublic, vertices) {
    return $.ajax({
        type: isPublic ? 'POST' : 'DELETE',
        data: JSON.stringify(verticesUriFromVertices(vertices)),
        contentType: 'application/json;charset=utf-8',
        url: getVerticesUrl() + '/collection/public_access'
    });
}

function setPrivacy(isPublic, vertex) {
    return $.ajax({
        type: isPublic ? 'POST' : 'DELETE',
        url: vertex.getUri() + '/public_access'
    });
}

function getVerticesUrl() {
    return UserService.currentUserUri() + "/graph/vertex";
}

function verticesUriFromVertices(vertices) {
    var verticesUri = [];
    $.each(vertices, function () {
        var vertex = this;
        verticesUri.push(
            vertex.getUri()
        );
    });
    return verticesUri;
}
