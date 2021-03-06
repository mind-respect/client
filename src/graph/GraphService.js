/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import IdUri from '@/IdUri'
import State from '@/State'
import Service from '@/Service'

const api = {};
api.getForCentralBubbleUri = function (centralBubbleUri) {
    return Service.geApi().get(
        api.graphUriForCentralBubbleUri(
            centralBubbleUri
        )
    );
};
// api.getForCentralVertexUriAtDepth = function (centralVertexUri, depth) {
//     return $.ajax({
//         type: 'GET',
//         url: api.graphUriForCentralBubbleUri(centralVertexUri) + "?depth=" + depth
//     });
// };
api.graphUriForCentralBubbleUri = function (centralBubbleUri) {
    if (!State.isAnonymous() && IdUri.isGraphElementUriOwnedByCurrentUser(centralBubbleUri)) {
        var uri = centralBubbleUri + "/surround_graph";
        if (State.getCenterBubbleUri() === centralBubbleUri) {
            uri += "?center=true";
        }
        return uri;
    } else {
        return IdUri.convertGraphElementUriToNonOwnedUri(centralBubbleUri);
    }
};
export default api;
