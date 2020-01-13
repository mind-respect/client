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

export default TagGroupVertex;