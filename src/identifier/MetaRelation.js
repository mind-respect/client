import Edge from '@/edge/Edge'
import GraphElementType from '@/graph-element/GraphElementType'
import IdUri from '@/IdUri'

function MetaRelation(tag, destinationVertex) {
    Edge.Edge.apply(this);
    this.init(
        Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
            IdUri.uuid(),
            tag.getUri(),
            destinationVertex.getUri()
        ),
        tag,
        destinationVertex
    );
}

MetaRelation.prototype = new Edge.Edge();

MetaRelation.prototype.getGraphElementType = function () {
    return GraphElementType.MetaRelation;
};

MetaRelation.prototype.setEdgeUri = function (edgeUri) {
    this.edgeUri = edgeUri;
};

MetaRelation.prototype.getEdgeUri = function () {
    return this.edgeUri;
};

MetaRelation.prototype.focus = function () {
    //do nothing
};


export default MetaRelation;