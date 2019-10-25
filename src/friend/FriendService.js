/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/Service'
import UserService from '@/service/UserService'

export default {
    listForUser: function (username) {
        return Service.api().get(
            "/friend-list/user/" + username
        );
    },
    addFriend: function (username) {
        return Service.api().post(
            UserService.currentUserUri() + "/friends",
            {
                friendUsername: username
            }
        );
    },
    confirmFriendshipUsingUrlToken: function (requestUsename, destinationUsername, confirmToken) {
        return Service.api().post(
            UserService.currentUserUri() + "/friends/confirm-friendship-with-token",
            {
                requestUsername: requestUsename,
                destinationUsername: destinationUsername,
                confirmToken: confirmToken
            }
        );
    },
    getStatusWithUser: function (username) {
        return Service.api().get(
            UserService.currentUserUri() + "/friends/" + username + "/status"
        )
    }
};
