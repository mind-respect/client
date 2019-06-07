import GraphElementService from '@/graph-element/GraphElementService'

const api = {};
const spies = {};

api.applyDefault = function () {
    spies["remove"] = api.remove();
    spies["removeCollection"] = api.removeCollection();
};

api.remove = function () {
    return jest.spyOn(GraphElementService, "remove").mockImplementation((vertex) => {
        return Promise.resolve(vertex);
    });
};

api.removeCollection = function () {
    return jest.spyOn(GraphElementService, "removeCollection").mockImplementation(() => {
        return Promise.resolve();
    });
};

export default api;