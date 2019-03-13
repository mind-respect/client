/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import GraphUi from '@/graph/GraphUi'
import GraphElement from '@/graph-element/GraphElement'
import Identification from '@/identifier/Identification'
import GraphElementType from '@/graph-element/GraphElementType'
import GroupRelationController from '@/group-relation/GroupRelationController'

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
    Identification.Identification.apply(
        this
    );
    this.init(
        this.getIdentification().getServerFormat()
    );
}

GroupRelation.prototype = new Identification.Identification();

GroupRelation.prototype.getLeftBubble = function () {
    return this.isToTheLeft() ? this.getFirstEdge(0) : this.parentBubble;
};

GroupRelation.prototype.getRightBubble = function (bottom) {
    if (this.isToTheLeft()) {
        return this.parentBubble;
    }
    return bottom ? this.getLastEdge(0) : this.getFirstEdge(0);
};

GroupRelation.prototype.getImmediateChild = function () {
    let edges = [];
    this.sortedImmediateChild(this.parentVertex).map(function (child) {
        Object.keys(child).forEach(function (id) {
            edges.push(child[id].edge);
        }.bind(this));
    });
    return edges;
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
    var immediateChild = this.getVerticesAsArray().concat(this.childGroupRelations);
    return immediateChild.sort(function (a, b) {
        var graphElementA = a instanceof GroupRelation ?
            a.getFirstVertex(childIndex) :
            a;
        var graphElementB = b instanceof GroupRelation ?
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
    return this.getLastTuple(childrenIndex).vertex;
};

GroupRelation.prototype.getFirstEdge = function (childrenIndex) {
    return this.getFirstTuple(childrenIndex).edge;
};

GroupRelation.prototype.getLastEdge = function (childrenIndex) {
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
GroupRelation.prototype.addTuple = function (tuple) {
    if (this.vertices[tuple.vertex.getUri()] === undefined) {
        this.vertices[tuple.vertex.getUri()] = {};
    }
    this.vertices[
        tuple.vertex.getUri()
        ][
        GraphUi.generateBubbleHtmlId()
        ] = {
        vertex: tuple.vertex,
        edge: tuple.edge
    };
};
GroupRelation.prototype.visitTuples = function (visitor) {
    $.each(this.vertices, function (vertexUri, verticesWithSameUri) {
        $.each(verticesWithSameUri, function (vertexHtmlId, tuple) {
            visitor(tuple);
        });
    });
};
GroupRelation.prototype.removeTuple = function (tuple) {
    delete this.vertices[tuple.vertex.getUri()];
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
    var vertices = $.extend(true, {}, this.vertices);
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        $.extend(true, vertices, childGroupRelation.getVerticesAtAnyDepth());
    });
    return vertices;
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
    var groupRelationVertices = this.getSortedVerticesAtAnyDepth(childrenIndex);
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

GroupRelation.prototype.getIdentifiersAtAnyDepth = function () {
    var identifiers = [].concat(this.identifiers);
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        identifiers = identifiers.concat(childGroupRelation.getIdentifiersAtAnyDepth());
    });
    return identifiers;
};

GroupRelation.prototype.hasRelevantTags = function () {
    return true;
};

GroupRelation.prototype.hasIdentifications = function () {
    return true;
};
GroupRelation.prototype.hasIdentification = function (identification) {
    var contains = false;
    $.each(this.identifiers, function () {
        if (this.getExternalResourceUri() === identification.getExternalResourceUri()) {
            contains = true;
            return false;
        }
    });
    return contains;
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
    var containsAll = true;
    var presentAtGreaterDepth = false;
    this.getChildGroupRelations().forEach(function (childGroupRelation) {
        if (childGroupRelation._containsAllTuplesOfGroupRelation(groupRelation)) {
            presentAtGreaterDepth = true;
        }
    });
    if (!presentAtGreaterDepth) {
        $.each(groupRelation.getVertices(), function (vertexKey) {
            if (this.vertices[vertexKey] === undefined) {
                containsAll = false;
                return false;
            }
        }.bind(this));
    }
    return containsAll;
};

GroupRelation.prototype.isToTheLeft = function (centerBubble) {
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
