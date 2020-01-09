/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vertex from '@/vertex/Vertex'
import I18n from '@/I18n'
import GraphElementType from '@/graph-element/GraphElementType'

const api = {};
api.getWhenEmptyLabel = function () {
    return I18n.i18next.t("tag:default");
};
api.withUri = function (uri) {
    let meta = new Meta().init(
        uri
    );
    return meta;
};

function Meta() {
}

Meta.prototype = new Vertex.Vertex();
Meta.prototype.init = function (uri) {
    Vertex.Vertex.apply(this);
    Vertex.Vertex.prototype.init.call(
        this,
        Vertex.buildServerFormatFromUri(uri)
    );
    this.setUri(uri);
    return this;
};
Meta.prototype.getGraphElementType = function () {
    return GraphElementType.Meta;
};

Meta.prototype.setOriginalMeta = function (originalMeta) {
    this.setLabel(originalMeta.getLabel());
    this.setComment(originalMeta.getComment());
    this.setChildrenIndex(
        originalMeta.getChildrenIndex()
    );
    this.setColors(
        originalMeta.getColors()
    );
    this.setFont(
        originalMeta.getFont()
    );
    this.originalMeta = originalMeta;
};

Meta.prototype.getOriginalMeta = function () {
    return this.originalMeta;
};

Meta.prototype.getNumberOfChild = function () {
    if (this.isExpanded) {
        return this.getNextChildren().length;
    }
    let parentFork = this.getParentFork();
    if (parentFork.isGroupRelation()) {
        let nbChild = parentFork.getClosestChildrenOfType(GraphElementType.Relation).length;
        return this.getOriginalMeta().getNbReferences() - nbChild;
    } else {
        return this.getOriginalMeta().getNbReferences() - 1;
    }
};

export default api;
