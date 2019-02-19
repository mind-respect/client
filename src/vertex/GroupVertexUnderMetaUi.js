/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import VertexUi from '@/vertex/VertexUi'
import GraphElementType from '@/graph-element/GraphElementType'

const api = {};
VertexUi.buildCommonConstructors(api);
api.getWhenEmptyLabel = VertexUi.getWhenEmptyLabel;
api.createFromHtml = function (html) {
    var vertex = new GroupVertexUnderMetaUi().init(
        html
    );
    api.initCache(
        vertex
    );
    VertexUi.initCache(
        vertex
    );
    return vertex;
};

function GroupVertexUnderMetaUi() {
}

GroupVertexUnderMetaUi.prototype = new VertexUi.VertexUi();
GroupVertexUnderMetaUi.prototype.init = function (html) {
    this.html = html;
    VertexUi.VertexUi.apply(this, [html]);
    VertexUi.VertexUi.prototype.init.call(
        this
    );
    return this;
};
GroupVertexUnderMetaUi.prototype.getGraphElementType = function () {
    return GraphElementType.GroupVertexUnderMeta;
};
GroupVertexUnderMetaUi.prototype.hasHiddenRelations = function () {
    return false;
};
GroupVertexUnderMetaUi.prototype.getNumberOfHiddenRelations = function () {
    return this.getNumberOfChildEvenIfHidden();
};

export default api;
