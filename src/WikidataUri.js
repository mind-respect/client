/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import MD5 from 'md5'

const WikidataUri = {
    BASE_URL: "//www.wikidata.org",
    WIKIPEDIA_ARTICLE_BASE_URL: "//www.wikipedia.org/wiki/",
    idInWikidataUri: function (uri) {
        return uri.substr(
            uri.lastIndexOf("/") + 1
        );
    },
    isAWikidataUri: function (uri) {
        return uri.indexOf("wikidata.org") !== -1;
    },
    isAWikidataImageUrl: function (uri) {
        return uri.indexOf("wikimedia.org") !== -1;
    },
    thumbUrlForImageName: function (imageName) {
        return api._getImageUrlAtSizeInPixelsFromImageName(
            60,
            imageName
        );
    },
    _getImageUrlAtSizeInPixelsFromImageName: function (size, imageName) {
        imageName = replaceWhiteSpace(imageName);
        var md5 = MD5(imageName);
        var firstChar = md5[0];
        var firstAndSecondChar = firstChar + md5[1];
        imageName = replaceParenthesis(
            encodeURIComponent(
                imageName
            )
        );
        return "//upload.wikimedia.org/wikipedia/commons/thumb/" + firstChar + "/" + firstAndSecondChar + "/" +
            imageName + "/" +
            size + "px-" +
            imageName;
    },
    get600pxUrlFromRawUrl: function (rawImageUrl) {
        return api._getImageUrlAtSizeInPixelsFromImageName(
            600,
            api._getImageNameFromRawUrl(
                rawImageUrl
            )
        );
    },
    _getImageNameFromRawUrl: function (rawImageUrl) {
        return rawImageUrl.substr(
            rawImageUrl.lastIndexOf("/") + 1
        );
    },
    rawImageUrlFromThumbUrl: function (thumbUrl) {
        thumbUrl = thumbUrl.replace("thumb/", "");
        return thumbUrl.substr(0, thumbUrl.lastIndexOf("/"));
    }
};

function replaceWhiteSpace(imageName) {
    return imageName.replace(/ /g, "_");
}

function replaceParenthesis(imageName) {
    return imageName.replace(/\(/g, "%28").replace(/\)/g, "%29");
}

export default WikidataUri;
