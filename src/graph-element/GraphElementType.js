/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
const api = {
    "Vertex": "vertex",
    "Relation": "relation",
    "GroupRelation": "group_relation",
    "Schema": "schema",
    "Property": "property",
    "VertexSuggestion": "vertex_suggestion",
    "RelationSuggestion": "relation_suggestion",
    "Meta": "meta",
    "MetaRelation": "meta_relation",
    "GroupVertexUnderMeta": "group_vertex_under_meta"
};

api.Fork = [
    api.Vertex, api.GroupRelation
];

api.GraphElementType = function (type) {
    this.type = type;
    this._isEdge = api.isEdge(type);
    this._isRelation = api.isRelation(type);
    this._isGroupRelation = api.isGroupRelation(type)
    this._isVertex = api.isVertex(type);
    this._isVertexType = api.isVertexType(type);
    this._isMeta = api.isMeta(type);
};

api.GraphElementType.prototype.isEdge = function () {
    return this._isEdge;
};

api.GraphElementType.prototype.isRelation = function () {
    return this._isRelation;
};

api.GraphElementType.prototype.isGroupRelation = function () {
    return this._isGroupRelation;
};

api.GraphElementType.prototype.isVertex = function () {
    return this._isVertex;
};

api.GraphElementType.prototype.isVertexType = function () {
    return this._isVertexType;
};

api.GraphElementType.prototype.isMeta = function () {
    return this._isMeta;
};

api.isEdge = function (type) {
    return api.isEdgeType(type);
};

api.isRelation = function (type) {
    return api.Relation === type;
};

api.isGroupRelation = function (type) {
    return api.GroupRelation === type;
};

api.isVertex = function (type) {
    return api.Vertex === type;
};

api.isVertexType = function (type) {
    return api.isVertexType(
        type
    );
};

api.isMeta = function (type) {
    return api.Meta === type;
};

api.fromString = function (type) {
    switch (type) {
        case "edge" :
            return api.Relation;
        case "identification" :
            return api.Meta;
        default:
            return type;
    }
};
api.getVertexTypes = function () {
    return [
        api.Vertex,
        api.VertexSuggestion,
        api.Schema,
        api.Meta
    ];
};
api.getEdgeTypes = function () {
    return [
        api.Relation,
        api.Property,
        api.RelationSuggestion,
        api.MetaRelation
    ];
};
api.isEdgeType = function (type) {
    return api.getEdgeTypes().indexOf(type) > -1;
};
api.isVertexType = function (type) {
    return api.getVertexTypes().indexOf(type) > -1;
};
api.getAll = function () {
    return api.getVertexTypes().concat(
        api.getEdgeTypes()
    );
};
export default api;
