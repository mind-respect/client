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
    return resultsFromProviders(providers, [
        api._sortIsMindRespect,
        api._sortByNbReferences,
        api._sortByNbVisits
    ]);
};
api.ownTagsOnly = function (term, nbSkip) {
    return resultsFromProviders([
        api._ownTagsOnly(term, nbSkip)
    ], [
        api._sortIsMindRespect,
        api._sortByNbReferences,
        api._sortByNbVisits
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
    return resultsFromProviders(providers, [
        api._sortIsMindRespect,
        api._sortByNbVisits,
        api._sortByNbReferences
    ]);
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
                source: "mindrespect.com",
                isMindRespect: true
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

api._ownTagsOnly = function (searchText, nbSkip) {
    return Service.api().post(
        UserService.currentUserUri() + "/search/own_tags/auto_complete",
        {
            "searchText": searchText,
            nbSkip: nbSkip
        }
    ).then((response) => {
        return formattedOwnResults(response.data)
    });
};

api._sortIsMindRespect = function (x, y) {
    return (x.isMindRespect === y.isMindRespect) ? 0 : x.isMindRespect ? -1 : 1;
};

api._sortByNbReferences = function (x, y) {
    let xNbReferences = x.original.getNbRerences === undefined ? 0 : x.original.getNbRerences();
    let yNbReferences = y.original.getNbRerences === undefined ? 0 : y.original.getNbRerences();
    return yNbReferences - xNbReferences;
};

api._sortByNbVisits = function (x, y) {
    let xNbVisits = x.original.getNbVisits === undefined ? 0 : x.original.getNbVisits();
    let yNbVisits = y.original.getNbVisits === undefined ? 0 : y.original.getNbVisits();
    return yNbVisits- xNbVisits;
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
            source: "mindrespect.com",
            isMindRespect: true
        }
    });
}

function resultsFromProviders(providers, sortCriterias) {
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
        return allResults.sort((x, y) => {
            let sortResult = 0;
            for (let i = 0; i < sortCriterias.length && sortResult === 0; i++) {
                sortResult = sortCriterias[i](x, y);
            }
            return sortResult;
        });
    });
}

export default api;
