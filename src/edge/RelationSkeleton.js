import Edge from '@/edge/Edge'
import GraphElementType from '@/graph-element/GraphElementType'
import IdUri from '@/IdUri'

function RelationSkeleton(source, destination) {
    Edge.Edge.apply(this);
    this.init(
        Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
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

RelationSkeleton.prototype = new Edge.Edge();

RelationSkeleton.prototype.getGraphElementType = function () {
    return GraphElementType.RelationSkeleton;
};

RelationSkeleton.prototype.isSkeleton = function () {
    return true;
};

export default RelationSkeleton;