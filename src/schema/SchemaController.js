/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import SchemaService from '@/schema/SchemaService'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElement from '@/graph-element/GraphElement'
import GraphElementController from '@/graph-element/GraphElementController'
import SelectionHandler from '@/SelectionHandler'

const api = {};
api.SchemaController = SchemaController;

function SchemaController(schemaUi) {
    this.schemasUi = schemaUi;
    GraphElementController.GraphElementController.prototype.init.call(
        this,
        this.schemasUi
    );
}

SchemaController.prototype = new GraphElementController.GraphElementController();

SchemaController.prototype.addChildCanDo = function () {
    return this.isSingleAndOwned();
};

SchemaController.prototype.addChild = function () {
    var self = this;
    SchemaService.createProperty(
        this.schemasUi,
        function (propertyUri) {
            var propertyUi = GraphDisplayer.addProperty(
                GraphElement.withUri(
                    propertyUri
                ),
                self.schemasUi
            );
            SelectionHandler.setToSingle(
                propertyUi
            );
        }
    );
};

SchemaController.prototype.selectTreeCanDo = function () {
    return false;
};

export default api;
