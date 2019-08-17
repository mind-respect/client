/**
 * Copyright Vincent Blouin GNU General Public License v3.0
 */
import VueScrollTo from 'vue-scrollto'
import router from '@/router'
import Vue from 'vue'
import SideMenu from '@/SideMenu'
import Breakpoint from '@/Breakpoint'

Vue.use(VueScrollTo);

const IS_ON_SCREEN_RIGHT_THRESHOLD = 100;
const IS_ON_SCREEN_RIGHT_THRESHOLD_MOBILE = 0;

let cancelGraphElementScroll;

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
    goToGraphElement: function (bubble, noAnimation) {
        return new Promise((resolve) => {
            let onlyScrollLeft = false;
            // if (bubble.isScrollPositionDefined()) {
            //     onlyScrollLeft = true;
            //     let rect = bubble.getHtml().getBoundingClientRect();
            //     let scrollTop = rect.top - bubble.scrollRect.top;
            //     document.scrollingElement.scrollTop += scrollTop;
            //     bubble.resetScrollPosition();
            // }
            let element = bubble.isCenter ? bubble.getLabelHtml() : bubble.getLabelHtml();
            if (!element) {
                resolve();
                return;
            }
            let sideMenuOffset = SideMenu.getWidth();
            let widthPadding;
            if (bubble.isCenter) {
                widthPadding = 0;
            }
            if (bubble.isToTheLeft()) {
                widthPadding = 25;
            } else {
                widthPadding = -25;
            }
            let elementWidth = element.offsetWidth + widthPadding;
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
                        offset = halfScreen - elementWidth / 2;
                    } else {
                        let deepestBubble = bubble.getDeepestDescendant();
                        if (deepestBubble.isSameBubble(bubble)) {
                            offset = halfScreen - elementWidth / 2;
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
                                offset = Math.min(halfScreen + difference / 2 - elementWidth / 2, screenWidth - elementWidth / 2);
                            } else {
                                offset = Math.max(halfScreen - difference / 2 - elementWidth / 2, 150)
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
            if (onlyScrollLeft) {
                resolve()
            } else {
                options.onDone = function (element) {
                    options.onDone = function () {
                        resolve();
                    };
                    options.x = false;
                    options.y = true;
                    options.offset = function () {
                        let position = Math.abs(300 * screen.height / 768);
                        return position * -1;
                    };
                    VueScrollTo.scrollTo(
                        element,
                        noAnimation ? 1 : 350,
                        options
                    )
                };
            }
            if (noAnimation) {
                options.duration = 1;
                options.easing = "linear"
            }
            cancelGraphElementScroll = VueScrollTo.scrollTo(
                element,
                noAnimation ? 1 : 250,
                options
            );
        });
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
    centerBubbleForTreeOrNotIfApplicable: async function (bubble, isForTree) {
        if (!isForTree && Breakpoint.isMobile()) {
            return;
        }
        await Vue.nextTick();
        let element = isForTree ? bubble.getDeepestDescendant().getLabelHtml() : bubble.getLabelHtml();
        if (!element) {
            return;
        }

        if (!Scroll.isElementFullyOnScreen(element) && !bubble.isEditFlow) {
            Scroll.goToGraphElement(bubble)
        }
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
        rect.right + Scroll.getIsOnScreenRightThreshold() <= windowWidth
    );
};

Scroll.getIsOnScreenRightThreshold = function () {
    return Breakpoint.isMobile() ? IS_ON_SCREEN_RIGHT_THRESHOLD_MOBILE : IS_ON_SCREEN_RIGHT_THRESHOLD;
};

export default Scroll;
