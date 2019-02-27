/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Service from '@/Service'

const api = {};
api.updateLabel = function (friendlyResource) {
    Service.geApi().post(
        friendlyResource.getUri() + '/label',
        {
            content: friendlyResource.getLabel()
        }
    );
};
api.remove = function (friendlyResource, callback) {
    return $.ajax({
        type: 'DELETE',
        url: friendlyResource.getUri()
    }).then(callback);
};
export default api;
