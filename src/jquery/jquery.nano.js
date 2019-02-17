/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'

$.nano = function (template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split("."), value = data[keys.shift()];
        $.each(keys, function () {
            value = value !== undefined ? value[this] : undefined;
        });
        return (value === null || value === undefined) ? "" : value;
    });
};

export default {};
