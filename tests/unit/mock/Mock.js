/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import axios from 'axios'
import IdUri from '@/IdUri'

import GraphElementService from '@/graph-element/GraphElementService'
import VertexServiceMock from './VertexServiceMock'
import ForkServiceMock from './ForkServiceMock'
import GraphElementServiceMock from './GraphElementServiceMock'
import TagServiceMock from './TagServiceMock'
import UserServiceMock from './UserServiceMock'
import EdgeServiceMock from './EdgeServiceMock'
import RelationServiceMock from './RelationServiceMock'
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import Store from '@/store'
import MindMapInfo from '@/MindMapInfo'
import UiUtils from '@/UiUtils'
import Scroll from '@/Scroll'
import Breakpoint from '@/Breakpoint'
import NotificationService from "@/NotificationService";

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
    Breakpoint.set({
        mdAndDown: true,
        lgAndUp: false
    });
    Store.dispatch("setIsViewOnly", true);
    jest.spyOn(MindMapInfo, "isViewOnly").mockImplementation(() => {
        return false;
    });
    jest.spyOn(UiUtils, "getCenterOffsetCoordinates").mockImplementation(() => {
        return {};
    });
    jest.spyOn(UiUtils, "buildElementsAnimationData").mockImplementation(() => {
        return {};
    });
    jest.spyOn(UiUtils, "animateGraphElementsWithAnimationData").mockImplementation(() => {
        return Promise.resolve();
    });
    jest.spyOn(Scroll, "centerElement").mockImplementation(() => {
        return;
    });
    jest.spyOn(MindMapInfo, "defineIsViewOnly").mockImplementation(() => {
        return false;
    });
    jest.spyOn(NotificationService, "get").mockImplementation(() => {
        return [];
    });
    jest.spyOn(axios, "create").mockImplementation(() => {
        return {
            post: jest.fn(() => {
                return Promise.resolve()
            }),
            get: jest.fn(() => {
                return Promise.resolve({
                    data: {}
                })
            }),
            put: jest.fn(() => {
                return Promise.resolve();
            }),
            delete: jest.fn(() => {
                return Promise.resolve();
            }),
            interceptors: {
                response: {
                    use: jest.fn(() => {

                    })
                }
            }
        }
    });
    jest.spyOn(FriendlyResource.FriendlyResource.prototype, "focus").mockImplementation((event) => {
        //do nothing
    });
    api.spies["UserService"] = UserServiceMock.applyDefault();
    api.spies["VertexService"] = VertexServiceMock.applyDefault();
    api.spies["ForkService"] = ForkServiceMock.applyDefault();
    api.spies["EdgeService"] = EdgeServiceMock.applyDefault();
    api.spies["RelationService"] = RelationServiceMock.applyDefault();
    api.spies["TagService"] = TagServiceMock.applyDefault();
    api.spies["GraphElementService"] = GraphElementServiceMock.applyDefault();
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

api.getSpy = function (object, method) {
    return api.spies[object][method];
};
api.resetSpy = function (object, method) {
    api.getSpy(object, method).calls.reset();
};
api.newSpy = function (object, method, args) {
    api.resetSpy(object, method);
    return api.spies[object].mocker[method].apply(this, args);
};

api.applyDefault();

export default api;