/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import WikidataService from '@/wikidata/WikidataService'
import UserService from '@/service/UserService'
import Service from '@/Service'
import SearchResult from '@/search/SearchResult'
import CurrentSubGraph from "@/graph/CurrentSubGraph";

const SearchService = {};
SearchService.tags = function (term, nbSkip) {
    let providers = [
        SearchService.searchForAllOwnResources(term, nbSkip)
    ];
    if (!nbSkip) {
        providers.push(
            WikidataService.search(term)
        );
    }
    return resultsFromProviders(providers, [
        SearchService._sortIsMindRespect,
        SearchService._sortByNbNbNeighbors,
        SearchService._sortByNbVisits
    ]);
};
SearchService.ownTagsOnly = function (term, nbSkip) {
    return resultsFromProviders([
        SearchService._ownTagsOnly(term, nbSkip)
    ], [
        SearchService._sortIsMindRespect,
        SearchService._sortByNbNbNeighbors,
        SearchService._sortByNbVisits
    ]);
};
SearchService.searchForAllOwnResources = function (searchText, nbSkip, prioritizeTags) {
    let providers = [
        SearchService._searchForAllOwnResources(searchText, nbSkip)
    ];
    if (!nbSkip && CurrentSubGraph.get()) {
        providers.push(
            SearchService._searchForResourcesOnThisMap(searchText)
        );
    }
    let sortCriterias = [
        SearchService._sortIsMindRespect,
        SearchService._sortByNbVisits,
        SearchService._sortByNbNbNeighbors
    ];
    if (prioritizeTags) {
        sortCriterias.splice(1, 0, SearchService._sortIsTag);
    }
    return resultsFromProviders(providers, sortCriterias);
};

SearchService._searchForAllOwnResources = function (searchText, nbSkip) {
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

SearchService._searchForResourcesOnThisMap = function (searchText) {
    return Promise.resolve(
        CurrentSubGraph.get().getGraphElements().filter((graphElement) => {
            return !graphElement.isGroupRelation() && graphElement.getLabel().indexOf(searchText) > -1;
        }).map((graphElement) => {
            return SearchService.searchResultFromOnMapGraphElement(graphElement);
        })
    );
};

SearchService.searchResultFromOnMapGraphElement = function (graphElement) {
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
        isOnMap: true,
        source: "mindrespect.com",
        isMindRespect: true
    };
};

SearchService.ownVertices = function (searchText, nbSkip) {
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

SearchService.ownVerticesAndAllPatterns = function (searchText, nbSkip) {
    let providers = [
        SearchService.ownVertices(searchText, nbSkip),
        SearchService._allPatternsOnly(searchText, nbSkip)
    ];
    return resultsFromProviders(providers, [
        SearchService._sortByNbVisits
    ]);
};

SearchService._allPatternsOnly = function (searchText, nbSkip) {
    return Service.api().post(
        UserService.currentUserUri() + "/search/all_patterns/auto_complete",
        {
            "searchText": searchText,
            nbSkip: nbSkip
        }
    ).then((response) => {
        return formattedOwnResults(response.data)
    });
};

SearchService._ownTagsOnly = function (searchText, nbSkip) {
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

SearchService._sortIsMindRespect = function (x, y) {
    return (x.isMindRespect === y.isMindRespect) ? 0 : x.isMindRespect ? -1 : 1;
};

SearchService._sortIsTag = function (x, y) {
    let xIsMeta = x.isMindRespect && x.original.getGraphElement().isMeta();
    let yIsMeta = y.isMindRespect && y.original.getGraphElement().isMeta();
    return (xIsMeta === yIsMeta) ? 0 : xIsMeta ? -1 : 1;
};

SearchService._sortByNbNbNeighbors = function (x, y) {
    let xNbNeighbors = x.isMindRespect ? x.original.getNbNeighbors().getTotal() : 0;
    let yNbNbNeighbors = y.isMindRespect ? y.original.getNbNeighbors().getTotal() : 0;
    return yNbNbNeighbors - xNbNeighbors;
};

SearchService._sortByNbVisits = function (x, y) {
    let xNbVisits = x.original.getNbVisits === undefined ? 0 : x.original.getNbVisits();
    let yNbVisits = y.original.getNbVisits === undefined ? 0 : y.original.getNbVisits();
    return yNbVisits - xNbVisits;
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

export default SearchService;
