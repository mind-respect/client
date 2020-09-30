/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'
import GroupRelationController from '@/group-relation/GroupRelationController'
import RelationController from '@/relation/RelationController'
import GraphController from '@/graph/GraphController'
import AppController from '@/AppController'
import MetaController from '@/tag/TagVertexController'
import GraphElementController from '@/graph-element/GraphElementController'
import MetaGroupVertexController from '@/tag/TagGroupVertexController'
import Tag from "@/tag/Tag";

const api = {};

api.name = function () {
    return "relative_tree";
};

api.getVertexMenuHandler = function () {
    return VertexController;
};
api.getRelationMenuHandler = function () {
    return RelationController;
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

api.getMetaGroupVertexController = function () {
    return MetaGroupVertexController;
};

api.getTagApi = function () {
    return Tag;
};

export default api;
