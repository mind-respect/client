/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'
import Vue from "vue";
import CurrentSubGraph from "@/graph/CurrentSubGraph";
import GraphElementController from '@/graph-element/GraphElementController'
import VertexService from '@/vertex/VertexService'
import Selection from '@/Selection'
import TagRelation from '@/tag/TagRelation'
import GraphElementType from '@/graph-element/GraphElementType'

const api = {};

function TagGroupVertexController(vertices) {
    this.vertices = vertices;
    VertexController.VertexController.prototype.init.call(
        this,
        this.vertices
    );
}

TagGroupVertexController.prototype = new VertexController.VertexController();


TagGroupVertexController.prototype.addChild = function () {
    let addTuple = VertexService.addTuple(
        this.model()
    );
    let triple = addTuple.optimistic;
    let tagBubble = this.model().getClosestAncestorInTypes([GraphElementType.Meta]);
    addTuple.promise.then(() => {
        triple.edge.controller().addIdentification(
            tagBubble.getOriginalMeta(),
            true
        );
    });
    let metaRelation = new TagRelation(triple.destination, tagBubble);
    metaRelation.setEdgeUri(triple.edge.getUri());
    this.model().addChild(
        metaRelation
    );
    this.model().refreshChildren();
    CurrentSubGraph.get().add(metaRelation);
    Vue.nextTick(() => {
        Selection.setToSingle(triple.destination, true);
        // GraphElementService.changeChildrenIndex(
        //     this.model()
        // );
        triple.destination.focus();
        //would need to redraw but focus hides drawing
    });
};

TagGroupVertexController.prototype.addSiblingCanDo = function () {
    return false;
};

TagGroupVertexController.prototype.removeCanDo = function () {
    return false;
};

TagGroupVertexController.prototype.mergeCanDo = function () {
    return false;
};

TagGroupVertexController.prototype.relateToDistantVertexWithUri = function (distantVertexUri, index, isLeft) {
    return GraphElementController.GraphElementController.prototype.relateToDistantVertexWithUri.call(
        this,
        distantVertexUri,
        index,
        isLeft,
        [this.model().getClosestAncestorInTypes([GraphElementType.Meta]).getOriginalMeta()]
    );
};

TagGroupVertexController.prototype.becomeParent = function (child, isLeft, index) {
    return Promise.resolve();
};

api.MetaGroupVertexController = TagGroupVertexController;

export default api;
