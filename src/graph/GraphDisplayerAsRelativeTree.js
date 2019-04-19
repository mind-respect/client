/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'
import GroupRelationController from '@/group-relation/GroupRelationController'
import EdgeController from '@/edge/EdgeController'
import GraphController from '@/graph/GraphController'
import AppController from '@/AppController'
import MetaController from '@/identifier/MetaController'
import GroupVertexUnderMetaController from '@/identifier/GroupVertexUnderMetaController'
import MetaRelationController from '@/identifier/MetaRelationController'
import GraphElementController from '@/graph-element/GraphElementController'
import SchemaController from '@/schema/SchemaController'
import PropertyController from '@/property/PropertyController'
import SuggestionVertexController from '@/suggestion/SuggestionVertexController'
import SuggestionRelationController from '@/suggestion/SuggestionRelationController'
const api = {};

api.name = function () {
    return "relative_tree";
};

api.getVertexMenuHandler = function () {
    return VertexController;
};
api.getRelationMenuHandler = function () {
    return EdgeController;
};
api.getGroupRelationMenuHandler = function () {
    return GroupRelationController;
};
api.getSchemaMenuHandler = function () {
    return SchemaController;
};
api.getPropertyMenuHandler = function () {
    return PropertyController;
};
api.getGraphElementMenuHandler = function () {
    return GraphElementController;
};
api.getGraphMenuHandler = function () {
    return GraphController;
};
api.getAppController = function () {
    return AppController;
};
api.getMetaController = function () {
    return MetaController;
};
api.getGroupVertexUnderMetaController = function () {
    return GroupVertexUnderMetaController;
};
api.getMetaRelationController = function () {
    return MetaRelationController;
};
api.getVertexSuggestionController = function () {
    return SuggestionVertexController;
};
api.getRelationSuggestionMenuHandler = function () {
    return SuggestionRelationController;
};

export default api;
