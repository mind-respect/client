/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'

const api = {};
String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
api.makeChildInheritParent = function (childApi, parentApi) {
    return $.extend(
        {},
        parentApi,
        childApi
    );
};
export default api;
