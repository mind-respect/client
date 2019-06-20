/**
 * Copyright Vincent Blouin GNU General Public License v3.0
 */
import VueScrollTo from 'vue-scrollto'
import router from '@/router'
import Vue from 'vue'
import Store from '@/store'
import SideMenu from '@/SideMenu'

Vue.use(VueScrollTo);

const IS_ON_SCREEN_RIGHT_THRESHOLD = 100;

const Scroll = {
    goToSection: function (elementId, route) {
        VueScrollTo.scrollTo(
            document.getElementById(elementId), 500, {
                easing: 'linear',
                offset: -100
            }
        );
        if (route) {
            router.push(route);
        }
    },
    goToGraphElement: function (bubble) {
        let onlyScrollLeft = false;
        // if (bubble.isScrollPositionDefined()) {
        //     onlyScrollLeft = true;
        //     let rect = bubble.getHtml().getBoundingClientRect();
        //     let scrollTop = rect.top - bubble.scrollRect.top;
        //     document.scrollingElement.scrollTop += scrollTop;
        //     bubble.resetScrollPosition();
        // }
        let element = bubble.getHtml();
        if (!bubble.isCenter) {
            element = element.closest(".vertices-children-container");
        }
        let xOffset = SideMenu.getWidth() / 2.5;
        let options = {
            container: 'body',
            easing: 'ease',
            offset: function () {
                // let elementWidth = element.offsetWidth + (element.offsetWidth / 2)
                // let screenCenter = screen.width / 2;
                let offset;
                if (bubble.isCenter) {
                    offset = 650;
                } else if (bubble.isToTheLeft()) {
                    offset = Math.max(900 - element.offsetWidth, 0);
                } else {
                    offset = Math.max(200 + SideMenu.getWidth() - (element.offsetWidth / 6), 0)
                }
                let position = Math.abs(offset * screen.width / 1366) + xOffset;
                return position * -1;
            },
            force: true,
            cancelable: true,
            onStart: function (element) {
                // scrolling started
            },
            onCancel: function () {
                // scrolling has been interrupted
            },
            x: true,
            y: false
        };
        if (!onlyScrollLeft) {
            options.onDone = function (element) {
                options.x = false;
                options.y = true;
                options.offset = function () {
                    let position = Math.abs(300 * screen.height / 768);
                    return position * -1;
                };
                VueScrollTo.scrollTo(
                    element,
                    250,
                    options
                )
            };
        }
        VueScrollTo.scrollTo(
            element,
            150,
            options
        )
// or alternatively inside your components you can use
//         cancelScroll = Vue.$scrollTo(element, duration, options);
    },
    centerBubbleForTreeIfApplicable: function (bubble) {
        return Scroll.centerBubbleForTreeOrNotIfApplicable(
            bubble,
            true
        );
    },
    centerBubbleIfApplicable: function (bubble) {
        return Scroll.centerBubbleForTreeOrNotIfApplicable(
            bubble,
            false
        );
    },
    centerBubbleForTreeOrNotIfApplicable: function (bubble) {
        Vue.nextTick(function () {
            setTimeout(function () {
                let element = bubble.getLabelHtml();
                if (!element) {
                    return;
                }
                if (!bubble.isCenter && bubble.getNumberOfChild() > 0) {
                    element = element.closest(".vertices-children-container");
                }
                if (!Scroll.isElementFullyOnScreen(element)) {
                    Scroll.goToGraphElement(bubble)
                }
            }, 200)
        });
    }

};

Scroll.isElementFullyOnScreen = function (elem) {
    let rect = elem.getBoundingClientRect();
    let windowHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
    let windowWidth = Math.max(window.innerWidth, document.documentElement.clientWidth);
    let sideMenuWidth = SideMenu.getWidth();
    return (
        rect.top >= 0 &&
        rect.left - sideMenuWidth >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right + IS_ON_SCREEN_RIGHT_THRESHOLD <= windowWidth
    );
};
export default Scroll;
