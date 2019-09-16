/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import WikidataService from '@/wikidata/WikidataService'
import UserService from '@/service/UserService'
import Service from '@/Service'
import SearchResult from '@/search/SearchResult'

const api = {};
api.tags = function (term) {
    return resultsFromProviders([
        api.searchForAllOwnResources(term).then((results) => {
            return sortForTags(results);
        }),
        WikidataService.search(term)
    ]);
};
api.searchForAllOwnResources = function (searchText) {
    return Service.api().post(
        UserService.currentUserUri() + "/search/own_all_resource/auto_complete",
        {
            "searchText": searchText
        }
    ).then((response) => {
        return sortForCenters(
            formattedOwnResults(response.data)
        );
    });
};

api.ownVertices = function (searchText) {
    return Service.api().post(
        UserService.currentUserUri() + "/search/own_vertices/auto_complete",
        {
            "searchText": searchText
        }
    ).then((response) => {
        return sortForCenters(
            formattedOwnResults(response.data)
        );
    });
};

function sortForTags(results) {
    return results.sort((a, b) => {
        let nbRefsDiff = b.original.getNumberOfReferences() - a.original.getNumberOfReferences();
        if (nbRefsDiff === 0) {
            return b.original.getNbVisits() - a.original.getNbVisits();
        }
        return nbRefsDiff;
    });
}

function sortForCenters(results) {
    return results.sort((a, b) => {
        let nbVisitsDiff = b.original.getNbVisits() - a.original.getNbVisits();
        if (nbVisitsDiff === 0) {
            return b.original.getNumberOfReferences() - a.original.getNumberOfReferences();
        }
        return nbVisitsDiff;
    });
}

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
