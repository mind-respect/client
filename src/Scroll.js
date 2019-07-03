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
        let element = bubble.isCenter ? bubble.getLabelHtml() : bubble.getLabelHtml();
        let sideMenuOffset = SideMenu.getWidth();
        let options = {
            container: 'body',
            easing: 'ease',
            offset: function () {
                // let elementWidth = element.offsetWidth + (element.offsetWidth / 2)
                // let screenCenter = screen.width / 2;
                let offset;
                let screenWidth = screen.width - sideMenuOffset;
                let halfScreen = screenWidth / 2;
                if (bubble.isCenter) {
                    offset = halfScreen - element.offsetWidth;
                } else {
                    let deepestBubble = bubble.getDeepestDescendant();
                    if (deepestBubble.isSameBubble(bubble)) {
                        offset = halfScreen - element.offsetWidth / 2;
                    } else {
                        let deepestElement = deepestBubble.getLabelHtml();
                        let deepestRect = deepestElement.getBoundingClientRect();
                        let deepestXPosition = bubble.isToTheLeft() ? deepestRect.left : deepestRect.right;
                        deepestXPosition += window.pageXOffset;

                        let elementRect = element.getBoundingClientRect();
                        let elementXPosition = bubble.isToTheLeft() ? elementRect.left : elementRect.right;
                        elementXPosition += window.pageXOffset;

                        let difference = Math.abs(elementXPosition - deepestXPosition);

                        if (bubble.isToTheLeft()) {
                            offset = Math.min(halfScreen + difference / 2 - element.offsetWidth / 2, screenWidth - element.offsetWidth - 50);
                        } else {
                            let elementWidth = element.offsetWidth / 2;
                            offset = Math.max(halfScreen - difference / 2 - elementWidth, 50)
                        }
                    }
                }
                let position = sideMenuOffset + offset;
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
    centerBubbleForTreeOrNotIfApplicable: function (bubble, isForTree) {
        Vue.nextTick(() => {
            setTimeout(() => {
                let element = isForTree ? bubble.getDeepestDescendant().getLabelHtml() : bubble.getLabelHtml();
                if (!element) {
                    return;
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
