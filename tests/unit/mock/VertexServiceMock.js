import TestUtil from '../util/TestUtil'
import VertexService from '@/vertex/VertexService'
import Triple from '@/triple/Triple'


const api = {};
const spies = {};
api.applyDefault = function () {
    spies["addTuple"] = api.addTuple();
    return spies;
};


api.addTuple = function () {
    return jest.spyOn(VertexService, "addTuple").mockImplementation((sourceVertex) => {
        let destinationVertex = TestUtil.generateVertex();
        return Promise.resolve(
            Triple.fromEdgeAndSourceAndDestinationVertex(
                TestUtil.generateEdge(
                    sourceVertex.getUri(),
                    destinationVertex.getUri()
                ),
                sourceVertex,
                destinationVertex
            )
        );
    })
};

export default api;
