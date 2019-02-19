/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphElementController from '@/graph-element/GraphElementController'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'

const api = {};
api.PropertyController = PropertyControler;

function PropertyControler(propertiesUi) {
    this.propertiesUi = propertiesUi;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.propertiesUi
    );
}

PropertyControler.prototype = new GraphElementController.GraphElementController();

PropertyControler.prototype.removeCanDo = function () {
    return this.isSingleAndOwned();
};

PropertyControler.prototype.cutCanDo = function () {
    return false;
};

PropertyControler.prototype.remove = function () {
    var self = this;
    FriendlyResourceService.remove(this.propertiesUi, function () {
        self.propertiesUi.remove();
    });
};

PropertyControler.prototype.addSiblingCanDo = function () {
    return this.isSingleAndOwned();
};

PropertyControler.prototype.addSibling = function () {
    var schema = this.propertiesUi.getParentBubble();
    schema.getController().addChild(
        schema
    );
};
export default api;
