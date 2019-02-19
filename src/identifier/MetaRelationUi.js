/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import I18n from '@/I18n'
import TreeEdge from '@/edge/TreeEdge'
import GraphElementType from '@/graph-element/GraphElementType'

const api = {};
TreeEdge.buildCommonConstructors(api);
api.createFromHtml = function (html) {
    var property = new api.MetaUiRelation(html);
    api.initCache(property);
    return property;
};
api.getWhenEmptyLabel = function () {
    return $.t("meta_relation.default");
};
api.MetaUiRelation = function (html) {
    this.html = html;
    TreeEdge.TreeEdge.apply(this);
    this.init(this.html);
};
api.MetaUiRelation.prototype = new TreeEdge.TreeEdge();
api.MetaUiRelation.prototype.getGraphElementType = function () {
    return GraphElementType.MetaRelation;
};
export default api;
