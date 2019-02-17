/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import DOMPurify from 'dompurify'

$.fn.saferHtml = function (html) {
    if (html === undefined) {
        html = this.html();
    }
    this.html(
        DOMPurify.sanitize(
            html, {
                ADD_TAGS: ['del', 'ins', 'DEL', 'INS'],
                ADD_ATTR: ['TITLE', 'title', 'style'],
                FORBID_TAGS: ['img']
            })
    );
    return this;
};
export default {};
