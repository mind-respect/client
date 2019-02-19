/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import TreeEdge from '@/edge/TreeEdge'
import GraphElementUi from '@/graph-element/GraphElementUi'

const api = {};
TreeEdge.buildCommonConstructors(api);
api.createFromHtml = function (html) {
    var property = new api.PropertyUi(html);
    api.initCache(property);
    return property;
};
api.visitAllProperties = function (visitor) {
    api.visitAll(function (element) {
        if (element.isProperty()) {
            visitor(element);
        }
    });
};
api.getWhenEmptyLabel = function () {
    return $.t("property.when-empty");
};
api.PropertyUi = function (html) {
    this.html = html;
    TreeEdge.TreeEdge.apply(this);
    this.init(this.html);
};
api.PropertyUi.prototype = new TreeEdge.TreeEdge();
api.PropertyUi.prototype.getGraphElementType = function () {
    return GraphElementUi.Types.Property;
};
api.PropertyUi.prototype.remove = function () {
    this.html.closest(".vertex-tree-container").remove();
};
export default api;
