import TestUtil from '../util/TestUtil'
import VertexService from '@/vertex/VertexService'
import Triple from '@/triple/Triple'


const api = {};
const spies = {};
api.applyDefault = function () {
    spies["addTuple"] = api.addTuple();
    spies["makePublic"] = api.makePublic();
    spies["makePrivate"] = api.makePrivate();
    spies["createVertex"] = api.createVertex();
    return spies;
};


api.addTuple = function () {
    return jest.spyOn(VertexService, "addTuple").mockImplementation((sourceVertex) => {
        let destinationVertex = TestUtil.generateVertex();
        let triple = Triple.fromEdgeAndSourceAndDestinationVertex(
            TestUtil.generateEdge(
                sourceVertex.getUri(),
                destinationVertex.getUri()
            ),
            sourceVertex,
            destinationVertex
        );
        return {
            optimistic: triple,
            promise: Promise.resolve(triple)
        };
    })
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

api.createVertex = function () {
    return jest.spyOn(VertexService, "createVertex").mockImplementation(function () {
        return Promise.resolve(TestUtil.generateVertex());
    });
};


export default api;
