/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Service from '@/Service'
import UserService from '@/service/UserService'

export default {
    getPublicAndPrivate: function () {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements"
        );
    },
    getPublicOnlyForUsername: function (username) {
        return Service.api().get(
            UserService.getUsersResourceUrl() + username + "/center-elements/public"
        );
    },
    removeCentersWithUri: function (centersUri) {
        return Service.api().delete(
            UserService.currentUserUri() + "/center-elements",
            {data: centersUri}
        );
    }
}
