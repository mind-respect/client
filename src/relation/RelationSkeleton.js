import Relation from '@/relation/Relation'
import GraphElementType from '@/graph-element/GraphElementType'
import IdUri from '@/IdUri'

function RelationSkeleton(source, destination) {
    Relation.Relation.apply(this);
    this.init(
        Relation.buildObjectWithUriOfSelfSourceAndDestinationVertex(
            IdUri.uuid(),
            source.getUri(),
            destination.getUri()
        ),
        source,
        destination
    );
    this.parentVertex = this.parentBubble = source;
    destination.parentVertex = source;
    destination.parentBubble = this;
}

RelationSkeleton.prototype = new Relation.Relation();

RelationSkeleton.prototype.getGraphElementType = function () {
    return GraphElementType.RelationSkeleton;
};

RelationSkeleton.prototype.isSkeleton = function () {
    return true;
};

export default RelationSkeleton;