/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import IdUri from '@/IdUri'
import Service from '@/Service'
import Vertex from '@/vertex/Vertex'
import axios from 'axios'

const api = {};

api.createPromise = Promise.resolve();

api.createVertex = function () {
    return Service.api().post(IdUri.vertexBaseUri()).then((response) => {
        return Vertex.fromServerFormat(
            response.data
        );
    });
};

api.updateLabel = function (vertex, label) {
    return FriendlyResourceService.updateLabel(
        vertex,
        label
    );
};

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

api.mergeTo = function (vertex, distantVertexUri) {
    return Service.geApi().post(
        vertex.getUri() + '/mergeTo/' + IdUri.getGraphElementShortIdFromUri(distantVertexUri)
    );
};

api.listFonts = function () {
    let apiKey = process.env.VUE_APP_FONT_API_KEY_GOOGLE;
    return axios.get(
        "https://www.googleapis.com/webfonts/v1/webfonts?key=" + apiKey
    );
};

api.saveFont = function (uri, font) {
    return Service.geApi().post(
        uri + '/font',
        font
    );
};

api.makePattern = function (vertex) {
    return Service.geApi().post(
        vertex.getUri() + '/pattern'
    );
};

api.undoPattern = function (vertex) {
    return Service.geApi().delete(
        vertex.getUri() + '/pattern'
    );
};


export default api;

