/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Identification from '@/identifier/Identification'
import EventBus from '@/EventBus'
import Service from '@/Service'

const api = {};
api.addIdentification = function (graphElement, identification) {
    return EventBus.executeAfterEvent(
        '/event/ui/graph/before/identification/added',
        add,
        [graphElement, identification]
    );

    function add() {
        var deferred = $.Deferred();
        $.ajax({
            type: 'POST',
            url: graphElement.getUri() + '/identification',
            data: identification.getJsonFormat(),
            contentType: 'application/json;charset=utf-8'
        }).then(function (serverIdentifications) {
            deferred.resolve(
                Identification.fromMultipleServerFormat(
                    serverIdentifications,
                    identification.getRelationExternalResourceUri()
                )
            );
        });
        return deferred.promise();
    }
};
api.removeIdentifier = function (graphElement, identification) {
    return $.ajax({
        type: 'DELETE',
        url: graphElement.getUri() + '/identification?uri=' + identification.getUri()
    });
};
api.updateNote = function (graphElement) {
    return Service.geApi().post(
        graphElement.getUri() + '/comment',
        graphElement.getComment(),
        {headers: {"Content-Type": "text/plain"}}
    );
};
api.changeSortDate = function (graphElement) {
    return $.ajax({
        type: 'PUT',
        url: graphElement.getUri() + "/sort",
        data: JSON.stringify({
            sortDate: graphElement.getSortDate().getTime(),
            moveDate: graphElement.getMoveDate().getTime()
        }),
        contentType: 'application/json;charset=utf-8'
    });
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
