import Service from '@/Service'
import Triple from '@/triple/Triple'
import Relation from '@/relation/Relation'
import Vertex from '@/vertex/Vertex'
import IdUri from '@/IdUri'
import UserService from "../service/UserService";
import api from "../graph-element/GraphElementService";

const ForkService = {};

ForkService.addTuple = function (fork, afterPromise) {
    let newVertexId = IdUri.uuid();
    let newEdgeId = IdUri.uuid();
    let newVertex = Vertex.withUri(
        "/service" + IdUri.vertexBaseUri() + "/" + newVertexId
    );
    let newEdge = Relation.withUriAndSourceAndDestinationVertex(
        "/service" + IdUri.edgeBaseUri() + "/" + newEdgeId,
        fork,
        newVertex
    );
    afterPromise = afterPromise || Promise.resolve();
    return {
        optimistic: Triple.fromEdgeAndSourceAndDestinationVertex(
            newEdge,
            fork,
            newVertex
        ),
        promise: new Promise(async (resolve) => {
            await afterPromise;
            let response = await Service.geApi().post(
                fork.getUri(),
                {
                    vertexId: newVertexId,
                    edgeId: newEdgeId
                }
            );
            resolve(
                Triple.fromEdgeAndSourceAndDestinationVertex(
                    Relation.fromServerFormat(response.data.edge),
                    fork,
                    Vertex.fromServerFormat(response.data.end_vertex)
                )
            );
        })
    };
};

ForkService.removeCollection = function (forks) {
    return Service.api().request({
        url: UserService.currentUserUri() + '/graph/fork/collection',
        method: 'delete',
        data: api._getGraphElementsUrl(forks)
    });
}

ForkService.setCollectionShareLevel = function (shareLevel, forks) {
    return Service.api().post(
        UserService.currentUserUri() + '/graph/fork/collection/share-level',
        {
            shareLevel: shareLevel,
            graphElementsUri: urisOfGraphElements(forks)
        }
    );
};

function urisOfGraphElements(graphElements) {
    return graphElements.map(function (graphElement) {
        return graphElement.getUri();
    });
}

export default ForkService;