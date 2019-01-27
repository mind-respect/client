/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import Service from '@/service'
import UserService from '@/service/UserService'

export default {
    getPublicAndPrivate: function () {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements"
        );
    },
    getPublicOnlyForUsername: function (username) {
        return $.ajax({
            method: 'GET',
            url: UserService.getUsersResourceUrl() + username + "/center-elements/public",
            dataType: 'json'
        });
    },
    removeCentersWithUri: function (centersUri) {
        return $.ajax({
            method: 'DELETE',
            url: UserService.currentUserUri() + "/center-elements",
            data: JSON.stringify(centersUri),
            dataType: 'json',
            contentType: 'application/json;charset=utf-8'
        });
    }
}
