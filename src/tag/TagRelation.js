import Relation from '@/relation/Relation'
import GraphElementType from '@/graph-element/GraphElementType'
import IdUri from '@/IdUri'

function TagRelation(sourceVertex, destinationVertex) {
    Relation.Relation.apply(this);
    this.init(
        Relation.buildObjectWithUriOfSelfSourceAndDestinationVertex(
            IdUri.uuid(),
            sourceVertex.getUri(),
            destinationVertex.getUri()
        ),
        sourceVertex,
        destinationVertex
    );
}

TagRelation.prototype = new Relation.Relation();

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

TagRelation.prototype.getTagVertex = function () {
    return this.getNextBubble().isMeta() ?
        this.getNextBubble() :
        this.getClosestAncestorInTypes([GraphElementType.Meta]);
};

TagRelation.prototype.getTaggedBubble = function () {
    return this.getNextBubble().isMeta() ?
        this.getParentBubble() :
        this.getNextBubble();
};


export default TagRelation;