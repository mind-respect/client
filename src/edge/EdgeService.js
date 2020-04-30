import Service from '@/Service'
import IdUri from '@/IdUri'

const EdgeService = {};

EdgeService.changeSource = function (newSource, edge, oldEndShareLevel, keptEndShareLevel, newEndShareLevel) {
    return Service.geApi().put(
        edge.getUri() + "/source/" + IdUri.elementIdFromUri(newSource.getUri()),
        {
            forkType: newSource.isGroupRelation() ? "GroupRelation" : "Vertex",
            oldEndShareLevel: oldEndShareLevel,
            keptEndShareLevel: keptEndShareLevel,
            newEndShareLevel: newEndShareLevel
        }
    )
};
EdgeService.changeDestination = function (newDestination, edge, oldEndShareLevel, keptEndShareLevel, newEndShareLevel) {
    return Service.geApi().put(
        edge.getUri() + "/destination/" + IdUri.elementIdFromUri(newDestination.getUri()),
        {
            forkType: newDestination.isGroupRelation() ? "GroupRelation" : "Vertex",
            oldEndShareLevel: oldEndShareLevel,
            keptEndShareLevel: keptEndShareLevel,
            newEndShareLevel: newEndShareLevel
        }
    );
};

export default EdgeService;