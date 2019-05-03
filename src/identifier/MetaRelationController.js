/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElementController from '@/graph-element/GraphElementController'

const api = {};

function MetaRelationController(relations) {
    this.relations = relations;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.relations
    );
}

MetaRelationController.prototype = new GraphElementController.GraphElementController();
MetaRelationController.prototype.centerCanDo = function () {
    return false;
};
MetaRelationController.prototype.noteCanDo = function () {
    return false;
};
MetaRelationController.prototype.removeCanDo = function () {
    return this.isOwned();
};
MetaRelationController.prototype.remove = function (skipConfirmation) {
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
MetaRelationController.prototype.cutCanDo = function () {
    return false;
};
MetaRelationController.prototype.identifyCanDo = function () {
    return false;
};

MetaRelationController.prototype.collapseCanDo = function () {
    return false;
};

MetaRelationController.prototype.expandCanDo = function () {
    return false;
};

MetaRelationController.prototype.selectTreeCanDo = function () {
    return false;
};

api.MetaRelationController = MetaRelationController;

export default api;
