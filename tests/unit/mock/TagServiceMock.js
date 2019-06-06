import TestUtil from '../util/TestUtil'
import TagService from '@/identifier/TagService'

const api = {};
const spies = {};
api.applyDefault = function () {
    spies["add"] = api.add();
    return spies;
};


api.add = function () {
    return jest.spyOn(TagService, "add").mockImplementation((graphElement, identification) => {
        identification.setUri(
            TestUtil.generateIdentificationUri()
        );
        return Promise.resolve(
            [identification]
        );
    });
};

export default api;
