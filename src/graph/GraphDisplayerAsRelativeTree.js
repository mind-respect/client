/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'
import GroupRelationController from '@/group-relation/GroupRelationController'
import EdgeController from '@/edge/EdgeController'
import GraphController from '@/graph/GraphController'
import AppController from '@/AppController'
import MetaController from '@/identifier/MetaController'
import GraphElementController from '@/graph-element/GraphElementController'
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

export default api;
