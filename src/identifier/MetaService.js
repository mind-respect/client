/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Identification from '@/identifier/Identification'
import IdUri from '@/IdUri'

const api = {};
api.getForUri = function (uri) {
    return $.ajax({
        type: 'GET',
        url: uri,
        contentType: 'application/json;charset=utf-8'
    }).then(function (serverFormat) {
        return Identification.fromServerFormat(
            serverFormat
        );
    });
};

api.mergeTo = function (identifier, distantTagUri) {
    return $.ajax({
        type: 'POST',
        url: identifier.getUri() + '/mergeTo/' + IdUri.getGraphElementShortIdFromUri(
            distantTagUri
        ),
        dataType: 'json'
    });
};

export default api;
