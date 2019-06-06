import GraphService from '@/graph/GraphService'

const api = {};
api.getGraphSpy = jest.spyOn(GraphService, "getForCentralBubbleUri");
api.getForCentralBubbleUri = function (graph) {
    api.getGraphSpy.mockImplementation(() => {
        return Promise.resolve({
            data: graph
        })
    });
    return api.getGraphSpy;
};
api.getForCentralBubbleUriAndGraph = function (uri, serverGraphToReturn) {
    let multipleGraphs = {};
    multipleGraphs[uri] = serverGraphToReturn;
    return api.getForCentralBubbleUriMultiple(
        multipleGraphs
    );
};
api.getForCentralBubbleUriMultiple = function (multiple) {
    return api.getGraphSpy.mockImplementation((centerUri) => {
        return Promise.resolve({
            data: multiple[centerUri]
        });
    });
};

export default api;