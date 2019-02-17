/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import JqueryNano from '@/jquery/jquery.nano'

var api = {};
api.withTemplateGroup = function (templateGroup) {
    return new Template(templateGroup);
};

function Template(templateGroup) {
    this.add = function (name, html) {
        templateGroup[name] = {
            merge: function (obj) {
                return $($.nano(html, obj || null));
            }
        };
    };
}

export default api;
