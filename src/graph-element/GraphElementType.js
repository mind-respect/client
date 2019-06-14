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

api.GraphElementType = function (type) {
    this.type = type;
};

api.GraphElementType.prototype.isEdge = function () {
    return api.isEdgeType(this.type);
};

api.GraphElementType.prototype.isVertex = function () {
    return api.Vertex === this.type;
};

api.GraphElementType.prototype.isEdge = function () {
    return api.isEdgeType(this.type);
};


api.GraphElementType.prototype.isRelation = function () {
    return api.Relation === this.type;
};

api.GraphElementType.prototype.isGroupRelation = function () {
    return api.GroupRelation === this.type;
};

api.GraphElementType.prototype.isMeta = function () {
    return api.Meta === this.type;
};


api.GraphElementType.prototype.isVertexType = function () {
    return api.isVertexType(
        this.type
    );
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
