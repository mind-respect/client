/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElement from '@/graph-element/GraphElement'

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new Property(
        serverFormat
    );
};

function Property(propertyServerFormat) {
    GraphElement.GraphElement.apply(
        this
    );
    this.init(
        propertyServerFormat
    );
}

Property.prototype = new GraphElement.GraphElement();

Property.prototype.setSchema = function (schema) {
    this.schema = schema;
};
Property.prototype.getSchema = function () {
    return this.schema;
};
Property.prototype.isPublic = function () {
    return true;
};
export default api;
