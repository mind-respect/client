/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/Service'
import UserService from '@/service/UserService'

export default {
    getPublicAndPrivate: function () {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements"
        );
    },
    getPublicAndPrivateWithSkip: function (nbSkip) {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements/skip/" + nbSkip
        );
    },
    getPublicOnlyForUsername: function (username) {
        return Service.api().get(
            UserService.getUsersResourceUrl() + username + "/center-elements/public"
        );
    },
    getPublicOnlyForUsernameWithSkip: function (username, nbSkip) {
        return Service.api().get(
            UserService.getUsersResourceUrl() + username + "/center-elements/public/skip/" + nbSkip
        );
    },
    removeCenterWithUri: function (centerUri) {
        return Service.geApi().delete(
            centerUri + "/center"
        );
    }
}
