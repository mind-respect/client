/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import UserService from '@/service/UserService'
import WikidataService from '@/wikidata/WikidataService'
import axios from 'axios'
import jsonpAdapter from "axios-jsonp";

const api = {};
api.tags = function (term) {
    return resultsFromProviders([
        WikidataService.search(term)
    ])
};
api.searchForAllOwnResources = function (searchText) {
    return axios({
        url: UserService.currentUserUri() + "/search/own_all_resource/auto_complete",
        method: 'POST',
        data: {
            "searchText": searchText
        },
        adapter: jsonpAdapter,
    }).then((response) => {
        return response.data.search.map((searchResult) => {
            return {
                uri: searchResult.concepturi,
                url: searchResult.url,
                label: searchResult.label,
                description: searchResult.description,
                getImageUrl: WikidataService.getImageUrl,
                original: searchResult,
                source: "wikidata"
            }
        })
    }).then((searchResults) => {
        return this._searchResultsWithImageUrl(searchResults);
    });
//     return $.ajax({
//         type: 'POST',
//         data: JSON.stringify(),
//         contentType: 'application/json;charset=utf-8',
//         url:;
// }
//     ;
};
api.searchOwnTags = function (searchText) {
    return $.ajax({
        type: 'POST',
        data: JSON.stringify({
            "searchText": searchText
        }),
        contentType: 'application/json;charset=utf-8',
        url: UserService.currentUserUri() +
            "/search/own_tags/auto_complete"
    });
};

function resultsFromProviders(providers) {
    let allResults = [];
    providers.forEach((provider) => {
        provider.then((results) => {
            allResults = allResults.concat(results);
        })
    });
    return Promise.all(providers).then(() => {
        return allResults;
    });
}

api.searchForOwnVerticesAndPublicOnes = function (searchText, successCallback) {
    return api.searchForOwnVerticesAndPublicOnesAjaxCall(
        searchText
    ).then(successCallback);
};
api.searchForOwnVerticesOnly = function (searchText, successCallback) {
    return api.searchForOwnVerticesOnly(
        searchText
    ).then(successCallback);
};
api.searchForOnlyOwnVerticesAjaxCall = function (searchText) {
    return $.ajax({
        type: 'POST',
        data: JSON.stringify({
            "searchText": searchText
        }),
        contentType: 'application/json;charset=utf-8',
        url: UserService.currentUserUri() +
            "/search/own_vertices/auto_complete"
    });
};

api.searchForOnlyOwnTagsAjaxCall = function (searchText) {
    return $.ajax({
        type: 'POST',
        data: JSON.stringify({
            "searchText": searchText
        }),
        contentType: 'application/json;charset=utf-8',
        url: UserService.currentUserUri() +
            "/search/own_tags/auto_complete"
    });
};
api.searchForOnlyOwnVerticesAndSchemasAjaxCall = function (searchText) {
    return $.ajax({
        type: 'POST',
        data: JSON.stringify({
            "searchText": searchText
        }),
        contentType: 'application/json;charset=utf-8',
        url: UserService.currentUserUri() +
            "/search/own_vertices_and_schemas/auto_complete"
    });
};
api.searchForOwnVerticesAndPublicOnesAjaxCall = function (searchText) {
    return $.ajax({
        type: 'POST',
        data: JSON.stringify({
            "searchText": searchText
        }),
        contentType: 'application/json;charset=utf-8',
        url: UserService.currentUserUri() +
            "/search/vertices/auto_complete"
    });
};
api.searchForOwnRelationsAjaxCall = function (searchText) {
    return $.ajax({
        type: 'POST',
        data: JSON.stringify({
            "searchText": searchText
        }),
        contentType: 'application/json;charset=utf-8',
        url: UserService.currentUserUri() +
            "/search/relations/auto_complete"
    });
};
api.getSearchResultDetails = function (uri, callback) {
    return api.getSearchResultDetailsAjaxCall(
        uri
    ).then(
        callback
    );
};
api.getSearchResultDetailsAjaxCall = function (uri) {
    var baseUri = UserService.hasCurrentUser() ?
        UserService.currentUserUri() + "/search/" :
        "/service/search/";
    return $.ajax({
        type: 'GET',
        url: baseUri +
            "details?uri=" + uri
    });
};
api.searchForPublicVerticesAndSchemasAjaxCall = function (searchText) {
    return $.ajax({
        type: 'POST',
        data: JSON.stringify({
            "searchText": searchText
        }),
        contentType: 'application/json;charset=utf-8',
        url: "/service/search"
    });
};
export default api;
