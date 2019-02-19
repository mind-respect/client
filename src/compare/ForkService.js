/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import UserService from '@/service/UserService'

const api = {};
api.fork = function (subGraph, callback) {
    return $.ajax({
        type: 'POST',
        data: JSON.stringify(subGraph),
        url: UserService.currentUserUri() + "/fork",
        contentType: 'application/json'
    }).then(callback);
};
export default api;
