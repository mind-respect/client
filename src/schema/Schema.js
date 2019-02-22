/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import GraphElement from '@/graph-element/GraphElement'
import GraphElementType from '@/graph-element/GraphElementType'

const api = {};
api.fromServerFormat = function (serverFormat) {
    return new Schema(
        serverFormat
    );
};

api.fromSearchResult = function (searchResult) {
    searchResult.friendlyResource = searchResult.graphElement.friendlyResource;
    return new Schema(
        searchResult
    );
};
api.fromServerList = function (serverFormatList) {
    var schemas = [];
    $.each(serverFormatList, function () {
        schemas.push(
            new Schema(this)
        );
    });
    return schemas;
};

function Schema(schemaServerFormat) {
    this.schemaServerFormat = schemaServerFormat;
    this._properties = this._buildProperties();
    GraphElement.GraphElement.apply(
        this
    );
    this.init(
        schemaServerFormat.graphElement
    );
}

Schema.prototype = new GraphElement.GraphElement();

Schema.prototype.getGraphElementType = function () {
    return GraphElementType.Schema;
};

Schema.prototype.getProperties = function () {
    return this._properties;
};
Schema.prototype._buildProperties = function () {
    var properties = {};
    if (!this.schemaServerFormat.properties) {
        return properties;
    }
    $.each(this.schemaServerFormat.properties, function () {
        var property = GraphElement.fromServerFormat(this);
        properties[property.getUri()] = property;
    });
    return properties;
};
Schema.prototype.getPropertiesName = function () {
    var propertiesName = [];
    $.each(this.getProperties(), function () {
        propertiesName.push(this.getLabel());
    });
    return propertiesName;
};
Schema.prototype.hasProperties = function () {
    return this.getProperties().length > 0;
};
Schema.prototype.isPublic = function () {
    return true;
};
export default api;
