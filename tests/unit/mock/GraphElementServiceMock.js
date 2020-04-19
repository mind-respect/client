import GraphElementService from '@/graph-element/GraphElementService'

const api = {};
const spies = {};

api.applyDefault = function () {
    spies["remove"] = api.remove();
};

api.remove = function () {
    return jest.spyOn(GraphElementService, "remove").mockImplementation((vertex) => {
        return Promise.resolve(vertex);
    });
};

export default api;