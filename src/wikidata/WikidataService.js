import axios from 'axios'
import WikidataUri from '@/wikidata/WikidataUri'
import I18n from '@/I18n'
import Image from '@/image/Image'

const wikipediaUrlProperty = "P373";
const WikidataService = {};
WikidataService.search = function (term) {
    let url = WikidataUri.BASE_URL + "/w/api.php?action=wbsearchentities&language=" + I18n.getLocale() +
        "&uselang=" + I18n.getLocale() +
        "&format=json&search=" +
        term;
    return axios({
        url: url
    }).then((response) => {
        return response.data.search.map((searchResult) => {
            return {
                uri: searchResult.concepturi,
                url: searchResult.url,
                label: searchResult.label,
                description: searchResult.description,
                getImageUrl: WikidataService.getImageUrl,
                original: searchResult,
                source: "wikidata",
                isCenter: false
            }
        })
    });
};

WikidataService.getWikipediaUrlFromWikidataUri = function (wikidataUri) {
    let apiUrlToGetWikipediaUrl = WikidataUri.BASE_URL + "/w/api.php?action=wbgetclaims&entity=" + WikidataUri.idInWikidataUri(
        wikidataUri
    ) + "&property=" + wikipediaUrlProperty + "&format=json";
    return axios({
        url: apiUrlToGetWikipediaUrl,
        adapter: jsonpAdapter,
    }).then(function (response) {
        let path;
        if (response.data.claims) {
            path = response.data.claims[wikipediaUrlProperty];
        }
        if (path === undefined || path.length === 0) {
            return Promise.resolve(
                wikidataUri
            );
        }
        return Promise.resolve(
            WikidataUri.WIKIPEDIA_ARTICLE_BASE_URL + path[0].mainsnak.datavalue.value
        );
    });
},

    WikidataService.getImageUrl = function (searchResult) {
        let url = WikidataUri.BASE_URL + "/w/api.php?action=wbgetentities&ids=" +
            searchResult.original.id + "&props=claims&format=json";
        return axios({
            method: "get",
            url: url,
            adapter: jsonpAdapter,
        }).then(function (response) {
            return imageUrlFromSearchResult(
                response.data,
                searchResult.original.id
            );
        });
    };

WikidataService._searchResultsWithImageUrl = function (searchResults) {
    let ids = searchResults.map((searchResult) => {
        return searchResult.original.id;
    });
    let url = WikidataUri.BASE_URL + "/w/api.php?action=wbgetentities&ids=" +
        ids.join("|") + "&props=claims&format=json";
    return axios({
        method: "get",
        url: url,
        adapter: jsonpAdapter,
    }).then(function (response) {
        return searchResults.map((searchResult) => {
            searchResult.imageUrl = imageUrlFromSearchResult(
                response.data,
                searchResult.original.id
            );
            return searchResult;
        });
    })
};

function imageUrlFromSearchResult(result, wikidataId) {
    let claims = result.entities[wikidataId].claims;
    if (claims === undefined) {
        return;
    }
    let imageRelation = claims.P18;
    if (imageRelation === undefined) {
        return;
    }
    let imageName = imageRelation[0].mainsnak.datavalue.value;
    return Image.withUrlForSmallAndBig(
        WikidataUri.thumbUrlForImageName(imageName),
        WikidataUri.bigUrlForImageName(imageName)
    );
}

export default WikidataService;