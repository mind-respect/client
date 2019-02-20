/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import DOMPurify from 'dompurify'

let idIndex = 0;
$.fn.uniqueId = function (html) {
    return $(html).prop(
        "id",
        idIndex++
    );
};
export default {};
