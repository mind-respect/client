/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import IdUri from '@/IdUri'

import GraphService from '@/graph/GraphService'
import GraphElementService from '@/graph-element/GraphElementService'
import VertexServiceMock from './VertexServiceMock'
import UserServiceMock from './UserServiceMock'
import EdgeServiceMock from './EdgeServiceMock'

const crypto = require('crypto');

Object.defineProperty(global.self, 'crypto', {
    value: {
        getRandomValues: arr => crypto.randomBytes(arr.length),
    },
});

const api = {
    spies: {}
};
jest.spyOn(GraphElementService, "saveChildrenIndex").mockImplementation(() => {
    return Promise.resolve();
})

jest.spyOn(console, "warn").mockImplementation(() => {

})

api.setCenterBubbleUriInUrl = function (centerVertexUri) {
    window.graphElementTypeForBublGuru = IdUri.getGraphElementTypeFromUri(
        centerVertexUri
    );
    window.graphElementShortIdForBublGuru = IdUri.getGraphElementShortIdFromUri(
        centerVertexUri
    );
    IdUri.getGraphElementUriInUrl = function () {
        return centerVertexUri;
    };
};

api.applyDefault = function () {
    api.spies["UserService"] = UserServiceMock.applyDefault();
    api.spies["VertexService"] = VertexServiceMock.applyDefault();
    api.spies["EdgeService"] = EdgeServiceMock.applyDefault();
};

api.setGetGraphFromService = function (graph) {
    let spy = jest.spyOn(GraphService, "getForCentralBubbleUri");
    spy.mockImplementation(() => {
        return Promise.resolve({
            data: graph
        })
    });
    return spy;
};
api.setGetSchemaFromService = function (schema) {
    SchemaService.get = function (schemaUri, callback) {
        callback(
            schema
        );
    };
};
api.getSearchResultDetailsToReturn = function (toReturn) {
    SearchService.getSearchResultDetails = function (uri, callback) {
        callback(toReturn);
    };
};

api.mockRemoveEdge = function () {
    return spyOn(EdgeService, "remove").and.callFake(function (edge, callback) {
        callback(edge);
    });
};
api.applyDefaultMocks = function () {
    spies["GraphElementService"] = {
        mocker: GraphElementServiceMock,
        spies: GraphElementServiceMock.applyDefaultMocks()
    };
    spies["FriendlyResourceService"] = {
        mocker: FriendlyResourceServiceMock,
        spies: FriendlyResourceServiceMock.applyDefaultMocks()
    };
    spies["Wikidata"] = {
        mocker: WikidataMock,
        spies: WikidataMock.applyDefaultMocks()
    };
    spies["BubbleDeleteMenu"] = {
        mocker: BubbleDeleteMenuMock,
        spies: BubbleDeleteMenuMock.applyDefaultMocks()
    };
    SelectionHandler.removeAll();
};
api.getSpy = function (object, method) {
    return spies[object].spies[method];
};
api.resetSpy = function (object, method) {
    api.getSpy(object, method).calls.reset();
};
api.newSpy = function (object, method, args) {
    api.resetSpy(object, method);
    return spies[object].mocker[method].apply(this, args);
};

api.applyDefault();

export default api;