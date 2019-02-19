/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import GraphElementController from '@/graph-element/GraphElementController'
import MetaService from '@/identifier/MetaService'
import GraphDisplayer from '@/graph/GraphDisplayer'

const api = {};

function MetaController(metas) {
    this.metas = metas;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.metas
    );
}

MetaController.prototype = new GraphElementController.GraphElementController();

MetaController.prototype.identifyCanDo = function () {
    return false;
};

MetaController.prototype.identifyCanShowInLabel = function () {
    return $.Deferred().resolve(
        false
    );
};

MetaController.prototype.identifyWhenManyCanShowInLabel = function () {
    return $.Deferred().resolve(
        false
    );
};

MetaController.prototype.wikipediaLinksCanShowInLabel = function () {
    return this.getModel().getWikipediaLink().then(function (hasLink) {
        return hasLink;
    });
};


MetaController.prototype.convertToDistantBubbleWithUriCanDo = function () {
    return true;
};

MetaController.prototype.convertToDistantBubbleWithUri = function (distantTagUri) {
    if (!this.convertToDistantBubbleWithUriCanDo(distantTagUri)) {
        return $.Deferred().reject();
    }
    this.getUi().beforeConvertToDistantBubbleWithUri();
    return MetaService.mergeTo(this.getModel(), distantTagUri).then(function () {
        this.getUi().mergeTo(distantTagUri);
        return GraphDisplayer.displayForMetaWithUri(
            distantTagUri
        );
    }.bind(this));
};

MetaController.prototype.mergeCanDo = function () {
    return true;
};

api.MetaController = MetaController;

export default api;
