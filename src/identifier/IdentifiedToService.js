/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Service from '@/Service'
import UserService from '@/service/UserService'
import SearchResult from '@/search/SearchResult'

const api = {};
api.getForIdentification = function (identification) {
    return Service.geApi().get(
        getBaseUri() + encodeURIComponent(identification.getExternalResourceUri())
    ).then((response) => {
        SearchResult.fromServerFormatArray(
            response.data
        )
    })
};
export default api;

function getBaseUri() {
    return UserService.currentUserUri() + "/identification/";
}

