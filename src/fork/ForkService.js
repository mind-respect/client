import Service from '@/Service'
import Triple from '@/triple/Triple'
import Edge from '@/edge/Edge'
import Vertex from '@/vertex/Vertex'
import IdUri from '@/IdUri'

const ForkService = {};

ForkService.addTuple = function (fork, afterPromise) {
    let newVertexId = IdUri.uuid();
    let newEdgeId = IdUri.uuid();
    let newVertex = Vertex.withUri(
        "/service" + IdUri.vertexBaseUri() + "/" + newVertexId
    );
    let newEdge = Edge.withUriAndSourceAndDestinationVertex(
        "/service" + IdUri.edgeBaseUri() + "/" + newEdgeId,
        fork,
        newVertex
    );
    afterPromise = afterPromise || Promise.resolve();
    let promise = afterPromise.then(async () => {
        let response = await Service.geApi().post(
            fork.getUri(),
            {
                vertexId: newVertexId,
                edgeId: newEdgeId
            }
        );
        return Triple.fromEdgeAndSourceAndDestinationVertex(
            Edge.fromServerFormat(response.data.edge),
            fork,
            Vertex.fromServerFormat(response.data.end_vertex)
        );
    });
    return {
        optimistic: Triple.fromEdgeAndSourceAndDestinationVertex(
            newEdge,
            fork,
            newVertex
        ),
        promise: promise
    };
};

export default ForkService;