/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'

const api = {};
api.updateLabel = function (friendlyResource, label) {
    return $.ajax({
        type: 'POST',
        url: friendlyResource.getUri() + '/label',
        data: JSON.stringify({content: label}),
        contentType: 'application/json;charset=utf-8'
    });
};
api.remove = function (friendlyResource, callback) {
    return $.ajax({
        type: 'DELETE',
        url: friendlyResource.getUri()
    }).then(callback);
};
export default api;
