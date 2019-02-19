/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import Wikidata from '@/Wikidata'
import WikidataUri from '@/WikidataUri'
import I18n from '@/I18n'

const api = {};
api.build = function () {
    return new WikiDataAutocompleteProvider();
};
api.buildWithIsActiveCondition = function (isActiveCondition) {
    return new WikiDataAutocompleteProvider(isActiveCondition);
};
export default api;

function WikiDataAutocompleteProvider(isActiveCondition) {
    var self = this;
    this.isActiveCondition = isActiveCondition;
    this.getFetchMethod = function (searchTerm) {
        var url = WikidataUri.BASE_URL + "/w/api.php?action=wbsearchentities&language=" +
            I18n.getLocale() +
            "&uselang=" + I18n.getLocale() +
            "&format=json&search=" +
            searchTerm;
        return $.ajax({
            type: 'GET',
            dataType: "jsonp",
            url: url
        });
    };
    this.formatResults = function (searchResults) {
        return $.map(searchResults.search, function (searchResult) {
            var format = {
                nonFormattedSearchResult: searchResult,
                comment: searchResult.description,
                label: searchResult.match.text,
                value: searchResult.match.text,
                source: "Wikidata.org",
                uri: searchResult.url,
                provider: self
            };
            format.somethingToDistinguish = searchResult.description;
            return format;
        });
    };
    this.getMoreInfoForSearchResult = function (searchResult) {
        var deferred = $.Deferred();
        Wikidata.getImageForWikidataUri(searchResult.uri).then(function (image) {
            deferred.resolve({
                    conciseSearchResult: searchResult,
                    title: searchResult.label,
                    text: searchResult.somethingToDistinguish,
                    image: image
                }
            );
        }).fail(function () {
            deferred.resolve({
                    conciseSearchResult: searchResult,
                    title: searchResult.label,
                    text: searchResult.somethingToDistinguish
                }
            );
        });
        return deferred.promise();
    };
    this.isActive = function (bubble) {
        return this.isActiveCondition ?
            this.isActiveCondition() :
            bubble && bubble.getModel().isPublic();
    };
}
