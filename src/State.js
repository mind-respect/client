/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import IdUri from '@/IdUri'
import UserService from '@/service/UserService'
import FriendService from '@/friend/FriendService'
import Store from '@/store'
import Router from 'vue-router'

const api = {};
let _isViewOnly,
    _isAnonymous,
    _isTagCloudFlow = false,
    _isAuthenticatedLandingPageFlow = false,
    _isFriend = false;
api.defaultVertexUri = function () {
    return UserService.currentUserUri() + '/graph/vertex/any';
};
api.isCenterBubbleUriDefinedInUrl = function () {
    return IdUri.getGraphElementUriInUrl() !== undefined;
};

api.getCenterBubbleUri = function () {
    return IdUri.getGraphElementUriInUrl();
};
api.isViewOnly = function () {
    api.defineIsViewOnly();
    return _isViewOnly;
};
api.defineIsViewOnly = function (force) {
    if (!force && _isViewOnly !== undefined) {
        return;
    }
    _isViewOnly = _isTagCloudFlow || _isAuthenticatedLandingPageFlow ?
        false : _isAnonymous || !IdUri.isGraphElementUriOwnedByCurrentUser(
        IdUri.getGraphElementUriInUrl()
    );
    Store.dispatch("setIsViewOnly", _isViewOnly);
};

api.defineIsFriend = function () {
    return FriendService.getStatusWithUser(
        IdUri.currentUsernameInUrl()
    ).then(function (status) {
        _isFriend = status.status === 'confirmed';
    });
};

api.isFriend = function () {
    return _isFriend;
};

api.setIsTagCloudFlow = function (isTagCloudFlow) {
    _isTagCloudFlow = isTagCloudFlow;
};

api.isTagCloudFlow = function () {
    return _isTagCloudFlow;
};
api.setIsAuthenticatedLandingPageFlow = function (isAuthenticatedLandingPageFlow) {
    _isAuthenticatedLandingPageFlow = isAuthenticatedLandingPageFlow;
};
api.isAuthenticatedLandingPageFlow = function () {
    return _isAuthenticatedLandingPageFlow;
};
api.setIsAnonymous = function (isAnonymous) {
    _isAnonymous = isAnonymous;
};
api.isAnonymous = function () {
    return _isAnonymous;
};
api.isGraphFlow = function () {
    return Router.name === 'Center';
};
api._setIsViewOnly = function (isViewOnly) {
    _isViewOnly = isViewOnly;
    Store.dispatch("setIsViewOnly", _isViewOnly);
};

// api.isInCompareMode = function () {
//     var $compareFlowWarning = $(
//         "#compare-flow-warning"
//     );
//     return $compareFlowWarning.length > 0 && !$compareFlowWarning.hasClass(
//         "hidden"
//     );
// };
export default api;
