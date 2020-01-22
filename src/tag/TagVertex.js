/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vertex from '@/vertex/Vertex'
import I18n from '@/I18n'
import GraphElementType from '@/graph-element/GraphElementType'
import FriendlyResource from "../friendly-resource/FriendlyResource";

const api = {};
api.getWhenEmptyLabel = function () {
    return I18n.i18next.t("tag:default");
};
api.withUri = function (uri) {
    let meta = new TagVertex().init(
        uri
    );
    return meta;
};

function TagVertex() {
}

TagVertex.prototype = new Vertex.Vertex();
TagVertex.prototype.init = function (uri) {
    Vertex.Vertex.apply(this);
    Vertex.Vertex.prototype.init.call(
        this,
        Vertex.buildServerFormatFromUri(uri)
    );
    this.setUri(uri);
    return this;
};
TagVertex.prototype.getGraphElementType = function () {
    return GraphElementType.Meta;
};

TagVertex.prototype.setOriginalMeta = function (originalMeta) {
    this.originalMeta = originalMeta;
    this.addIdentification(originalMeta);
    FriendlyResource.FriendlyResource.prototype.setLabel.call(
        this,
        originalMeta.getLabel()
    );
    this.setLabel(originalMeta.getLabel());
    FriendlyResource.FriendlyResource.prototype.setComment.call(
        this,
        originalMeta.getComment()
    );
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
    this.setNbReferences(
        originalMeta.getNbReferences()
    )
};

TagVertex.prototype.getOriginalMeta = function () {
    return this.originalMeta;
};

TagVertex.prototype.getNumberOfChild = function () {
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

TagVertex.prototype.setBackgroundColor = function (backgroundColor) {
    this.getOriginalMeta().setBackgroundColor(backgroundColor);
};

TagVertex.prototype.setLabel = function (label) {
    this.getOriginalMeta().setLabel(label);
};

TagVertex.prototype.setComment = function (label) {
    this.getOriginalMeta().setComment(label);
};

TagVertex.prototype.setNbReferences = function (nbReferences) {
    this.getOriginalMeta().setNbReferences(nbReferences);
};


export default api;
