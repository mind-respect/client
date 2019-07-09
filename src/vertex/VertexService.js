/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Triple from '@/triple/Triple'
import UserService from '@/service/UserService'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import IdUri from '@/IdUri'
import Service from '@/Service'
import Edge from '@/edge/Edge'
import Vertex from '@/vertex/Vertex'
import SubGraph from '@/graph/SubGraph'
import axios from 'axios'
import CurrentSubGraph from '@/graph/CurrentSubGraph'

const api = {};
api.createVertex = function () {
    return Service.api().post(getVerticesUrl());
};
api.addTuple = function (vertex) {
    return Service.geApi().post(
        vertex.getUri(),
        {}
    ).then(function (response) {
        return Triple.fromEdgeAndSourceAndDestinationVertex(
            Edge.fromServerFormat(response.data.edge),
            vertex,
            Vertex.fromServerFormat(response.data.end_vertex)
        );
    });
};

api.updateLabel = function (vertex, label) {
    return FriendlyResourceService.updateLabel(
        vertex,
        label
    );
};
// api.getSuggestions = function (vertex) {
//     return $.ajax({
//         type: 'GET',
//         url: vertex.getUri() + '/suggestions',
//         dataType: 'json'
//     }).then(function (jsonSuggestions) {
//         var suggestions = Suggestion.fromServerArray(
//             jsonSuggestions
//         );
//         vertex.setSuggestions(
//             suggestions
//         );
//         EventBus.publish(
//             '/event/ui/graph/vertex/suggestions/updated',
//             [vertex, suggestions]
//         );
//     });
// };
// api.addSuggestions = function (vertex, suggestions) {
//     return api.addSuggestionsAjax(
//         vertex, suggestions
//     ).then(function () {
//         vertex.addSuggestions(suggestions);
//         EventBus.publish(
//             '/event/ui/graph/vertex/suggestions/updated',
//             [vertex, suggestions]
//         );
//     });
// };
// api.addSuggestionsAjax = function (vertex, suggestions) {
//     return $.ajax({
//         type: 'POST',
//         url: vertex.getUri() + '/suggestions',
//         data: Suggestion.formatAllForServer(suggestions),
//         contentType: 'application/json;charset=utf-8'
//     });
// };
api.makePrivate = function (vertex) {
    return Service.geApi().delete(
        vertex.getUri() + '/public_access'
    );
};
api.makePublic = function (vertex) {
    return Service.geApi().post(
        vertex.getUri() + '/public_access'
    );
};
api.setShareLevel = function (shareLevel, vertex) {
    return Service.geApi().post(
        vertex.getUri() + "/shareLevel",
        {
            shareLevel: shareLevel
        }
    );
};
api.setCollectionShareLevel = function (shareLevel, vertices) {
    return Service.geApi().post(
        getVerticesUrl() + '/collection/share-level',
        {
            shareLevel: shareLevel,
            verticesUri: verticesUriFromVertices(vertices)
        }
    );
};
api.makeCollectionPrivate = function (vertices) {
    return Service.api().delete(
        getVerticesUrl() + '/collection/public_access',
        {data: verticesUriFromVertices(vertices)}
    );
};
api.makeCollectionPublic = function (vertices) {
    return Service.api().post(
        getVerticesUrl() + '/collection/public_access',
        verticesUriFromVertices(vertices)
    );
};
// api.group = function (graphElementsUris, callback) {
//     return $.ajax({
//         type: 'POST',
//         url: getVerticesUrl() + '/group',
//         data: JSON.stringify(graphElementsUris),
//         contentType: 'application/json;charset=utf-8'
//     }).then(function (data, textStatus, jqXHR) {
//             var createdVertexUri = jqXHR.getResponseHeader("Location");
//             var relativeUri = createdVertexUri.substring(
//                 createdVertexUri.indexOf("/service")
//             );
//             callback(
//                 relativeUri
//             );
//         }
//     );
// };
api.mergeTo = function (vertex, distantVertexUri) {
    return Service.geApi().post(
        vertex.getUri() + '/mergeTo/' + IdUri.getGraphElementShortIdFromUri(distantVertexUri)
    );
};

api.saveColors = function (colors) {
    return Service.geApi().post(
        CurrentSubGraph.get().center.getUri() + '/colors',
        colors
    );
};

api.listFonts = function () {
    let apiKey = process.env.VUE_APP_FONT_API_KEY_GOOGLE;
    return axios.get(
        "https://www.googleapis.com/webfonts/v1/webfonts?key=" + apiKey
    );
};

api.saveFont = function (font) {
    return Service.geApi().post(
        CurrentSubGraph.get().center.getUri() + '/font',
        font
    );
};

export default api;


function getVerticesUrl() {
    return UserService.currentUserUri() + "/graph/vertex";
}

function verticesUriFromVertices(vertices) {
    return vertices.map(function (vertex) {
        return vertex.getUri();
    });
}
