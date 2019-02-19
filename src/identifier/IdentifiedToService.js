/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import UserService from '@/service/UserService'
import SearchResult from '@/search/SearchResult'

const api = {};
api.getForIdentification = function (identification) {
    var deferred = $.Deferred();
    $.ajax({
        type: 'GET',
        url: getBaseUri() + encodeURIComponent(identification.getExternalResourceUri())
    }).then(function (searchResultsServerFormat) {
        deferred.resolve(
            SearchResult.fromServerFormatArray(
                searchResultsServerFormat
            )
        );
    });
    return deferred.promise();
};
export default api;

function getBaseUri() {
    return UserService.currentUserUri() + "/identification/";
}

