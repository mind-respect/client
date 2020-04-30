/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import IdUri from '@/IdUri'
import Service from '@/Service'
import UserService from "@/service/UserService";
import GroupRelation from '@/group-relation/GroupRelation'

const RelationService = {};

RelationService.inverse = function (edge) {
    return Service.geApi().put(
        edge.getUri() + "/inverse"
    );
};

RelationService.createFromSourceAndDestinationUri = function (sourceUri, destinationUri, sourceShareLevel, destinationShareLevel) {
    let sourceUriFormatted = encodeURIComponent(
        sourceUri
    );
    let destinationUriFormatted = encodeURIComponent(
        destinationUri
    );
    return Service.api().post(
        edgesUrl(), {
            sourceUri: sourceUriFormatted,
            destinationUri: destinationUriFormatted,
            sourceShareLevel: sourceShareLevel,
            destinationShareLevel: destinationShareLevel
        }).then((response) => {
        return IdUri.removeDomainNameFromGraphElementUri(
            response.headers.location
        );
    });
};

RelationService.convertToGroupRelation = function (edgeUri, initialShareLevel, label, note) {
    let newGroupRelationShortId = IdUri.uuid();
    let newGroupRelationUri = "/service" + IdUri.groupRelationBaseUri() + "/" + newGroupRelationShortId;
    let newGroupRelation = GroupRelation.withUri(
        newGroupRelationUri
    );
    newGroupRelation.setLabel(label);
    newGroupRelation.setComment(note);
    newGroupRelation.setShareLevel(initialShareLevel);
    return {
        optimistic: newGroupRelation,
        promise: Service.geApi().post(
            edgeUri + "/convertToGroupRelation",
            {
                newGroupRelationShortId: newGroupRelationShortId,
                initialShareLevel: initialShareLevel,
                label: label,
                note: note
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

