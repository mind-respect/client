/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElementType from '@/graph-element/GraphElementType'
import Vue from 'vue'
import Store from '@/store'
import FriendlyResource from "../friendly-resource/FriendlyResource";
import I18n from '@/I18n'
import NbNeighbors from "../vertex/NbNeighbors";
import IdUri from "../IdUri";
import Fork from '@/fork/Fork'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import GraphElement from "@/graph-element/GraphElement";

const api = {};
api.EXPAND_UNDER_NB_SIBLINGS = 4;
api.EXPAND_UNDER_NB_CHILD = 6;

api.withoutAnIdentification = function () {
    return new GroupRelation(undefined);
};
api.usingIdentification = function () {
    let newGroupRelation = api.withUri(
        "/service" + IdUri.groupRelationBaseUri() + "/" + IdUri.uuid()
    );
    newGroupRelation.addIdentification(tag);
    return newGroupRelation;
};
api.usingIdentifiers = function (tags) {
    let newGroupRelation = api.withUri(
        "/service" + IdUri.groupRelationBaseUri() + "/" + IdUri.uuid()
    );
    newGroupRelation.addIdentifications(tags);
    return newGroupRelation;
};

api.withTagAndChildren = function (tag, children) {
    let newGroupRelation = api.withUri(
        "/service" + IdUri.groupRelationBaseUri() + "/" + IdUri.uuid()
    );
    newGroupRelation.addIdentification(tag);
    children.forEach((child) => {
        newGroupRelation.addChild(child);
    });
    return newGroupRelation;
};

api.withUri = function (uri) {
    return new GroupRelation({
        graphElement: {
            friendlyResource: {
                uri: uri
            }
        },
        nbNeighbors: NbNeighbors.withZeros().toJsonObject()
    });
};

api.fromServerFormat = function (serverFormat) {
    return new GroupRelation(
        serverFormat
    );
};
api.fromGraphElementJsonObject = function (jsonObject, shareLevel, nbNeighbors) {
    return new GroupRelation({
        graphElement: jsonObject,
        shareLevel: shareLevel || ShareLevel.PRIVATE,
        nbNeighbors: nbNeighbors || NbNeighbors.withZeros().toJsonObject()
    });
};
api.buildServerFormatFromModel = function (groupRelation) {
    return {
        graphElement: GraphElement.buildServerFormatFromModel(
            groupRelation
        ),
        sourceForkUri: groupRelation.getParentBubble().getUri(),
        shareLevel: groupRelation.getShareLevel(),
        nbNeighbors: groupRelation.canExpand() ? groupRelation.getNbNeighbors().toJsonObject() : groupRelation.buildNbNeighbors(true).toJsonObject(),
        indexVertexUri: groupRelation.groupRelationJsonObject.indexVertexUri
    };
};

function GroupRelation(jsonObject) {
    this.groupRelationJsonObject = jsonObject;
    this.children = [];
    this.childrenCollapsed = null;
    this.isExpanded = false;
    Fork.Fork.apply(
        this
    );
    Fork.Fork.prototype.init.call(
        this,
        jsonObject
    );
}

GroupRelation.prototype = new Fork.Fork();

GroupRelation.prototype.clone = function () {
    let groupRelation = new GroupRelation(
        JSON.parse(JSON.stringify(this.groupRelationJsonObject))
    );
    this.cloneTags(groupRelation);
    groupRelation.rebuildId();
    return groupRelation;
};

GroupRelation.prototype.getNbNeighbors = function () {
    return this.nbNeighbors;
};

GroupRelation.prototype.setNbNeighbors = function (nbNeighbors) {
    return this.nbNeighbors = nbNeighbors;
};

GroupRelation.prototype.hasFewEnoughBubblesToExpand = function () {
    let parentNbChild = this.getParentBubble().getNumberOfChild(this.isToTheLeft());
    let nbChild = this.getNumberOfChild();
    if (parentNbChild === 1) {
        return true;
    }
    return parentNbChild < api.EXPAND_UNDER_NB_SIBLINGS &&
        nbChild < api.EXPAND_UNDER_NB_CHILD;
};

GroupRelation.prototype.removeChild = function (child, isTemporary, avoidRedraw) {
    let l = this.children.length;
    let removedChild;
    while (l--) {
        if (this.children[l].getUri() === child.getUri()) {
            removedChild = this.children[l];
            this.children.splice(l, 1);
        }
    }
    if (!isTemporary) {
        this.refreshChildren(avoidRedraw);
    }
};

GroupRelation.prototype.getGreatestGroupRelationAncestor = function () {
    let greatest = this;
    let parent;
    let isSameAsParent = false;
    do {
        parent = greatest.getParentBubble();
        isSameAsParent = parent.getUri() === greatest.getUri();
        if (parent.isGroupRelation()) {
            greatest = parent;
        }
    } while (parent.isGroupRelation() && !isSameAsParent);
    return greatest;
};

GroupRelation.prototype.getLeftBubble = function (bottom, getEvenIfNotShown) {
    if (this.isToTheLeft()) {
        if (this.isCollapsed || !this.children) {
            return this;
        }
        let index = bottom ? this.children.length - 1 : 0;
        const childAtIndex = this.children[index];
        if (!childAtIndex) {
            return this;
        }
        return getEvenIfNotShown ? childAtIndex : childAtIndex.getShownBubble();
    }
    return getEvenIfNotShown ? this.getParentBubble() : this.getShownParentBubble();
};

GroupRelation.prototype.getRightBubble = function (bottom, getEvenIfNotShown) {
    if (this.isToTheLeft()) {
        return getEvenIfNotShown ? this.getParentBubble() : this.getShownParentBubble();
    }
    if (this.isCollapsed || !this.children) {
        return this;
    }
    let index = bottom ? this.children.length - 1 : 0;

    const childAtIndex = this.children[index];
    if (childAtIndex) {
        return getEvenIfNotShown ? childAtIndex : childAtIndex.getShownBubble();
    }
};


GroupRelation.prototype.getNextChildrenEvenIfCollapsed = function () {
    return this._getNextChildrenCollapsedOrNot(true);
};


GroupRelation.prototype.getNextChildren = function () {
    return this._getNextChildrenCollapsedOrNot(false);
};

GroupRelation.prototype._getNextChildrenCollapsedOrNot = function (getEvenIfCollapsed) {
    if (!this.parentVertex) {
        return [];
    }
    let children = this.isCollapsed && getEvenIfCollapsed ? this.childrenCollapsed : this.children;
    if (children === undefined || children === null) {
        return [];
    }
    return children;
};

GroupRelation.prototype.getFirstEdge = function () {
    let children = this.getNextChildrenEvenIfCollapsed();
    let firstEdge = children.filter((child) => {
        return child.isEdge();
    })[0];
    if (!firstEdge) {
        return children[0].getFirstEdge();
    }
    return firstEdge;
};

GroupRelation.prototype.expand = async function (avoidCenter, isFirstExpand) {
    FriendlyResource.FriendlyResource.prototype.expand.call(
        this,
        avoidCenter,
        isFirstExpand
    );
    if (this.childrenCollapsed !== null) {
        this.children = this.childrenCollapsed;
        this.childrenCollapsed = null;
    }
    await Vue.nextTick();
    Store.dispatch("redraw");
};

GroupRelation.prototype.collapse = function (preventScroll, preventApplyToDescendants) {
    if (!this.isExpanded) {
        return;
    }
    this.isExpanded = false;
    this.isCollapsed = true;
    if (this.children != null) {
        this.childrenCollapsed = this.children;
        this.children = null;
    }
    FriendlyResource.FriendlyResource.prototype.collapse.call(
        this,
        preventScroll,
        preventApplyToDescendants
    );
};


GroupRelation.prototype.getGraphElementType = function () {
    return GraphElementType.GroupRelation;
};

GroupRelation.prototype.getIdentification = function () {
    return this.getIdentifiers()[0];
};


GroupRelation.prototype.shouldBeChildOfGroupRelation = function (otherGroupRelation) {
    return this.getClosestChildrenOfType(GraphElementType.Relation).every((edge) => {
        return edge.hasAllIdentifiers(otherGroupRelation.getIdentifiers());
    });
};

GroupRelation.prototype.addChild = function (child, isToTheLeft, index) {
    if (child.isGroupRelation()) {
        child.parentBubble = this;
        child.parentVertex = this.getParentVertex();
        child.getClosestChildrenOfType(GraphElementType.Relation).forEach((relation) => {
            relation.parentVertex = this.parentVertex;
        });
        if (index === undefined) {
            index = this.areTagsShown ? this.children.filter((child) => {
                return !child.isMeta();
            }).length : this.children.length;
        }
        this.children.splice(
            index,
            0,
            child
        );
        return;
    }
    child.parentVertex = this.getParentVertex();
    child.parentBubble = this;
    if (index === undefined) {
        index = this.areTagsShown ? this.children.filter((child) => {
            return !child.isMeta();
        }).length : this.children.length;
    }
    this.children.splice(
        index,
        0,
        child
    );
};


GroupRelation.prototype.setSourceVertex = function (sourceVertex) {
    this.getClosestChildrenOfType(GraphElementType.Relation).forEach((child) => {
        child.setSourceVertex(
            sourceVertex
        )
    });
};

GroupRelation.prototype.setParentFork = function (fork) {
    if (!fork.isVertex()) {
        return
    }
    this.getClosestChildrenOfType(GraphElementType.Relation).forEach((child) => {
        child.parentVertex = fork;
    });
};

GroupRelation.prototype.getGroupRelationInSequenceWithTag = function (tag) {
    let groupRelationWithTag = this.getGreatestGroupRelationAncestor().getSerialGroupRelations().filter((groupRelation) => {
        return groupRelation.hasIdentification(tag);
    });
    return groupRelationWithTag.length > 0 ? groupRelationWithTag[0] : false;
};

GroupRelation.prototype.getSerialGroupRelations = function (groupRelationToStop, exclusive) {
    let groupRelationsAtAnyDepth = [].concat(this);
    if (groupRelationToStop && groupRelationToStop.getUri() === this.getUri()) {
        if (exclusive) {
            return [];
        }
        return groupRelationsAtAnyDepth;
    }
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        groupRelationsAtAnyDepth = groupRelationsAtAnyDepth.concat(childGroupRelation.getSerialGroupRelations(groupRelationToStop, exclusive));
    });
    return groupRelationsAtAnyDepth;
};

GroupRelation.prototype.getChildGroupRelations = function () {
    return this.getNextChildrenEvenIfCollapsed().filter((groupRelation) => {
        return groupRelation.getGraphElementType() === GraphElementType.GroupRelation;
    });
};


GroupRelation.prototype.getNumberOfChild = function () {
    let children = this.getNextChildren();
    return children.length ? children.length : this.nbNeighbors.getTotalChildren();
};

GroupRelation.prototype.getChip = function () {
    let html = this.getHtml();
    if (html) {
        return html.querySelectorAll('.v-chip')[0];
    }
};

GroupRelation.prototype.isShrinked = function () {
    return false;
};

GroupRelation.prototype.getWhenEmptyLabel = function () {
    return I18n.i18next.t("groupRelation:default");
};

GroupRelation.prototype.setNbNeighbors = function (nbNeighbors) {
    this.nbNeighbors = nbNeighbors;
};

GroupRelation.prototype.setShareLevel = function (shareLevel) {
    return this.groupRelationJsonObject.shareLevel = shareLevel;
};

GroupRelation.prototype.getShareLevel = function () {
    return this.groupRelationJsonObject.shareLevel.toUpperCase();
};

GroupRelation.prototype.isInverse = function () {
    return false;
}

GroupRelation.prototype.remove = function (preventRemoveDescendants) {
    if (!preventRemoveDescendants) {
        this.getDescendantsEvenIfCollapsed().forEach((bubble) => {
            CurrentSubGraph.get().remove(bubble);
        });
        this.getDuplicates().forEach((duplicate) => {
            duplicate.remove(true);
        });
    }
    CurrentSubGraph.get().remove(this);
    this.getParentBubble().removeChild(this);
};

GroupRelation.prototype.replaceRelatedVertex = function () {
}

GroupRelation.prototype.setSourceForkUri = function (sourceForkUri) {
    this.groupRelationJsonObject.sourceForkUri = sourceForkUri;
};

GroupRelation.prototype.getSourceForkUri = function () {
    return decodeURIComponent(this.groupRelationJsonObject.sourceForkUri);
};

GroupRelation.prototype.isRelatedToForkUri = function (forkUri) {
    return this.getSourceForkUri() === forkUri;
}

GroupRelation.prototype.getIndexVertexUri = function () {
    return decodeURIComponent(
        this.groupRelationJsonObject.indexVertexUri
    );
};

api.GroupRelation = GroupRelation;


export default api;
