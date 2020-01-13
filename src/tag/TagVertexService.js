/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Tag from '@/tag/Tag'
import IdUri from '@/IdUri'
import Service from '@/Service'

const api = {};
api.getForUri = function (uri) {
    return Service.geApi().get(
        uri
    ).then(function (response) {
        return Tag.fromServerFormat(
            response.data
        );
    });
};

api.mergeTo = function (identifier, distantTagUri) {
    return Service.geApi().post(
        identifier.getUri() + '/mergeTo/' + IdUri.getGraphElementShortIdFromUri(
        distantTagUri
        )
    )
};

export default api;
