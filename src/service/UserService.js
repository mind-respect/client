/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/Service'

const usersResourceUrl = "/users/";
const sessionResourceUrl = usersResourceUrl + "session/";
let authenticatedUserInCache;
const UserService = {
    authenticatedUserInCache: function () {
        return authenticatedUserInCache || {};
    },
    setAuthenticatedUserInCache: function (user) {
        authenticatedUserInCache = user;
    },
    currentUserUri: function () {
        return usersResourceUrl + UserService.authenticatedUserInCache().user_name;
    },
    authenticatedUser: function () {
        return UserService._getCurrentUser().then(function (response) {
            authenticatedUserInCache = response.data;
            return response;
        });
    },
    _getCurrentUser: function () {
        return Service.api().get(sessionResourceUrl);
    },
    resetPassword: function (email) {
        return Service.api().post(
            "reset-password",
            {email: email}
        );
    },
    changePassword: function (password, email, token) {
        return Service.api().post(
            "/users/password",
            {
                password: password,
                email: email,
                token: token
            }
        );
    },
    search: function (searchText) {
        return Service.api().post(
            UserService.currentUserUri() + "/search-users",
            {
                "searchText": searchText
            }
        );
    },
    updateConsultNotificationsDate: async function () {
        const response = await Service.api().post(
            UserService.currentUserUri() + "/consultNotificationDate"
        );
        return response.data.consultNotificationsDate;
    }
};
export default UserService
