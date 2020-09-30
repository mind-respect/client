/*
 * Copyright Vincent Blouin under the GPL License version 3
 */


let _implementation;
const api = {};
api.setImplementation = function (implementation) {
    _implementation = implementation;
};
api.name = function () {
    return _implementation.name();
};

api.getVertexMenuHandler = function () {
    return _implementation.getVertexMenuHandler();
};
api.getRelationMenuHandler = function () {
    return _implementation.getRelationMenuHandler();
};
api.getGroupRelationMenuHandler = function () {
    return _implementation.getGroupRelationMenuHandler();
};

api.getGraphElementMenuHandler = function () {
    return _implementation.getGraphElementMenuHandler();
};
api.getGraphMenuHandler = function () {
    return _implementation.getGraphMenuHandler();
};
api.getAppController = function () {
    return _implementation.getAppController();
};
api.getMetaController = function () {
    return _implementation.getMetaController();
};

api.getMetaGroupVertexController = function () {
    return _implementation.getMetaGroupVertexController();
};

api.getTagApi = function () {
    return _implementation.getTagApi();
};

export default api;