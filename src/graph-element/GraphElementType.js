/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
const api = {
    "Vertex": "vertex",
    "Edge": "edge",
    "Relation": "relation",
    "GroupRelation": "groupRelation",
    "Meta": "meta",
    "MetaGroupVertex": "meta_group_vertex",
    "VertexSkeleton" : "vertexSkeleton",
    "RelationSkeleton" : "relationSkeleton",
};

api.Fork = [
    api.Vertex, api.GroupRelation, api.Meta, api.MetaGroupVertex, api.VertexSkeleton
];

api.GraphElementType = function (type) {
    this.type = type;
    this._isEdge = api.isEdge(type);
    this._isRelation = api.isRelation(type);
    this._isGroupRelation = api.isGroupRelation(type);
    this._isVertex = api.isVertex(type);
    this._isVertexType = api.isVertexType(type);
    this._isEdgeType = api.isEdgeType(type);
    this._isMeta = api.isMeta(type);
    this._isMetaGroupVertex = api.isMetaGroupVertex(type);
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

api.GraphElementType.prototype.isEdgeType = function () {
    return this._isEdgeType;
};

api.GraphElementType.prototype.isMeta = function () {
    return this._isMeta;
};

api.GraphElementType.prototype.isMetaGroupVertex = function () {
    return this._isMetaGroupVertex;
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

api.isMetaGroupVertex = function (type) {
    return api.MetaGroupVertex === type;
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
        api.Meta,
        api.MetaGroupVertex,
        api.VertexSkeleton
    ];
};
api.getEdgeTypes = function () {
    return [
        api.Relation,
        api.RelationSkeleton
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
