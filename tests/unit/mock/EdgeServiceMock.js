/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import EdgeService from '@/edge/EdgeService'


const api = {};
api.applyDefault = function () {
    const spies = {};
    spies["changeSource"] = api.changeSource();
    spies["changeDestination"] = api.changeDestination();
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
export default api;
