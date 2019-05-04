/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

const Image = {
    fromServerJson: function (imageAsServerJson) {
        return new Image.Image(
            imageAsServerJson.urlForSmall,
            imageAsServerJson.urlForBigger
        );
    },
    arrayToServerJson: function (images) {
        return images.map((image) => {
            return image.jsonFormat();
        });
    },
    arrayFromServerJson: function (imagesAsServerJson) {
        return imagesAsServerJson.map((image) => {
            return Image.fromServerJson(image)
        })
    },
    withUrlForSmallAndBig: function (urlForSmall, urlForBigger) {
        return new Image.Image(
            urlForSmall,
            urlForBigger
        );
    },
    getBase64OfExternalUrl: function (url) {
        return new Promise(function (resolve, reject) {
            let img = document.createElement('img');
            img.crossorigin = "anonymous";
            img.src = url;
            document.getElementById('drawn_graph').appendChild(img);
            img.onload = function () {
                getBase64Image(this).then((base64) => {
                    resolve(base64)
                }).catch(reject);
            };
        });
    },
    srcUrlForBase64: function (base64) {
        return "data:application/octet-stream;base64," + base64;
    }
};

Image.Image = function (urlForSmall, urlForBigger) {
    this.urlForSmall = urlForSmall;
    this.urlForBigger = urlForBigger;
};
Image.Image.prototype.isUploadedByUser = function () {
    return this.urlForBigger.indexOf(
        window.location.hostname
    ) !== -1;
};
Image.Image.prototype.getBase64ForSmall = function () {
    return api.srcUrlForBase64(this.urlForSmall);
};
Image.Image.prototype.getUrlForBigger = function () {
    return this.urlForBigger;
};
Image.Image.prototype.getUrlFor600pxOrBig = function () {
    return this.urlForBigger;
};

Image.Image.prototype.serverFormat = function () {
    return this.jsonFormat();
};
Image.Image.prototype.jsonFormat = function () {
    return {
        urlForSmall: this.urlForSmall,
        urlForBigger: this.urlForBigger
    };
};
Image.Image.prototype.isEqualTo = function (image) {
    return this.getUrlForBigger() === image.getUrlForBigger();
};

export default Image;

function getBase64Image(imgElem) {
    let canvas = document.createElement("canvas");
    canvas.width = imgElem.clientWidth;
    canvas.height = imgElem.clientHeight;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(imgElem, 0, 0);
    imgElem.crossOrigin = 'Access-Control-Allow-Origin';
    let dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
