/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import IdUri from '@/IdUri'
import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
import Service from '@/Service'
import UserService from "@/service/UserService";
import GroupRelation from '@/group-relation/GroupRelation'

const RelationService = {};

RelationService.updateLabel = function (edge, label) {
    return FriendlyResourceService.updateLabel(
        edge,
        label
    );
};
RelationService.inverse = function (edge) {
    return Service.geApi().put(
        edge.getUri() + "/inverse"
    );
};

RelationService.createFromSourceAndDestinationUri = function (sourceUri, destinationUri) {
    let sourceVertexUriFormatted = encodeURIComponent(
        sourceUri
    );
    let destinationVertexUriFormatted = encodeURIComponent(
        destinationUri
    );
    return Service.api().post(
        edgesUrl() + '?sourceVertexId=' + sourceVertexUriFormatted +
        '&destinationVertexId=' + destinationVertexUriFormatted
    ).then((response) => {
        return IdUri.removeDomainNameFromGraphElementUri(
            response.headers.location
        );
    });
};

RelationService.convertToGroupRelation = function (edgeUri, initialShareLevel, label) {
    let newGroupRelationShortId = IdUri.uuid();
    let newGroupRelationUri = "/service" + IdUri.groupRelationBaseUri() + "/" + newGroupRelationShortId;
    let newGroupRelation = GroupRelation.withUri(
        newGroupRelationUri
    );
    newGroupRelation.setLabel(label);
    newGroupRelation.setShareLevel(initialShareLevel);
    return {
        optimistic: newGroupRelation,
        promise: Service.geApi().post(
            edgeUri + "/convertToGroupRelation",
            {
                newGroupRelationShortId: newGroupRelationShortId,
                initialShareLevel: initialShareLevel,
                label
            }
        ).then(() => {
            return newGroupRelation;
        })
    }
};

export default RelationService;

function edgesUrl() {
    return UserService.currentUserUri() + "/graph/edge";
}

