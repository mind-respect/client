/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/service'
import UserService from '@/service/UserService'

export default {
    list: function () {
        return Service.api().get(UserService.currentUserUri() + "/friends");
    },
    addFriend: function (username) {
        return Service.api().post(
            UserService.currentUserUri() + "/friends",
            {
                friendUsername: username
            }
        );
    },
    confirmFriendshipUsingUrlToken: function (url) {
        return Service.api().post(
            UserService.getUsersResourceUrl() + "confirm-friendship-with-token",
            {
                requestUsername: url.searchParams.get("requestUser"),
                destinationUsername: url.searchParams.get("destinationUser"),
                confirmToken: url.searchParams.get("confirm-token")
            }
        );
    },
    getStatusWithUser: function (username) {
        return Service.api().get(
            UserService.currentUserUri() + "/friends/" + username + "/status"
        )
    }
};
