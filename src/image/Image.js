/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import WikidataUri from '@/WikidataUri'

const Image = {
    fromServerJson: function (imageAsServerJson) {
        return new Image.Image(
            imageAsServerJson.base64ForSmall,
            imageAsServerJson.urlForBigger
        );
    },
    arrayToServerJson: function (images) {
        let imagesJson = [];
        $.each(images, function () {
            imagesJson.push(
                this.jsonFormat()
            );
        });
        return imagesJson;
    },
    arrayFromServerJson: function (imagesAsServerJson) {
        var images = [];
        $.each(imagesAsServerJson, function () {
            var imageAsJson = this;
            images.push(
                Image.fromServerJson(imageAsJson)
            );
        });
        return images;
    },
    withBase64ForSmallAndUrlForBigger: function (base64ForSmall, urlForBigger) {
        return new Image.Image(
            base64ForSmall,
            urlForBigger
        );
    },
    getBase64OfExternalUrl: function (url) {
        let deferred = $.Deferred();
        let img = $("<img>")
            .attr(
                "crossOrigin",
                "Anonymous"
            ).appendTo("body").load(function () {
                    deferred.resolve(
                        getBase64Image(this)
                    );
                }
            ).error(function () {
                deferred.reject();
            }).prop(
                "src",
                url
            );
        return deferred.promise();
    },
    srcUrlForBase64: function (base64) {
        return "data:application/octet-stream;base64," + base64;
    }
};

function getBase64Image(imgElem) {
    var canvas = document.createElement("canvas");
    canvas.width = imgElem.clientWidth;
    canvas.height = imgElem.clientHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(imgElem, 0, 0);
    imgElem.crossOrigin = 'Access-Control-Allow-Origin';
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

Image.Image = function (base64ForSmall, urlForBigger) {
    var self = this;
    this.isUploadedByUser = function () {
        return self.getUrlForBigger().indexOf(
            window.location.hostname
        ) !== -1;
    };
    this.getBase64ForSmall = function () {
        return api.srcUrlForBase64(base64ForSmall);
    };
    this.getUrlForBigger = function () {
        return urlForBigger;
    };
    this.getUrlFor600pxOrBig = function () {
        if (WikidataUri.isAWikidataImageUrl(urlForBigger)) {
            return WikidataUri.get600pxUrlFromRawUrl(
                urlForBigger
            );
        }
        return urlForBigger;
    };
    this.serverFormat = function () {
        return JSON.stringify(
            self.jsonFormat()
        );
    };
    this.jsonFormat = function () {
        return {
            base64ForSmall: base64ForSmall,
            urlForBigger: self.getUrlForBigger()
        };
    };
    this.isEqualTo = function (image) {
        return self.getUrlForBigger() === image.getUrlForBigger();
    };
};

export default Image;
