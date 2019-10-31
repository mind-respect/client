/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import WikidataService from '@/wikidata/WikidataService'
import UserService from '@/service/UserService'
import Service from '@/Service'
import SearchResult from '@/search/SearchResult'

const api = {};
api.tags = function (term, nbSkip) {
    let providers = [
        api.searchForAllOwnResources(term, nbSkip)
    ];
    if (!nbSkip) {
        providers.push(
            WikidataService.search(term)
        );
    }
    return resultsFromProviders(providers);
};
api.searchForAllOwnResources = function (searchText, nbSkip) {
    return Service.api().post(
        UserService.currentUserUri() + "/search/own_all_resource/auto_complete",
        {
            "searchText": searchText,
            nbSkip: nbSkip
        }
    ).then((response) => {
        return formattedOwnResults(response.data)
    });
};

api.ownVertices = function (searchText, nbSkip) {
    return Service.api().post(
        UserService.currentUserUri() + "/search/own_vertices/auto_complete",
        {
            "searchText": searchText,
            nbSkip: nbSkip
        }
    ).then((response) => {
        return formattedOwnResults(response.data);
    });
};

function formattedOwnResults(results) {
    return results.map((searchResult) => {
        let facade = SearchResult.fromServerFormat(searchResult);
        let graphElement = facade.getGraphElement();
        return {
            uri: graphElement.getUri(),
            url: searchResult.url,
            label: graphElement.getLabel(),
            description: graphElement.getComment(),
            isCenter: facade.getNbVisits() > 0,
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
}

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

export default api;
