/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Service from '@/Service'

const usersResourceUrl = "/users/";
const sessionResourceUrl = usersResourceUrl + "session/";
let authenticatedUserInCache;
const UserService = {
    getUsersResourceUrl: function () {
        return usersResourceUrl;
    },
    authenticatedUserInCache: function () {
        return authenticatedUserInCache || {};
    },
    setAuthenticatedUserInCache: function (user) {
        authenticatedUserInCache = user;
    },
    currentUserUri: function () {
        return usersResourceUrl + UserService.authenticatedUserInCache().user_name;
    },
    hasCurrentUser: function () {
        return authenticatedUserInCache !== undefined;
    },
    authenticatedUser: function () {
        return UserService._getCurrentUser().then(function (response) {
            response.data.preferred_locales = JSON.parse(
                response.data.preferred_locales
            );
            authenticatedUserInCache = response.data;
            return response;
        });
    },
    _getCurrentUser: function () {
        console.log("inside real user")
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
        )
    }
};
export default UserService
