/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElement from '@/graph-element/GraphElement'
import Identification from '@/identifier/Identification'
import GraphElementType from '@/graph-element/GraphElementType'
import GroupRelationController from '@/group-relation/GroupRelationController'
import Vue from 'vue'
import FriendlyResource from "../friendly-resource/FriendlyResource";

const EXPAND_UNDER_NB_SIBLINGS = 4,
    EXPAND_UNDER_NB_CHILD = 6;

const api = {};
api.withoutAnIdentification = function () {
    return new GroupRelation(undefined);
};
api.usingIdentification = function (identification) {
    if (Array.isArray(identification)) {
        return new GroupRelation(identification);
    } else {
        return new GroupRelation([identification]);
    }
};
api.forTuplesAndIdentifier = function (tuples, identifier) {
    var groupRelation = new GroupRelation(
        [identifier]
    );
    tuples.forEach(function (tuple) {
        groupRelation.addTuple(
            tuple
        );
    });
    return groupRelation;
};
api.usingIdentifiers = function (identifications) {
    return new GroupRelation(identifications);
};

function GroupRelation(identifiers) {
    this.identifiers = identifiers;
    this.vertices = {};
    this.childGroupRelations = [];
    this.isExpanded = true;
    this._sortedImmediateChild = null;
    this._sortedImmediateChildCollapsed = null;
    Identification.Identification.apply(
        this
    );
    this.init(
        this.getIdentification().getServerFormat()
    );
    this.isFirstInit = true;
}

GroupRelation.prototype = new Identification.Identification();

GroupRelation.prototype.hasFewEnoughBubblesToExpand = function () {
    return this.getParentBubble().getNumberOfChild() < EXPAND_UNDER_NB_CHILD &&
        this.getNumberOfVertices() < EXPAND_UNDER_NB_SIBLINGS;
};

// GroupRelation.prototype.removeChild = function (edge, temporarily) {
//     let parentVertex = this.parentVertex;
//     let vertexToRemove = edge.getOtherVertex(parentVertex);
//     Vue.delete(this.vertices, vertexToRemove.getUri());
//     let l = this._sortedImmediateChild.length;
//     while (l--) {
//         let child = this._sortedImmediateChild[l];
//         if (child[edge.getId()]) {
//             this._sortedImmediateChild.splice(l, 1);
//         }
//     }
//     if (!temporarily && this.getNumberOfVertices() === 1) {
//         parentVertex.replaceChild(
//             this,
//             this.getFirstEdge()
//         );
//     }
// };


GroupRelation.prototype.removeChild = function (toRemove) {
    if (toRemove.isGroupRelation()) {
        let l = this._sortedImmediateChild.length;
        while (l--) {
            let child = this._sortedImmediateChild[l];
            let isGroupRelation = child instanceof GroupRelation;
            if (isGroupRelation && child.getId() === toRemove.getId()) {
                this._sortedImmediateChild.splice(l, 1);
            }
        }
    } else {
        return this.removeTuple({
            edge: toRemove,
            vertex: toRemove.destinationVertex
        })
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
    return this.isToTheLeft() ? this.getFirstEdge(0) : this.parentBubble;
};

GroupRelation.prototype.isLeaf = function () {
    return false;
};

GroupRelation.prototype.getRightBubble = function (bottom) {
    if (this.isToTheLeft()) {
        return this.parentBubble;
    }
    return bottom ? this.getLastEdge(0) : this.getFirstEdge(0);
};

GroupRelation.prototype.getImmediateChild = function () {
    let edges = [];
    if (!this.parentVertex) {
        return edges;
    }
    let children = this._sortedImmediateChild || [];
    children.map(function (child) {
        if (child instanceof GroupRelation) {
            edges.push(child)
        } else {
            Object.keys(child).forEach(function (id) {
                edges.push(child[id].edge);
            }.bind(this));
        }
    });
    return edges;
};

GroupRelation.prototype.expand = function (avoidCenter, isChildExpand) {
    FriendlyResource.FriendlyResource.prototype.expand.call(
        this,
        avoidCenter,
        isChildExpand
    );
    this.isExpanded = false; // to make the expand animation work in next tick
    this.isCollapsed = false;
    Vue.nextTick(function () {
        if (this._sortedImmediateChildCollapsed !== null) {
            this._sortedImmediateChild = this._sortedImmediateChildCollapsed;
            this._sortedImmediateChildCollapsed = null;
        }
        this.isExpanded = true;
        this.isCollapsed = false;
    }.bind(this))
};

GroupRelation.prototype.collapse = function () {
    this.isExpanded = false;
    this.isCollapsed = true;
    if (this._sortedImmediateChild != null) {
        this._sortedImmediateChildCollapsed = this._sortedImmediateChild;
        this._sortedImmediateChild = null;
    }
    Vue.nextTick(function () {
        FriendlyResource.FriendlyResource.prototype.collapse.call(
            this
        );
    }.bind(this));
};

GroupRelation.prototype.getController = function () {
    return new GroupRelationController.GroupRelationController(this);
};

GroupRelation.prototype.getControllerWithElements = function (elements) {
    return new GroupRelationController.GroupRelationController(
        elements
    );
};

GroupRelation.prototype.getGraphElementType = function () {
    return GraphElementType.GroupRelation;
};

GroupRelation.prototype.getIdentification = function () {
    return this.identifiers[0];
};
GroupRelation.prototype.getRelevantTags = GroupRelation.prototype.getIdentifiers = function () {
    return this.identifiers;
};

GroupRelation.prototype.getVertices = function () {
    return this.vertices;
};

GroupRelation.prototype.getSortedVerticesAtAnyDepth = function (childrenIndex) {
    return this._getSortedVerticesAtAnyDepthOrNot(true, childrenIndex);
};

GroupRelation.prototype.getSortedVertices = function (childrenIndex) {
    return this._getSortedVerticesAtAnyDepthOrNot(false, childrenIndex);
};

GroupRelation.prototype.sortedImmediateChild = function (childIndex) {
    if (this.isCollapsed) {
        return [];
    }
    if (this._sortedImmediateChild !== null) {
        return this._sortedImmediateChild;
    }
    let immediateChild = this.getVerticesAsArray().concat(this.childGroupRelations);
    this._sortedImmediateChild = immediateChild.sort(function (a, b) {
        let graphElementA = a instanceof GroupRelation ?
            a.getFirstVertex(childIndex) :
            a;
        let graphElementB = b instanceof GroupRelation ?
            b.getFirstVertex(childIndex) :
            b;
        return GraphElement.sortCompare(graphElementA, graphElementB, childIndex);
    }).map(function (child) {
        if (child instanceof GroupRelation) {
            return child;
        } else {
            return this.vertices[child.getUri()];
        }
    }.bind(this));
    return this._sortedImmediateChild;
};

GroupRelation.prototype._getSortedVerticesAtAnyDepthOrNot = function (atAnyDepth, childrenIndex) {
    var vertices = atAnyDepth ? this.getVerticesAtAnyDepth() : this.vertices;
    var sortedKeys = Object.keys(vertices).sort(
        function (a, b) {
            var vertexAUiInstances = vertices[a];
            var vertexBUiInstances = vertices[b];
            var vertexA = vertexAUiInstances[
                Object.keys(vertexAUiInstances)[0]
                ].vertex;
            var vertexB = vertexBUiInstances[
                Object.keys(vertexBUiInstances)[0]
                ].vertex;
            return GraphElement.sortCompare(
                vertexA,
                vertexB,
                childrenIndex
            );
        });
    var sorted = {};
    sortedKeys.forEach(function (sortedKey) {
        sorted[sortedKey] = vertices[sortedKey];
    });
    return sorted;
};

GroupRelation.prototype.getFirstVertex = function (childrenIndex) {
    return this.getFirstTuple(childrenIndex).vertex;
};

GroupRelation.prototype.getLastVertex = function (childrenIndex) {
    childrenIndex = childrenIndex || 0;
    return this.getLastTuple(childrenIndex).vertex;
};

GroupRelation.prototype.getFirstEdge = function (childrenIndex) {
    childrenIndex = childrenIndex || 0;
    return this.getFirstTuple(childrenIndex).edge;
};

GroupRelation.prototype.getLastEdge = function (childrenIndex) {
    childrenIndex = childrenIndex || 0;
    return this.getLastTuple(childrenIndex).edge;
};

GroupRelation.prototype.getFirstTuple = function (childrenIndex) {
    let sortedTuples = this.getSortedVerticesAtAnyDepth(childrenIndex);
    let firstTupleByVertexUid = sortedTuples[Object.keys(sortedTuples)[0]];
    let firstTuple = firstTupleByVertexUid[Object.keys(firstTupleByVertexUid)[0]];
    return firstTuple;
};

GroupRelation.prototype.getLastTuple = function (childrenIndex) {
    let sortedTuples = this.getSortedVerticesAtAnyDepth(childrenIndex);
    let firstTupleByVertexUid = sortedTuples[Object.keys(sortedTuples)[Object.keys(sortedTuples).length - 1]];
    let firstTuple = firstTupleByVertexUid[Object.keys(firstTupleByVertexUid)[Object.keys(firstTupleByVertexUid).length - 1]];
    return firstTuple;
};


GroupRelation.prototype.getSortDate = function () {
    return new Date(0);
};

GroupRelation.prototype.getAnyVertex = function () {
    var verticesWithUri = this.getVertices();
    var verticesWithId = verticesWithUri[Object.keys(verticesWithUri)[0]];
    if (undefined === verticesWithId) {
        return this.getChildGroupRelations()[0].getAnyVertex();
    }
    return verticesWithId[Object.keys(verticesWithId)[0]].vertex;
};

GroupRelation.prototype.getSingleEdge = function () {
    var verticesWithUri = this.getVertices();
    var verticesWithId = verticesWithUri[Object.keys(verticesWithUri)[0]];
    return verticesWithId[Object.keys(verticesWithId)[0]].edge;
};

GroupRelation.prototype.addChild = function (graphElementUi, isToTheLeft, index) {
    if (graphElementUi.isGroupRelation()) {
        if (index === undefined) {
            this._sortedImmediateChild.push(graphElementUi);
        } else {
            this._sortedImmediateChild.splice(
                index,
                0,
                graphElementUi
            );
        }
        return;
    }
    let edge = graphElementUi.isEdge() ?
        graphElementUi : graphElementUi.getParentBubble();
    let vertex = graphElementUi.isVertex() ? graphElementUi : graphElementUi.getDestinationVertex();
    let tuple = {
        edge: edge,
        vertex: vertex
    };
    let tuplesOfUri = this.addTuple(tuple);
    if (index === undefined) {
        this._sortedImmediateChild.push(tuplesOfUri);
    } else {
        this._sortedImmediateChild.splice(
            index,
            0,
            tuplesOfUri
        );
    }
};

GroupRelation.prototype.addTuple = function (tuple) {
    let tupleKey = tuple.vertex.getUri();
    let tupleId = tuple.edge.getId();
    // tuple.edge.parentBubble = this;
    // tuple.vertex.parentBubble = tuple.edge;
    if (this.vertices[tupleKey] === undefined) {
        let tuples = {};
        tuples[tupleId] = tuple;
        Vue.set(this.vertices, tupleKey, tuples);
    } else {
        Vue.set(this.vertices[tupleKey], tupleId, tuple);
    }
    return this.vertices[tupleKey];
};
GroupRelation.prototype.visitTuples = function (visitor) {
    Object.values(this.vertices).forEach((verticesWithSameUri) => {
        Object.values(verticesWithSameUri).forEach((tuple) => {
            visitor(tuple);
        });
    });
};

GroupRelation.prototype.removeTuple = function (tuple) {
    delete this.vertices[tuple.vertex.getUri()];
    if (!this._sortedImmediateChild) {
        return;
    }
    let l = this._sortedImmediateChild.length;
    while (l--) {
        let tuplesOfUri = this._sortedImmediateChild[l];
        let _tuple = tuplesOfUri[tuple.edge.getId()];
        if (_tuple && _tuple.edge.getId() === tuple.edge.getId()) {
            this._sortedImmediateChild.splice(l, 1);
        }
    }
};
GroupRelation.prototype.isTrulyAGroupRelation = function () {
    return this.hasMultipleVertices() || this.hasGroupRelationsChild();
};
GroupRelation.prototype.hasMultipleVertices = function () {
    return this.getNumberOfVertices() > 1;
};
GroupRelation.prototype.getNumberOfVertices = function () {
    return Object.keys(this.vertices).length;
};
GroupRelation.prototype.getNumberOfVerticesAtAnyDepth = function () {
    var numberOfVertices = this.getNumberOfVertices();
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        numberOfVertices += childGroupRelation.getNumberOfVerticesAtAnyDepth();
    });
    return numberOfVertices;
};

GroupRelation.prototype.getVerticesAtAnyDepth = function () {
    let verticesAtAnyDepth = Object.entries(this.vertices).reduce((vertices, entry) => {
        vertices[entry[0]] = entry[1];
        return vertices;
    }, {});
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        Object.entries(childGroupRelation.getVerticesAtAnyDepth()).reduce((vertices, entry) => {
            vertices[entry[0]] = entry[1];
            return vertices;
        }, verticesAtAnyDepth);
    });
    return verticesAtAnyDepth;
};

GroupRelation.prototype.getVerticesAsArray = function () {
    var groupRelationVertices = this.getVertices();
    var vertices = [];
    Object.keys(groupRelationVertices).forEach(function (vertexUri) {
        Object.keys(groupRelationVertices[vertexUri]).forEach(function (vertedId) {
            vertices.push(
                groupRelationVertices[vertexUri][vertedId].vertex
            );
        });
    });
    return vertices;
};

GroupRelation.prototype.getSortedVerticesArrayAtAnyDepth = function (childrenIndex) {
    let groupRelationVertices = this.getSortedVerticesAtAnyDepth(childrenIndex);
    let vertices = [];
    Object.keys(groupRelationVertices).forEach(function (vertexUri) {
        Object.keys(groupRelationVertices[vertexUri]).forEach(function (vertedId) {
            vertices.push(
                groupRelationVertices[vertexUri][vertedId].vertex
            );
        });
    });
    return vertices;
};

GroupRelation.prototype.getIdentifiersAtAnyDepth = function () {
    var identifiers = [].concat(this.identifiers);
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        identifiers = identifiers.concat(childGroupRelation.getIdentifiersAtAnyDepth());
    });
    return identifiers;
};

GroupRelation.prototype.buildChildrenIndex = function () {
    let childrenIndex = {};
    let index = 0;
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


GroupRelation.prototype.hasRelevantTags = function () {
    return true;
};

GroupRelation.prototype.hasIdentifications = function () {
    return true;
};
GroupRelation.prototype.hasIdentification = function (tag) {
    return this.identifiers.some((ownTag) => {
        return ownTag.getExternalResourceUri() === tag.getExternalResourceUri();
    });
};
GroupRelation.prototype.addIdentification = function (identifier) {
    if (this.hasIdentification(identifier)) {
        return;
    }
    this.identifiers.push(
        identifier
    );
};
GroupRelation.prototype.getChildGroupRelations = function () {
    return this.childGroupRelations;
};
GroupRelation.prototype.hasGroupRelationsChild = function () {
    return this.childGroupRelations.length > 0;
};
GroupRelation.prototype.getNumberOfChild = function () {
    return this.childGroupRelations.length + this.getNumberOfVertices();
};
GroupRelation.prototype.addChildGroupRelation = function (groupRelation) {
    return this.childGroupRelations.push(
        groupRelation
    );
};
GroupRelation.prototype.integrateGroupRelationToTreeIfApplicable = function (groupRelation) {
    if (groupRelation.isARelation() && this._containsAllTuplesOfGroupRelation(groupRelation)) {
        return true;
    }
    var hasIntegrated = false;
    var doWithTuplesAtThisDepth;
    if (this._hasOneOfTheIdentifiers(groupRelation.getIdentifiers())) {
        doWithTuplesAtThisDepth = this.addTuple;
    } else if (groupRelation.isTrulyAGroupRelation() && this._doesOneOfTheChildHasIdentifiers(groupRelation.getIdentifiers())) {
        doWithTuplesAtThisDepth = this.removeTuple.bind(this);
        this.addChildGroupRelation(groupRelation);
    } else if (this.integrateGroupRelationToChildGroupRelations(groupRelation)) {
        hasIntegrated = true;
    }
    if (doWithTuplesAtThisDepth) {
        groupRelation.visitTuples(function (tuple) {
            doWithTuplesAtThisDepth(tuple);
        }.bind(this));
        hasIntegrated = true;
    }
    return hasIntegrated;
};

GroupRelation.prototype.integrateGroupRelationToChildGroupRelations = function (groupRelation) {
    var hasIntegrated = false;
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        if (childGroupRelation.integrateGroupRelationToTreeIfApplicable(groupRelation)) {
            hasIntegrated = true;
        }
    });
    return hasIntegrated;
};

GroupRelation.prototype.isARelation = function () {
    var verticesKeys = Object.keys(this.vertices);
    if (1 !== verticesKeys.length) {
        return false;
    }
    return this.getSingleEdge().getUri() === this.getIdentification().getExternalResourceUri();
};

GroupRelation.prototype.getChip = function () {
    let html = this.getHtml();
    if (html) {
        return html.querySelectorAll('.v-chip')[0];
    }
};

GroupRelation.prototype._hasOneOfTheIdentifiers = function (identifiers) {
    var has = false;
    identifiers.forEach(function (identifier) {
        if (this.hasIdentification(identifier)) {
            has = true;
        }
    }.bind(this));
    return has;
};

GroupRelation.prototype._doesOneOfTheChildHasIdentifiers = function (identifiers) {
    var has = false;
    this.visitTuples(function (tuple) {
        var edge = tuple.edge;
        if (edge.hasAllIdentifiers(identifiers)) {
            has = true;
        }
    });
    return has;
};

GroupRelation.prototype._containsAllTuplesOfGroupRelation = function (groupRelation) {
    let containsAll = true;
    let presentAtGreaterDepth = false;
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        if (childGroupRelation._containsAllTuplesOfGroupRelation(groupRelation)) {
            presentAtGreaterDepth = true;
        }
    });
    if (!presentAtGreaterDepth) {
        Object.keys(groupRelation.getVertices()).forEach((vertexKey) => {
            if (this.vertices[vertexKey] === undefined) {
                containsAll = false;
                return false;
            }
        })
    }
    return containsAll;
};

GroupRelation.prototype.shouldAddLeft = function (centerBubble) {
    var nbLeft = 0;
    var nbRight = 0;
    this.visitTuples(function (tuple) {
        if (tuple.edge.isToTheLeft(centerBubble) === true) {
            nbLeft++;
        }
        if (tuple.edge.isToTheLeft(centerBubble) === false) {
            nbRight++;
        }
    });
    if (nbLeft === nbRight) {
        return undefined;
    }
    return nbLeft > nbRight;
};

GroupRelation.prototype.isShrinked = function () {
    return false;
};

api.GroupRelation = GroupRelation;

export default api;
