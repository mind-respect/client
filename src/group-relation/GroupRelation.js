/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElement from '@/graph-element/GraphElement'
import GraphElementType from '@/graph-element/GraphElementType'
import Vue from 'vue'
import Store from '@/store'
import FriendlyResource from "../friendly-resource/FriendlyResource";
import IdUri from '@/IdUri'
import I18n from '@/I18n'

const api = {};
api.EXPAND_UNDER_NB_SIBLINGS = 4;
api.EXPAND_UNDER_NB_CHILD = 6;
api.withoutAnIdentification = function () {
    return new GroupRelation(undefined);
};
api.usingIdentification = function (identification) {
    if (Array.isArray(identification)) {
        return new GroupRelation(identification, []);
    } else {
        return new GroupRelation([identification], []);
    }
};
api.usingIdentifiers = function (tags) {
    return new GroupRelation(tags, []);
};

api.withTagAndChildren = function (tag, children) {
    return new GroupRelation([tag], children);
};

function GroupRelation(tags, children) {
    this.children = children.map((child) => {
        child.parentBubble = this;
        return child;
    });
    this.childrenCollapsed = null;
    let tag = tags[0];
    GraphElement.GraphElement.apply(
        this
    );
    this.init(
        GraphElement.buildObjectWithUri(
            IdUri.uuid()
        )
    );
    this.setLabel(tag.getLabel());
    this.setComment(tag.getComment());
    this.addIdentifications(tags);
    this.isExpanded = false;
}

GroupRelation.prototype = new GraphElement.GraphElement();

GroupRelation.prototype.hasFewEnoughBubblesToExpand = function () {
    let parentNbChild = this.getParentBubble().getNumberOfChild(this.isToTheLeft());
    let nbChild = this.getNumberOfChild();
    if (parentNbChild === 1) {
        return true;
    }
    return parentNbChild < api.EXPAND_UNDER_NB_SIBLINGS &&
        nbChild < api.EXPAND_UNDER_NB_CHILD;
};

GroupRelation.prototype.removeChild = function (child, isTemporary) {
    let l = this.children.length;
    let removedChild;
    while (l--) {
        if (this.children[l].getUri() === child.getUri()) {
            removedChild = this.children[l];
            this.children.splice(l, 1);
        }
    }
    if (!isTemporary) {
        if (this.children.length === 1) {
            let parentBubble = this.getParentBubble();
            let child = this.getNextChildren()[0];
            parentBubble.replaceChild(
                this,
                child
            );
            if (child.isLabelEmpty()) {
                child.controller().setLabel(this.getLabel())
            }
        }
        if (this.children.length === 0) {
            this.getParentBubble().removeChild(this);
        }
        this.refreshChildren();
    }
};

GroupRelation.prototype.getGreatestGroupRelationAncestor = function () {
    let greatest = this;
    let parent;
    do {
        parent = greatest.getParentBubble();
        if (parent.isGroupRelation()) {
            greatest = parent;
        }
    } while (parent.isGroupRelation());
    return greatest;
};

GroupRelation.prototype.getLeftBubble = function () {
    if (this.isToTheLeft()) {
        if (this.isCollapsed || !this.children) {
            return this;
        }
        return this.children[0];
    }
    return this.parentBubble;
};

GroupRelation.prototype.getRightBubble = function (bottom) {
    if (this.isToTheLeft()) {
        return this.parentBubble;
    }
    if (this.isCollapsed || !this.children) {
        return this;
    }
    return bottom ? this.children[this.children.length - 1] : this.children[0];
};

GroupRelation.prototype.isLeaf = function () {
    return false;
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

GroupRelation.prototype.expand = async function (avoidCenter, isChildExpand) {
    if (this.childrenCollapsed !== null) {
        this.children = this.childrenCollapsed;
        this.childrenCollapsed = null;
    }
    this.isExpanded = true;
    this.isCollapsed = false;
    FriendlyResource.FriendlyResource.prototype.expand.call(
        this,
        avoidCenter,
        isChildExpand
    );
    await Vue.nextTick();
    Store.dispatch("redraw");
};

GroupRelation.prototype.collapse = function (preventScroll) {
    this.isExpanded = false;
    this.isCollapsed = true;
    if (this.children != null) {
        this.childrenCollapsed = this.children;
        this.children = null;
    }
    FriendlyResource.FriendlyResource.prototype.collapse.call(
        this,
        preventScroll
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
            this.children.push(child);
        } else {
            this.children.splice(
                index,
                0,
                child
            );
        }
        return;
    }
    let edge = child.isEdge() ?
        child : child.getParentBubble();
    edge.parentVertex = this.getParentVertex();
    edge.parentBubble = this;
    if (index === undefined) {
        this.children.push(edge);
    } else {
        this.children.splice(
            index,
            0,
            edge
        );
    }
};


GroupRelation.prototype.setSourceVertex = function (sourceVertex) {
    this.getClosestChildrenOfType(GraphElementType.Relation).forEach((child) => {
        child.setSourceVertex(
            sourceVertex
        )
    });
};

GroupRelation.prototype.setParentVertex = function (vertex) {
    this.getClosestChildrenOfType(GraphElementType.Relation).forEach((child) => {
        child.setParentVertex(
            vertex
        )
    });
};

GroupRelation.prototype.getIdentifiersAtAnyDepth = function () {
    let identifiers = [].concat(this.identifiers);
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        identifiers = identifiers.concat(childGroupRelation.getIdentifiersAtAnyDepth());
    });
    return identifiers;
};

GroupRelation.prototype.getChildGroupRelations = function () {
    return this.getNextChildren().filter((groupRelation) => {
        return groupRelation.getGraphElementType() === GraphElementType.GroupRelation;
    });
};


GroupRelation.prototype.getNumberOfChild = function () {
    if (this.isCollapsed) {
        return this.childrenCollapsed ? this.childrenCollapsed.length : 0;
    }
    return this.children ? this.children.length : 0;
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

api.GroupRelation = GroupRelation;

export default api;
