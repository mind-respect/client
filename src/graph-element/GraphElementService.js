/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Identification from '@/identifier/Identification'
import Service from '@/Service'

const api = {};
api.addIdentification = function (graphElement, identification) {
    return Service.geApi().post(
        graphElement.getUri() + '/identification',
        identification.getJsonFormat()
    ).then(function (response) {
        return Identification.fromMultipleServerFormat(
            response.data,
            identification.getRelationExternalResourceUri()
        );
    });
};
api.removeIdentifier = function (graphElement, identification) {
    return Service.geApi().delete(
        graphElement.getUri() + '/identification?uri=' + identification.getUri()
    )
};
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
