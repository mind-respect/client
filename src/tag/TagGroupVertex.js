import Vertex from '@/vertex/Vertex'
import GraphElementType from '@/graph-element/GraphElementType'

function TagGroupVertex(vertex) {
    Vertex.Vertex.apply(this);
    this.init(
        Vertex.buildServerFormatFromUri(
            vertex.getUri()
        )
    );
    this.setLabel(vertex.getLabel());
    this.setComment(vertex.getComment());
    this.setChildrenIndex(vertex.getChildrenIndex());
}

TagGroupVertex.prototype = new Vertex.Vertex();

TagGroupVertex.prototype.getGraphElementType = function () {
    return GraphElementType.MetaGroupVertex;
};

TagGroupVertex.prototype.getNumberOfChild = function (isLeft) {
    let children = this.getNextChildren(isLeft);
    return children.length ? children.length : this.nbNeighbors.getTotal();
};

export default TagGroupVertex;