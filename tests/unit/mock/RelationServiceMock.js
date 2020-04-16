/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import TestUtils from '../util/TestUtil'
import RelationService from '@/relation/RelationService'


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
    return spyOn(RelationService, "remove").and.callFake(function (edge, callback) {
        RelationService._removeCallback(
            edge,
            callback
        );
    });
};
api.addToFarVertex = function () {
    return spyOn(RelationService, "_add").and.callFake(function (sourceVertexUri, destinationVertexUri) {
        return $.Deferred().resolve(
            RelationService._buildAfterAddReturnObject(
                TestUtils.generateEdgeUri(),
                sourceVertexUri,
                destinationVertexUri
            )
        );
    });
};
api.inverse = function () {
    return spyOn(
        RelationService,
        "inverse"
    ).and.callFake(function () {
        return $.Deferred().resolve();
    });
};
api.changeSource = function () {
    return jest.spyOn(
        RelationService,
        "changeSource"
    ).mockImplementation(() => {
        return Promise.resolve();
    });
};
api.changeDestination = function () {
    return jest.spyOn(
        RelationService,
        "changeDestination"
    ).mockImplementation(() => {
        return Promise.resolve();
    });
};
export default api;
