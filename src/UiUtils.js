/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery';

const api = {};
var _isChrome;

api.isMacintosh = function () {
    return navigator.platform.indexOf('Mac') > -1;
};

api.isChrome = function () {
    if (_isChrome === undefined) {
        _isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
    return _isChrome;
};

api.isElementFullyOnScreen = function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(element).offset().top;
    var elemBottom = elemTop + $(element).height();
    var isOnScreenVertically = (docViewTop < elemTop) &&
        (docViewBottom > elemBottom);
    var docViewLeft = $(window).scrollLeft();
    var docViewRight = docViewLeft + $(window).width();
    var elemLeft = $(element).offset().left;
    var elemRight = elemLeft + $(element).width();
    var isOnScreenHorizontally = (docViewLeft < elemLeft) &&
        (docViewRight > elemRight);
    return isOnScreenVertically && isOnScreenHorizontally;
};

export default api;
