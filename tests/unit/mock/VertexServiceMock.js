import TestUtil from '../util/TestUtil'
import VertexService from '@/vertex/VertexService'

const api = {};
const spies = {};
api.applyDefault = function () {
    spies["makePublic"] = api.makePublic();
    spies["makePrivate"] = api.makePrivate();
    spies["createVertex"] = api.createVertex();
    return spies;
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
