import Vertex from '@/vertex/Vertex'
import GraphElementType from '@/graph-element/GraphElementType'

function MetaGroupVertex(vertex) {
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

MetaGroupVertex.prototype = new Vertex.Vertex();

MetaGroupVertex.prototype.getGraphElementType = function () {
    return GraphElementType.MetaGroupVertex;
};

export default MetaGroupVertex;