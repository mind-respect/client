/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Vertex from '@/vertex/Vertex'
import I18n from '@/I18n'
import GraphElementType from '@/graph-element/GraphElementType'

const api = {};
api.getWhenEmptyLabel = function () {
    return I18n.i18next.t("tag:default");
};
api.withUri = function (uri) {
    let meta = new Meta().init(
        uri
    );
    return meta;
};

function Meta() {
}

Meta.prototype = new Vertex.Vertex();
Meta.prototype.init = function (uri) {
    this.uri = uri;
    Vertex.Vertex.apply(this);
    Vertex.Vertex.prototype.init.call(
        this,
        Vertex.buildServerFormatFromUri(uri)
    );
    return this;
};
Meta.prototype.getGraphElementType = function () {
    return GraphElementType.Meta;
};
Meta.prototype.hasHiddenRelations = function () {
    return false;
};
Meta.prototype.getNumberOfHiddenRelations = function () {
    return 0;
};

Meta.prototype.wikipediaLinksInLabelButtonContent = function () {
    var list = $("<ul class='list-group'>");
    this.getModel().getWikipediaLink().then(function (link) {
        list.append(
            $("<a class='list-group-item'>").attr(
                "href",
                link.link
            ).attr(
                "target",
                "_blank"
            ).append(
                $("<i>").addClass(
                    "fa fa-wikipedia-w pull-right"
                )
            ).append(
                $("<span>").text(link.label)
            ).mousedown(function () {
                window.open($(this).attr("href"), "_blank");
            })
        );
    });
    return list;
};

export default api;
