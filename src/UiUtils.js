/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery';
import Point from '@/Point';
import BubbleFactory from '@/bubble/BubbleFactory'
import GraphElementButton from '@/graph-element/GraphElementButton'

const api = {};
var _isChrome;
avoidMultiplePopoversDisplayedAtTheSameTime();
$.fn.popoverLikeToolTip = function (options) {
    options = options || {};
    $(this).data("allowMultiplePopoverDisplayed", options.allowMultiplePopoverDisplayed);
    return this.popover(
        $.extend({
            placement: 'right',
            html: true,
            animation: false,
            content: function () {
                var graphElementUi = BubbleFactory.fromSubHtml($(this));
                if (graphElementUi) {
                    var button = GraphElementButton.fromHtml($(this));
                    var popoverContentFctn = graphElementUi[button.getAction() + "InLabelButtonContent"];
                    return popoverContentFctn === undefined ? "" :
                        popoverContentFctn.bind(graphElementUi)();
                } else {
                    return $(this).attr("data-content");
                }
            },
            trigger: 'hover',
            container: 'body',
            template: '<div class="popover like-tooltip" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
        }, options)
    );
};

api.isMacintosh = function () {
    return navigator.platform.indexOf('Mac') > -1;
};

api.isChrome = function () {
    if (_isChrome === undefined) {
        _isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
    return _isChrome;
};

api.positionLeft = function (componentToPosition, staticComponent) {
    var horizontalBuffer = 16;
    var componentOffset = Point.fromCoordinates(
        ($(componentToPosition).width() * -1) - horizontalBuffer,
        $(staticComponent).height() / 2 - $(componentToPosition).height() / 2
    );

    var staticComponentPosition = api.componentPosition(staticComponent);

    var componentPosition = Point.sumOfPoints(
        staticComponentPosition,
        componentOffset
    );
    if (isPositionVerticallyOffScreen(componentPosition)) {
        componentPosition.y = 10;
    }

    $(componentToPosition).css('left', componentPosition.x);
    $(componentToPosition).css('top', componentPosition.y);
};
api.positionRight = function (componentToPosition, staticComponent) {
    var componentOffset = Point.fromCoordinates(
        $(staticComponent).width(),
        $(staticComponent).height() / 2 - $(componentToPosition).height() / 2
    );

    var staticComponentPosition = api.componentPosition(staticComponent);

    var componentPosition = Point.sumOfPoints(
        staticComponentPosition,
        componentOffset
    );
    if (isPositionVerticallyOffScreen(componentPosition)) {
        componentPosition.y = 10;
    }

    $(componentToPosition).css('left', componentPosition.x);
    $(componentToPosition).css('top', componentPosition.y);
};

api.componentPosition = function (component) {
    return Point.fromCoordinates(
        $(component).offset().left,
        $(component).offset().top
    );
};

api.getBrowserSafeScrollX = function () {
    return Math.max($('body').scrollLeft(), $('html').scrollLeft());
};

api.getBrowserSafeScrollY = function () {
    return Math.max($('body').scrollTop(), $('html').scrollTop());
};

api.doComponentsCollide = function ($div1, $div2) {
    var x1 = $div1.offset().left;
    var y1 = $div1.offset().top;
    var h1 = $div1.outerHeight(true);
    var w1 = $div1.outerWidth(true);
    var b1 = y1 + h1;
    var r1 = x1 + w1;

    var x2 = $div2.offset().left;
    var y2 = $div2.offset().top;
    var h2 = $div2.outerHeight(true);
    var w2 = $div2.outerWidth(true);
    var b2 = y2 + h2;
    var r2 = x2 + w2;

    return !(b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2);
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

function isPositionVerticallyOffScreen(position) {
    return position.y < 10;
}

function avoidMultiplePopoversDisplayedAtTheSameTime() {
    var $currentPopover = null;
    //http://stackoverflow.com/a/24289767
    $(document).on('shown.bs.popover', function (ev) {
        var $target = $(ev.target);
        if ($target.data("allowMultiplePopoverDisplayed")) {
            return;
        }
        if ($currentPopover && ($currentPopover.get(0) !== $target.get(0))) {
            $currentPopover.popover('hide');
        }
        $currentPopover = $target;
    });

    $(document).on('hidden.bs.popover', function (ev) {
        var $target = $(ev.target);
        if ($target.data("allowMultiplePopoverDisplayed")) {
            return;
        }
        if ($currentPopover && ($currentPopover.get(0) === $target.get(0))) {
            $currentPopover = null;
        }
    });
}

export default api;
