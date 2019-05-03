/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import WikidataUri from '@/wikidata/WikidataUri'
import Image from '@/image/Image'
import EventBus from '@/EventBus'

const wikipediaUrlProperty = "P373";

const Wikidata = {
    getImageForWikidataUri: function (wikidataUri) {
        var deferred = $.Deferred();
        var wikidataId = WikidataUri.idInWikidataUri(
            wikidataUri
        );
        var url = WikidataUri.BASE_URL + "/w/api.php?action=wbgetentities&ids=" +
            wikidataId + "&languages=en&props=claims&format=json";
        $.ajax({
            type: 'GET',
            dataType: "jsonp",
            url: url
        }).then(function (result) {
            return imageFromSearchResult(result, wikidataId);
        }).then(function (image) {
            deferred.resolve(image);
        }).fail(function () {
            deferred.reject();
        });
        return deferred.promise();
    },
    getWikipediaUrlFromWikidataUri: function (wikidataUri) {
        var apiUrlToGetWikipediaUrl = WikidataUri.BASE_URL + "/w/api.php?action=wbgetclaims&entity=" + WikidataUri.idInWikidataUri(
            wikidataUri
        ) + "&property=" + wikipediaUrlProperty + "&format=json";
        var deferred = $.Deferred();
        $.ajax({
            type: 'GET',
            dataType: "jsonp",
            url: apiUrlToGetWikipediaUrl
        }).then(function (result) {
            var path;
            if (result.claims) {
                path = result.claims[wikipediaUrlProperty];
            }
            if (path === undefined || path.length === 0) {
                deferred.resolve(
                    wikidataUri
                );
                return;
            }
            deferred.resolve(
                WikidataUri.WIKIPEDIA_ARTICLE_BASE_URL + path[0].mainsnak.datavalue.value
            );
        });
        return deferred.promise();
    },
    _beforeIdentificationAdded: function (graphElement, identification) {
        var deferred = $.Deferred();
        var isAWikidataIdentification = WikidataUri.isAWikidataUri(identification.getUri());
        if (identification.hasImages() || !isAWikidataIdentification) {
            deferred.resolve();
            return deferred.promise();
        }
        Wikidata.getImageForWikidataUri(
            identification.getUri()
        ).then(function (image) {
            if (image === undefined) {
                deferred.resolve();
                return;
            }
            identification.addImage(image);
            graphElement.addImages([image]);
            graphElement.refreshImages();
            deferred.resolve();
        }).fail(function () {
            deferred.resolve();
        });
        return deferred.promise();
    }
};
EventBus.before(
    '/event/ui/graph/before/identification/added',
    Wikidata._beforeIdentificationAdded
);

export default Wikidata;

function imageFromSearchResult(result, wikidataId) {
    var deferred = $.Deferred();
    var claims = result.entities[wikidataId].claims;
    if (claims === undefined) {
        deferred.resolve();
        return;
    }
    var imageRelation = claims.P18;
    if (imageRelation === undefined) {
        deferred.resolve();
        return;
    }
    var imageName = imageRelation[0].mainsnak.datavalue.value;
    var thumbUrl = WikidataUri.thumbUrlForImageName(imageName);
    Image.getBase64OfExternalUrl(
        thumbUrl
    ).then(function (imageBase64) {
        deferred.resolve(
            Image.withBase64ForSmallAndUrlForBigger(
                imageBase64,
                WikidataUri.rawImageUrlFromThumbUrl(thumbUrl)
            )
        );
    }).fail(function () {
        deferred.reject();
    });
    return deferred.promise();
}
