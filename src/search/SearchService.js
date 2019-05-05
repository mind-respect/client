/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import WikidataService from '@/wikidata/WikidataService'
import UserService from '@/service/UserService'
import Service from '@/Service'
import SearchResult from '@/search/SearchResult'

const api = {};
api.tags = function (term) {
    return resultsFromProviders([
        api.searchForAllOwnResources(term),
        WikidataService.search(term),
    ])
};
api.searchForAllOwnResources = function (searchText) {
    return Service.api().post(
        UserService.currentUserUri() + "/search/own_all_resource/auto_complete",
        {
            "searchText": searchText
        }
    ).then((response) => {
        return response.data.map((searchResult) => {
            let facade = SearchResult.fromServerFormat(searchResult);
            let graphElement = facade.getGraphElement();
            return {
                uri: graphElement.getUri(),
                url: searchResult.url,
                label: graphElement.getLabel(),
                description: graphElement.getComment(),
                getImageUrl: (searchResult) => {
                    let graphElement = searchResult.original.getGraphElement();
                    if (!graphElement.hasImages()) {
                        return Promise.resolve(undefined);
                    }
                    return Promise.resolve(
                        graphElement.getImages()[0].getBase64ForSmall()
                    )
                },
                original: facade,
                source: "mindrespect.com"
            }
        });
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
