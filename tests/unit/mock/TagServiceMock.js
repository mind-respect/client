import TestUtil from '../util/TestUtil'
import TagService from '@/tag/TagService'
import IdUri from "@/IdUri";

const api = {};
const spies = {};
api.applyDefault = function () {
    spies["add"] = api.add();
    return spies;
};


api.add = function () {
    return jest.spyOn(TagService, "add").mockImplementation((graphElement, tag) => {
        tag.setUri(
            TestUtil.generateIdentificationUri()
        );
        tag.getNbNeighbors().nbPrivate++;
        if (IdUri.isUriOfAGraphElement(tag.getExternalResourceUri())) {
            tag.getNbNeighbors().nbPrivate++;
        }
        return Promise.resolve(
            [tag]
        );
    });
};

export default api;
