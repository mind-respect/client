/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementUi from '@/graph/GraphElementUi'
import TreeEdge from '@/edge/TreeEdge'

const api = {};
TreeEdge.buildCommonConstructors(api);
api.getWhenEmptyLabel = function () {
    return $.t("group_relation.default");
};
api.createFromHtml = function (html) {
    var groupRelation = new api.GroupRelationUi(html);
    api.initCache(
        groupRelation
    );
    return groupRelation;
};
api.visitAllGroupRelations = function (visitor) {
    api.visitAll(function (element) {
        if (element.isGroupRelation()) {
            visitor(element);
        }
    });
};
api.GroupRelationUi = function (html) {
    this.html = html;
    TreeEdge.TreeEdge.prototype.init.call(
        this,
        html
    );
};
api.withUri = function () {
    return [];
};
api.GroupRelationUi.prototype = new TreeEdge.TreeEdge();
api.GroupRelationUi.prototype.getGraphElementType = function () {
    return GraphElementUi.Types.GroupRelation;
};

api.GroupRelationUi.prototype.getGroupRelation = function () {
    return this.html.data(
        "group_relation"
    );
};

api.GroupRelationUi.prototype.isToTheLeft = function () {
    if (this._isToTheLeft === undefined) {
        this._isToTheLeft = this.html.parents(".left-oriented").length > 0;
    }
    return this._isToTheLeft;
};
api.GroupRelationUi.prototype.getHtml = function () {
    return this.html;
};

api.GroupRelationUi.prototype.deselect = function () {
    this.html.removeClass("selected");
    this.html.removeClass("single-selected");
    this.hideMenu();
};

api.GroupRelationUi.prototype.getMenuHtml = function () {
    return this.html.find('.menu');
};

api.GroupRelationUi.prototype.expand = function () {
    if (!this.isCollapsed() && !this.isExpanded()) {
        GraphDisplayer.expandGroupRelation(
            this
        );
    }
    TreeEdge.TreeEdge.prototype.expand.apply(
        this
    );
    this.visitClosestChildVertices(function (vertexUi) {
        vertexUi.resetOtherInstances();
        vertexUi.reviewInLabelButtonsVisibility(true);
    });
};

api.GroupRelationUi.prototype.hasHiddenRelations = function () {
    return true;
};

api.GroupRelationUi.prototype.getMostRelevantIdentifier = function () {
    return this.getModel().getIdentifiers()[0];
};

api.GroupRelationUi.prototype.getNumberOfHiddenRelations = function () {
    return this.getModel().getNumberOfVerticesAtAnyDepth() ||
        this.getNumberOfChildEvenIfHidden();
};

api.GroupRelationUi.prototype.getGreatestGroupRelationAncestor = function () {
    var greatest = this;
    do {
        var parent = greatest.getParentBubble();
        if (parent.isGroupRelation()) {
            greatest = parent;
        }
    } while (parent.isGroupRelation());
    return greatest;
};

api.GroupRelationUi.prototype.getTagNumberOfOtherReferences = function (identifier) {
    return identifier.getNbReferences() - this.getModel().getNumberOfVerticesAtAnyDepth();
};

api.GroupRelationUi.prototype.reviewIsSameAsGroupRelation = function () {
};

api.GroupRelationUi.prototype.getModel = api.GroupRelationUi.prototype.getGroupRelation;

api.GroupRelationUi.prototype.buildChildrenIndex = function () {
    var childrenIndex = {};
    var index = 0;
    if (this.getNumberOfChild() === 0) {
        this.getModel().getSortedVerticesArrayAtAnyDepth(
            this.getParentVertex().getModel().getChildrenIndex()
        ).forEach(function (childVertex) {
            setChildVertexIndex(childVertex.getUri());
        });
    } else {
        this.visitAllImmediateChild(function (child) {
            if (child.isRelation()) {
                setChildVertexIndex(
                    child.getModel().getOtherVertex(
                        this.getParentVertex().getModel()
                    ).getUri()
                );
            } else if (child.isGroupRelation()) {
                var grandChildIndex = child.buildChildrenIndex();
                Object.keys(grandChildIndex).sort(function (a, b) {
                    return grandChildIndex[a].index - grandChildIndex[b].index;
                }).forEach(function (vertexUri) {
                    setChildVertexIndex(vertexUri);
                });
            }
        }.bind(this));
    }
    return childrenIndex;

    function setChildVertexIndex(childVertexUri) {
        childrenIndex[childVertexUri] = {
            index: index
        };
        index++;
    }
};
export default api;
