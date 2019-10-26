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
    getAllPublic: function () {
        return Service.api().get(
            "/center-elements/public"
        );
    },
    getAllPublicWithSkip: function (nbSkip) {
        return Service.api().get(
            "/center-elements/public/skip/" + nbSkip
        );
    },
    getPatterns: function () {
        return Service.api().get(
            "/center-elements/public/pattern"
        );
    },
    getPatternsWithSkip: function (nbSkip) {
        return Service.api().get(
            "/center-elements/public/pattern/skip/" + nbSkip
        );
    },
    getPublicAndPrivateWithSkip: function (nbSkip) {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements/skip/" + nbSkip
        );
    },
    getPublicOnlyForUsername: function (username) {
        return Service.api().get(
            "/center-elements/public/user/" + username
        );
    },
    getPublicOnlyForUsernameWithSkip: function (username, nbSkip) {
        return Service.api().get(
            "/center-elements/public/user/" + username + "/skip/" + nbSkip
        );
    },
    getFriendsFeed: function () {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements/friend"
        );
    },
    getFriendsFeedWithSkip: function (nbSkip) {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements/friend/skip/" + nbSkip
        );
    },
    getOfAFriend: function (friendName) {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements/friend/" + friendName
        );
    },
    getOfAFriendWithSkip: function (friendName, nbSkip) {
        return Service.api().get(
            UserService.currentUserUri() + "/center-elements/friend/" + friendName + "/skip/" + nbSkip
        );
    },
    removeCenterWithUri: function (centerUri) {
        return Service.geApi().delete(
            centerUri + "/center"
        );
    }
}
