/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'

const api = {};

function GroupVertexUnderMetaController(vertices) {
    this.vertices = vertices;
    VertexController.VertexController.prototype.init.call(
        this,
        this.vertices
    );
}

GroupVertexUnderMetaController.prototype = new VertexController.VertexController();
api.GroupVertexUnderMetaController = GroupVertexUnderMetaController;

export default api;
