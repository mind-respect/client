/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import VertexController from '@/vertex/VertexController'
import Vue from "vue";
import CurrentSubGraph from "@/graph/CurrentSubGraph";
import GraphElementController from '@/graph-element/GraphElementController'
import Selection from '@/Selection'
import TagRelation from '@/tag/TagRelation'
import GraphElementType from '@/graph-element/GraphElementType'
import ForkService from "../fork/ForkService";

const api = {};

function TagGroupVertexController(vertices) {
    this.vertices = vertices;
    VertexController.VertexController.prototype.init.call(
        this,
        this.vertices
    );
}

TagGroupVertexController.prototype = new VertexController.VertexController();


TagGroupVertexController.prototype.addChild = async function () {
    this.model().expand();
    await Vue.nextTick();
    let addTuple = ForkService.addTuple(
        this.model()
    );
    let triple = addTuple.optimistic;
    let tagBubble = this.model().getClosestAncestorInTypes([GraphElementType.Meta]);
    addTuple.promise.then(() => {
        triple.edge.controller().addIdentification(
            tagBubble.getOriginalMeta()
        );
    });
    let metaRelation = new TagRelation(triple.destination, tagBubble);
    metaRelation.setEdgeUri(triple.edge.getUri());
    this.model().addChild(
        metaRelation
    );
    this.model().refreshChildren(true);
    CurrentSubGraph.get().add(metaRelation);
    await Vue.nextTick();
    Selection.setToSingle(triple.destination);
    triple.destination.focus();
};

TagGroupVertexController.prototype.addSiblingCanDo = TagGroupVertexController.prototype.addSiblingUpCanDo = function () {
    return false;
};

TagGroupVertexController.prototype.removeCanDo = function () {
    return false;
};

TagGroupVertexController.prototype.mergeCanDo = function () {
    return false;
};

TagGroupVertexController.prototype.relateToDistantVertexWithUri = function (distantVertexUri, index, isLeft, destinationShareLevel) {
    return GraphElementController.GraphElementController.prototype.relateToDistantVertexWithUri.call(
        this,
        distantVertexUri,
        index,
        isLeft,
        destinationShareLevel,
        [this.model().getClosestAncestorInTypes([GraphElementType.Meta]).getOriginalMeta()]
    );
};

TagGroupVertexController.prototype.becomeParent = function (child, isLeft, index) {
    return Promise.resolve();
};

TagGroupVertexController.prototype.becomeExParent = function () {
    if (this.model().getNextChildren().length === 0) {
        this.model().remove();
    }
};

api.MetaGroupVertexController = TagGroupVertexController;

export default api;
