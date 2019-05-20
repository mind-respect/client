/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/Service'

const api = {};
api.updateLabel = function (friendlyResource) {
    return Service.geApi().post(
        friendlyResource.getUri() + '/label',
        {
            content: friendlyResource.getLabel()
        }
    );
};
export default api;
