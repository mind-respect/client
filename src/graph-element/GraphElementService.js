/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/Service'

const api = {};

api.updateNote = function (graphElement) {
    return Service.geApi().post(
        graphElement.getUri() + '/comment',
        graphElement.getComment(),
        {headers: {"Content-Type": "text/plain"}}
    );
};

api.changeChildrenIndex = function (graphElement) {
    let childrenIndex = graphElement.buildChildrenIndex();
    return Service.geApi().post(
        graphElement.getUri() + "/childrenIndex",
        childrenIndex
    ).then(function () {
        graphElement.setChildrenIndex(childrenIndex)
    })
};
export default api;
