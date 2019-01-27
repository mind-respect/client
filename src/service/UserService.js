/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import EventBus from '@/EventBus'
import Service from '@/service'

const usersResourceUrl = "/users/";
const sessionResourceUrl = usersResourceUrl + "session/";
let authenticatedUserInCache;
const UserService = {
    getUsersResourceUrl: function () {
        return usersResourceUrl;
    },
    authenticatedUserInCache: function () {
        return authenticatedUserInCache;
    },
    setAuthenticatedUserInCache: function (user) {
        authenticatedUserInCache = user;
    },
    getDefaultVertexUri: function (username, callback) {
        return $.ajax({
            type: 'GET',
            url: usersResourceUrl + username + "/graph/vertex/any"
        }).done(callback);
    },
    currentUserUri: function () {
        return usersResourceUrl + UserService.authenticatedUserInCache().user_name;
    },
    hasCurrentUser: function () {
        return authenticatedUserInCache !== undefined;
    },
    authenticate: function (loginInfo, callback, errorCallback) {
        return $.ajax({
            type: 'POST',
            data: JSON.stringify(loginInfo),
            url: sessionResourceUrl,
            contentType: 'application/json'
        }).done(callback)
            .fail(errorCallback);
    },
    register: function (userObject, successCallback, errorCallback) {
        return $.ajax({
            type: 'POST',
            url: usersResourceUrl,
            data: JSON.stringify(userObject),
            contentType: 'application/json;charset=utf-8'
        }).done(successCallback)
            .fail(function (xhr) {
                errorCallback(
                    JSON.parse(xhr.responseText)
                );
            });
    },
    authenticatedUser: function () {
        return Service.api().get(sessionResourceUrl).then(function (response) {
            response.data.preferred_locales = JSON.parse(
                response.data.preferred_locales
            );
            authenticatedUserInCache = response.data;
            EventBus.publish(
                '/event/ui/user/get_authenticated/success',
                authenticatedUserInCache
            );
            return response;
        });
    },
    isAuthenticated: function (isAuthenticatedCallBack, isNotAuthenticatedCallBack) {
        return $.ajax({
            type: 'GET',
            url: usersResourceUrl + "is_authenticated"
        }).done(function (isAuthenticated) {
            if (isAuthenticated.is_authenticated) {
                isAuthenticatedCallBack();
                return;
            }
            isNotAuthenticatedCallBack();
        }).fail(isNotAuthenticatedCallBack);
    },
    logout: function (successCallBack) {
        return $.ajax({
            type: 'DELETE',
            url: sessionResourceUrl
        }).done(successCallBack);
    },
    resetPassword: function (email, callback, errorCallback) {
        return $.ajax({
            type: 'POST',
            url: "/service/reset-password",
            contentType: 'application/json',
            data: JSON.stringify({email: email})
        }).done(callback).fail(errorCallback);
    },
    changePassword: function (password, email, token, callback, errorCallback) {
        return $.ajax({
            type: 'POST',
            url: "/service/users/password",
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password,
                token: token
            })
        }).done(callback).fail(errorCallback);
    },
    search: function (searchText) {
        return $.ajax({
            type: 'POST',
            data: JSON.stringify({
                "searchText": searchText
            }),
            contentType: 'application/json;charset=utf-8',
            url: UserService.currentUserUri() + "/search-users"
        });
    }
};
export default UserService
