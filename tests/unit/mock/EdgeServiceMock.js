/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import TestUtils from '../util/TestUtil'
import EdgeService from '@/edge/EdgeService'


const api = {};
api.applyDefault = function () {
    const spies = {};
    // spies["remove"] = api.remove();
    // spies["addToFarVertex"] = api.addToFarVertex();
    // spies["inverse"] = api.inverse();
    spies["changeSource"] = api.changeSource();
    spies["changeDestination"] = api.changeDestination();
    return spies;
};
api.remove = function () {
    return spyOn(EdgeService, "remove").and.callFake(function (edge, callback) {
        EdgeService._removeCallback(
            edge,
            callback
        );
    });
};
api.addToFarVertex = function () {
    return spyOn(EdgeService, "_add").and.callFake(function (sourceVertexUri, destinationVertexUri) {
        return $.Deferred().resolve(
            EdgeService._buildAfterAddReturnObject(
                TestUtils.generateEdgeUri(),
                sourceVertexUri,
                destinationVertexUri
            )
        );
    });
};
api.inverse = function () {
    return spyOn(
        EdgeService,
        "inverse"
    ).and.callFake(function () {
        return $.Deferred().resolve();
    });
};
api.changeSource = function () {
    return jest.spyOn(
        EdgeService,
        "changeSource"
    ).mockImplementation(() => {
        return Promise.resolve();
    });
};
api.changeDestination = function () {
    return jest.spyOn(
        EdgeService,
        "changeDestination"
    ).mockImplementation(() => {
        return Promise.resolve();
    });
};
export default api;
