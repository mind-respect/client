/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import IdUri from '@/IdUri'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import Service from '@/Service'
import UserService from "@/service/UserService";

const api = {};

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

api.createFromSourceAndDestinationUri = function (sourceUri, destinationUri) {
    let sourceVertexUriFormatted = encodeURIComponent(
        sourceUri
    );
    let destinationVertexUriFormatted = encodeURIComponent(
        destinationUri
    );
    return Service.api().post(
        edgesUrl() + '?sourceVertexId=' + sourceVertexUriFormatted +
        '&destinationVertexId=' + destinationVertexUriFormatted
    ).then((response) => {
        return IdUri.removeDomainNameFromGraphElementUri(
            response.headers.location
        );
    });
};

export default api;

function edgesUrl() {
    return UserService.currentUserUri() + "/graph/edge";
}

