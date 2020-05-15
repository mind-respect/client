/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import RelationService from '@/relation/RelationService'
import TestUtil from '../util/TestUtil'

const RelationServiceMock = {};
RelationServiceMock.applyDefault = function () {
    const spies = {};
    spies["createFromSourceAndDestinationUri"] = RelationServiceMock.createFromSourceAndDestinationUri();
    return spies;
};
RelationServiceMock.createFromSourceAndDestinationUri = function () {
    return jest.spyOn(
        RelationService,
        "createFromSourceAndDestinationUri"
    ).mockImplementation(() => {
        return TestUtil.generateEdgeUri();
    });
};
export default RelationServiceMock;
