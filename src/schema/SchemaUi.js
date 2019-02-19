/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import RelativeTreeVertex from '@/vertex/RelativeTreeVertex'
import VertexUi from '@/vertex/VertexUi'
import GraphElementUi from '@/graph-element/GraphElementUi'

const api = {};
RelativeTreeVertex.buildCommonConstructors(api);
api.createFromHtml = function (html) {
    var schema = new api.Self(
        html
    );
    api.initCache(schema);
    RelativeTreeVertex.initCache(
        schema
    );
    VertexUi.initCache(
        schema
    );
    return schema;
};
api.get = function () {
    return api.withHtml(
        $(".schema.vertex")
    );
};
api.getWhenEmptyLabel = function () {
    return $.t("schema.when-empty");
};
api.Self = function (html) {
    this.html = html;
    RelativeTreeVertex.RelativeTreeVertex.apply(this);
    this.init(html);
};
api.Self.prototype = new RelativeTreeVertex.RelativeTreeVertex();
api.Self.prototype.getGraphElementType = function () {
    return GraphElementUi.Types.Schema;
};

export default api;
