/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Triple from '@/triple/Triple'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import IdUri from '@/IdUri'
import Service from '@/Service'
import Edge from '@/edge/Edge'
import Vertex from '@/vertex/Vertex'
import axios from 'axios'
import CurrentSubGraph from '@/graph/CurrentSubGraph'

const api = {};

api.createPromise = Promise.resolve();

api.createVertex = function () {
    return Service.api().post(IdUri.vertexBaseUri());
};
api.addTuple = function (vertex) {
    let newVertexId = IdUri.uuid();
    let newEdgeId = IdUri.uuid();
    let newVertex = Vertex.withUri(
        "/service" + IdUri.vertexBaseUri() + "/" + newVertexId
    );
    let newEdge = Edge.withUriAndSourceAndDestinationVertex(
        "/service" + IdUri.edgeBaseUri() + "/" + newEdgeId,
        vertex,
        newVertex
    );
    api.createPromise.then(() => {
        return Service.geApi().post(
            vertex.getUri(),
            {
                vertexId: newVertexId,
                edgeId: newEdgeId
            }
        );
    }).then(function (response) {
        api.createPromise = Promise.resolve();
        return Triple.fromEdgeAndSourceAndDestinationVertex(
            Edge.fromServerFormat(response.data.edge),
            vertex,
            Vertex.fromServerFormat(response.data.end_vertex)
        );
    });
    return Promise.resolve(
        Triple.fromEdgeAndSourceAndDestinationVertex(
            newEdge,
            vertex,
            newVertex
        )
    )
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
api.setShareLevel = function (shareLevel, vertex) {
    return Service.geApi().post(
        vertex.getUri() + "/shareLevel",
        {
            shareLevel: shareLevel
        }
    );
};
api.setCollectionShareLevel = function (shareLevel, vertices) {
    return Service.api().post(
        IdUri.vertexBaseUri() + '/collection/share-level',
        {
            shareLevel: shareLevel,
            verticesUri: verticesUriFromVertices(vertices)
        }
    );
};
api.makeCollectionPrivate = function (vertices) {
    return Service.api().delete(
        IdUri.vertexBaseUri() + '/collection/public_access',
        {data: verticesUriFromVertices(vertices)}
    );
};
api.makeCollectionPublic = function (vertices) {
    return Service.api().post(
        IdUri.vertexBaseUri() + '/collection/public_access',
        verticesUriFromVertices(vertices)
    );
};

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


function verticesUriFromVertices(vertices) {
    return vertices.map(function (vertex) {
        return vertex.getUri();
    });
}
