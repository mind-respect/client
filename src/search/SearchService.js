/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import WikidataService from '@/wikidata/WikidataService'
import UserService from '@/service/UserService'
import Service from '@/Service'
import SearchResult from '@/search/SearchResult'
import CurrentSubGraph from "@/graph/CurrentSubGraph";

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
api.ownTagsOnly = function (term, nbSkip) {
    return resultsFromProviders([
        api.searchForAllOwnResources(term, nbSkip)
    ]);
};
api.searchForAllOwnResources = function (searchText, nbSkip) {
    let providers = [
        api._searchForAllOwnResources(searchText, nbSkip)
    ];
    if (!nbSkip && CurrentSubGraph.get()) {
        providers.push(
            api._searchForResourcesOnThisMap(searchText)
        );
    }
    return resultsFromProviders(providers);
};
api._searchForAllOwnResources = function (searchText, nbSkip) {
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

api._searchForResourcesOnThisMap = function (searchText) {
    return Promise.resolve(
        CurrentSubGraph.get().getGraphElements().filter((graphElement) => {
            return !graphElement.isGroupRelation() && graphElement.getLabel().indexOf(searchText) > -1;
        }).map((graphElement) => {
            return {
                uri: graphElement.getUri(),
                url: graphElement.uri().absoluteUrl(),
                label: graphElement.getLabel(),
                description: graphElement.getComment(),
                isCenter: false,
                getImageUrl: (searchResult) => {
                    let graphElement = searchResult.original.getGraphElement();
                    if (!graphElement.hasImages()) {
                        return Promise.resolve(undefined);
                    }
                    return Promise.resolve(
                        graphElement.getImages()[0].getBase64ForSmall()
                    )
                },
                original: SearchResult.fromGraphElement(
                    graphElement
                ),
                source: "mindrespect.com"
            };
        })
    );
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
    let seen = new Set();
    providers.forEach((provider) => {
        provider.then((results) => {
            allResults = allResults.concat(results.filter((result) => {
                if (seen.has(result.uri)) {
                    return false;
                } else {
                    seen.add(result.uri);
                    return true;
                }
            }));
        })
    });
    return Promise.all(providers).then(() => {
        return allResults;
    });
}

export default api;
