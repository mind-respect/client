import Vertex from '@/vertex/Vertex'
import IdUri from '@/IdUri'
import GraphElementType from "@/graph-element/GraphElementType";
function VertexSkeleton() {
    Vertex.Vertex.apply(this);
    this.init(
        Vertex.buildServerFormatFromUri(
            IdUri.uuid()
        )
    );
}

VertexSkeleton.prototype = new Vertex.Vertex();

VertexSkeleton.prototype.getGraphElementType = function () {
    return GraphElementType.VertexSkeleton;
};

VertexSkeleton.prototype.isSkeleton = function(){
    return true;
};

export default VertexSkeleton;