/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

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

export default api;
