import Vertex from '@/vertex/Vertex'
import GraphElementType from '@/graph-element/GraphElementType'

function TagGroupVertex(vertex) {
    Vertex.Vertex.apply(this);
    this.init(
        Vertex.buildServerFormatFromUri(
            vertex.getUri()
        )
    );
    this.originalNbNeighbors = vertex.originalNbNeighbors.clone();
    this.nbNeighbors = vertex.getNbNeighbors();
    this.setLabel(vertex.getLabel());
    this.setComment(vertex.getComment());
    this.setChildrenIndex(vertex.getChildrenIndex());
    this.setColors(vertex.getColors());
}

TagGroupVertex.prototype = new Vertex.Vertex();

TagGroupVertex.prototype.getGraphElementType = function () {
    return GraphElementType.MetaGroupVertex;
};

TagGroupVertex.prototype.removeChild = function (child, isTemporary, avoidRedraw) {
    Vertex.Vertex.prototype.removeChild.call(
        this,
        child,
        isTemporary,
        avoidRedraw
    );
    if (this.getNumberOfChild() === 0) {
        this.remove();
    }
};

export default TagGroupVertex;