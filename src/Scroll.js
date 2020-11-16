/**
 * Copyright Vincent Blouin GNU General Public License v3.0
 */
import VueScrollTo from 'vue-scrollto'
import router from '@/router'
import Vue from 'vue'
import SideMenu from '@/SideMenu'
import Breakpoint from '@/Breakpoint'
import Store from '@/store'

Vue.use(VueScrollTo);

const IS_ON_SCREEN_RIGHT_THRESHOLD = 100;
const IS_ON_SCREEN_RIGHT_THRESHOLD_MOBILE = 0;

let cancelGraphElementScroll;

const Scroll = {
    goToGraphElement: function (bubble, noAnimation) {
        return new Promise(async (resolve) => {
            if (cancelGraphElementScroll) {
                await cancelGraphElementScroll();
            }
            let onlyScrollLeft = false;
            let element = bubble.getLabelHtml();
            if (!element) {
                resolve();
                return;
            }
            let offset = Scroll._getBubbleCenterOffset(
                bubble,
                element
            );
            if (noAnimation) {
                Scroll.centerElement(
                    element,
                    offset
                );
                resolve();
                return;
            }
            let options = {
                container: document.scrollingElement,
                easing: 'ease',
                offset: function () {
                    return offset.x;
                },
                force: true,
                cancelable: true,
                onStart: function () {
                    // scrolling started
                },
                onCancel: function () {
                    /*
                    scrolling because sometimes it would juste not scroll at all
                    if remove test thouroughly
                    * */
                    Scroll.centerElement(
                        element,
                        offset
                    );
                    resolve();
                },
                x: true,
                y: false
            };
            if (onlyScrollLeft) {
                resolve()
            } else {
                options.onDone = function (element) {
                    options.onDone = function () {
                        cancelGraphElementScroll = undefined;
                        resolve();
                    };
                    options.x = false;
                    options.y = true;
                    options.offset = function () {
                        return offset.y;
                    };
                    cancelGraphElementScroll = VueScrollTo.scrollTo(
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
    _getBubbleCenterOffset: function (bubble, element) {
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
        let xOffset = sideMenuOffset + offset;
        return {
            x: xOffset * -1,
            y: Math.abs(300 * screen.height / 768) * -1
        }

    },
    centerBubbleForTreeIfApplicable: function (bubble) {
        return Scroll.centerBubbleForTreeOrNotIfApplicable(
            bubble,
            !Breakpoint.isMobile()
        );
    },
    centerBubbleIfApplicable: function (bubble) {
        return Scroll.centerBubbleForTreeOrNotIfApplicable(
            bubble,
            false
        );
    },
    centerBubbleForTreeOrNotIfApplicable: async function (bubble, isForTree) {
        await Vue.nextTick();
        if (bubble.isEditFlow) {
            return Promise.resolve();
        }
        let labelHtml = bubble.getLabelHtml();
        if ((isForTree && !Scroll.isBubbleTreeFullyOnScreen(bubble)) || (labelHtml && labelHtml.style.display !== "none" && !Scroll.isElementFullyOnScreen(labelHtml))) {
            return Scroll.goToGraphElement(bubble)
        } else {
            return Promise.resolve();
        }
    }

};

Scroll.isBubbleTreeFullyOnScreen = function (bubble) {
    let html = bubble.getHtml();
    if (!html) {
        return true;
    }
    return (
        !bubble.isExpanded || Scroll.isElementFullyOnScreen(
            html.closest('.vertex-tree-container')
        )
    ) && Scroll.isElementFullyOnScreen(
        bubble.getLabelHtml()
    );
};

Scroll.isElementFullyOnScreen = function (elem) {
    if (!elem) {
        return true;
    }
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

Scroll.centerElement = function (element, offset) {
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middleY = absoluteElementTop;
    const middleX = elementRect.left + window.pageXOffset;
    offset = offset || {
        x: (window.innerWidth / 2) * -1 + (Store.state.sideMenuFlow === false ? 50 : -150),
        y: (window.innerHeight / 2) * -1
    };
    window.scrollTo(middleX + offset.x, middleY + offset.y);
};

export default Scroll;
