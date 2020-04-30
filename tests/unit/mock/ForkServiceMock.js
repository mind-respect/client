/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import EdgeService from '@/edge/EdgeService'
import ForkService from "../../../src/fork/ForkService";
import Triple from '@/triple/Triple'
import TestUtil from '../util/TestUtil'

const api = {};
api.applyDefault = function () {
    const spies = {};
    spies["addTuple"] = api.addTuple();
    spies["changeSource"] = api.changeSource();
    spies["changeDestination"] = api.changeDestination();
    spies["addTuple"] = api.addTuple();
    spies["removeCollection"] = api.removeCollection();
    return spies;
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

api.addTuple = function () {
    return jest.spyOn(ForkService, "addTuple").mockImplementation((sourceVertex) => {
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
    return jest.spyOn(ForkService, "makePublic").mockImplementation(() => {
        return Promise.resolve();
    });
};

api.removeCollection = function () {
    return jest.spyOn(ForkService, "removeCollection").mockImplementation(() => {
        return Promise.resolve();
    });
};
export default api;
