/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElementController from '@/graph-element/GraphElementController'
import GraphElementType from "@/graph-element/GraphElementType";
import Store from '@/store'
import TagService from '@/tag/TagService'

const api = {};

function TagRelationController(relations) {
    this.relations = relations;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.relations
    );
}

TagRelationController.prototype = new GraphElementController.GraphElementController();
TagRelationController.prototype.focusCanDo = function () {
    return false;
};
TagRelationController.prototype.centerCanDo = function () {
    return false;
};
TagRelationController.prototype.noteCanDo = function () {
    return false;
};

TagRelationController.prototype.remove = function (skipConfirmation) {
    Store.dispatch("setIsRemoveTagFlow", true)
};
TagRelationController.prototype.removeDo = async function () {
    let taggedBubbles = [];
    await Promise.all(this.getModelArray().map((metaRelation) => {
        let tagVertex = metaRelation.getNextBubble().isMeta() ?
            metaRelation.getNextBubble() :
            metaRelation.getClosestAncestorInTypes([GraphElementType.Meta]);
        let tag = tagVertex.getOriginalMeta();
        let parentBubble = metaRelation.getClosestAncestorInTypes([
            GraphElementType.Vertex,
            GraphElementType.Edge,
            GraphElementType.Relation,
            GraphElementType.MetaGroupVertex,
            GraphElementType.Meta,
            GraphElementType.GroupRelation
        ]);
        if (parentBubble.isMetaGroupVertex()) {
            taggedBubbles.push(metaRelation);
            if (parentBubble.getNumberOfChild() === 1) {
                parentBubble.remove();
            } else {
                metaRelation.remove();
            }
        } else {
            let taggedBubble;
            if (parentBubble.isInTypes([GraphElementType.GroupRelation, GraphElementType.Vertex, GraphElementType.Relation])) {
                taggedBubble = parentBubble;
            } else {
                taggedBubble = metaRelation.getOtherVertex(parentBubble);
            }
            if (taggedBubble.isMetaGroupVertex()) {
                taggedBubbles = taggedBubble.getNextChildrenEvenIfCollapsed();
            } else {
                taggedBubbles.push(taggedBubble);
            }
        }
        return Promise.all(taggedBubbles.map((taggedBubble) => {
            taggedBubble.removeTag(tag);
            taggedBubble.refreshImages();
            metaRelation.remove();
            return TagService.remove(taggedBubble.getUri(), tag);
        }))
    }));
    Store.dispatch("redraw");
};
TagRelationController.prototype.cutCanDo = function () {
    return false;
};

TagRelationController.prototype.addTagCanDo = function () {
    return false;
};

TagRelationController.prototype.showTagsCanDo = function () {
    return false;
};

TagRelationController.prototype.collapseCanDo = function () {
    return false;
};

TagRelationController.prototype.expandCanDo = function () {
    return false;
};

TagRelationController.prototype.selectTreeCanDo = function () {
    return false;
};

TagRelationController.prototype.setColorCanDo = function () {
    return false;
};

api.MetaRelationController = TagRelationController;

export default api;
