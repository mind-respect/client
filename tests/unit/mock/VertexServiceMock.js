import TestUtil from '../util/TestUtil'
import VertexService from '@/vertex/VertexService'
import Triple from '@/triple/Triple'


const api = {};
const spies = {};
api.applyDefault = function () {
    spies["addTuple"] = api.addTuple();
    spies["makeCollectionPrivate"] = api.makeCollectionPrivate();
    spies["makeCollectionPublic"] = api.makeCollectionPublic();
    spies["makePublic"] = api.makePublic();
    spies["makePrivate"] = api.makePrivate();
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


api.makeCollectionPrivate = function () {
    return jest.spyOn(VertexService, "makeCollectionPrivate").mockImplementation(() => {
        return Promise.resolve();
    });
};
api.makeCollectionPublic = function () {
    return jest.spyOn(VertexService, "makeCollectionPublic").mockImplementation(() => {
        return Promise.resolve();
    });
};
api.makePublic = function () {
    return jest.spyOn(VertexService, "makePublic").mockImplementation(() => {
        return Promise.resolve();
    });
};
api.makePrivate = function () {
    return jest.spyOn(VertexService, "makePrivate").mockImplementation(function () {
        return Promise.resolve();
    });
};

export default api;
