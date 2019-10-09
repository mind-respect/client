/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'
import Vue from "vue";
import CurrentSubGraph from "@/graph/CurrentSubGraph";
import GraphElementController from '@/graph-element/GraphElementController'
import VertexService from '@/vertex/VertexService'
import Selection from '@/Selection'
import MetaRelation from '@/identifier/MetaRelation'

const api = {};

function MetaGroupVertexController(vertices) {
    this.vertices = vertices;
    VertexController.VertexController.prototype.init.call(
        this,
        this.vertices
    );
}

MetaGroupVertexController.prototype = new VertexController.VertexController();


MetaGroupVertexController.prototype.addChild = function () {
    let addTuple = VertexService.addTuple(
        this.model()
    );
    let triple = addTuple.optimistic;
    addTuple.promise.then(() => {
        triple.edge.controller().addIdentification(
            CurrentSubGraph.get().center.getOriginalMeta(),
            true
        );
    });
    let metaRelation = new MetaRelation(triple.destination, CurrentSubGraph.get().center);
    metaRelation.setEdgeUri(triple.edge.getUri());
    this.model().addChild(
        metaRelation
    );
    this.model().refreshChildren();
    CurrentSubGraph.get().add(metaRelation);
    Vue.nextTick(() => {
        Selection.setToSingle(triple.destination);
        // GraphElementService.changeChildrenIndex(
        //     this.model()
        // );
        triple.destination.focus();
        //would need to redraw but focus hides drawing
    });
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

MetaGroupVertexController.prototype.relateToDistantVertexWithUri = function (distantVertexUri, index, isLeft) {
    return GraphElementController.GraphElementController.prototype.relateToDistantVertexWithUri.call(
        this,
        distantVertexUri,
        index,
        isLeft,
        [CurrentSubGraph.get().center.getOriginalMeta()]
    );
};

api.MetaGroupVertexController = MetaGroupVertexController;

export default api;
