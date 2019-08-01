/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'

const api = {};

function MetaGroupVertexController(vertices) {
    this.vertices = vertices;
    VertexController.VertexController.prototype.init.call(
        this,
        this.vertices
    );
}

MetaGroupVertexController.prototype = new VertexController.VertexController();

MetaGroupVertexController.prototype.addChildCanDo = function () {
    return false;
};

MetaGroupVertexController.prototype.addSiblingCanDo = function () {
    return false;
};

MetaGroupVertexController.prototype.removeCanDo = function () {
    return false;
};

MetaGroupVertexController.prototype.mergeCanDo = function () {
    return false;
};

api.MetaGroupVertexController = MetaGroupVertexController;

export default api;
