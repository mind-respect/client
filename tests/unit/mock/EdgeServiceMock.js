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
    spies["changeSourceVertex"] = api.changeSourceVertex();
    spies["changeDestinationVertex"] = api.changeDestinationVertex();
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
api.changeSourceVertex = function () {
    return jest.spyOn(
        EdgeService,
        "changeSourceVertex"
    ).mockImplementation(() => {
        return Promise.resolve();
    });
};
api.changeDestinationVertex = function () {
    return jest.spyOn(
        EdgeService,
        "changeDestinationVertex"
    ).mockImplementation(() => {
        return Promise.resolve();
    });
};
export default api;
