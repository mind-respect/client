import Edge from '@/edge/Edge'
import GraphElementType from '@/graph-element/GraphElementType'
import IdUri from '@/IdUri'

function TagRelation(sourceVertex, destinationVertex) {
    Edge.Edge.apply(this);
    this.init(
        Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
            IdUri.uuid(),
            sourceVertex.getUri(),
            destinationVertex.getUri()
        ),
        sourceVertex,
        destinationVertex
    );
}

TagRelation.prototype = new Edge.Edge();

TagRelation.prototype.getGraphElementType = function () {
    return GraphElementType.MetaRelation;
};

TagRelation.prototype.setEdgeUri = function (edgeUri) {
    this.edgeUri = edgeUri;
};

TagRelation.prototype.getEdgeUri = function () {
    return this.edgeUri;
};

TagRelation.prototype.focus = function () {
    //do nothing
};


export default TagRelation;