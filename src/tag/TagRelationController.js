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
TagRelationController.prototype.removeCanDo = function () {
    return this.isOwned() && this.getModelArray().some((metaRelation) => {
        return !metaRelation.getParentBubble().isGroupRelation();
    });
};
TagRelationController.prototype.remove = function (skipConfirmation) {
    Store.dispatch("setIsRemoveTagFlow", true)
    // if (skipConfirmation) {
    //     return doIt.bind(this)();
    // } else {
    //     return MetaRelationDeleteMenu.ofMetaRelation(
    //         this.getUi()
    //     ).ask().then(doIt.bind(this));
    // }
    //
    // function doIt() {
    //     var meta = this.getUi().getParentMetaCenter().getModel();
    //     var graphElementToRemoveIdentifier = this.getModel().hasIdentification(meta) ?
    //         this.getUi() :
    //         this.getUi().getSourceVertex();
    //     graphElementToRemoveIdentifier.getController().removeIdentifier(
    //         meta
    //     ).then(function () {
    //         this.getUi().remove();
    //     }.bind(this));
    // }
};
TagRelationController.prototype.removeDo = function () {
    return Promise.all(this.getModelArray().map((metaRelation) => {
        let metaBubble;
        if (metaRelation.getParentVertex().isVertex()) {
            metaBubble = metaRelation.getOtherVertex(metaRelation.getParentVertex());
        } else {
            metaBubble = metaRelation.getClosestAncestorInTypes([GraphElementType.Meta]);
        }
        let tag = metaBubble.getOriginalMeta();
        let parentBubble = metaRelation.getClosestAncestorInTypes([
            GraphElementType.Vertex,
            GraphElementType.Edge,
            GraphElementType.Relation,
            GraphElementType.MetaGroupVertex,
            GraphElementType.Meta
        ]);
        let taggedUri;
        if (parentBubble.isMetaGroupVertex()) {
            taggedUri = metaRelation.getEdgeUri();
            if (parentBubble.getNumberOfChild() === 1) {
                parentBubble.remove();
            } else {
                metaRelation.remove();
            }
        } else {
            let taggedBubble;
            if (parentBubble.isEdge() || parentBubble.isVertex()) {
                taggedBubble = parentBubble;
            } else {
                taggedBubble = metaRelation.getOtherVertex(parentBubble);
            }
            taggedBubble.removeIdentifier(tag);
            taggedBubble.refreshImages();
            taggedUri = taggedBubble.getUri();
            metaRelation.remove();
        }
        return TagService.remove(taggedUri, tag)
    })).then(() => {
        Store.dispatch("redraw");
    });
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
