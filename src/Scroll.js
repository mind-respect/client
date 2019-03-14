/**
 * Copyright Vincent Blouin GNU General Public License v3.0
 */
import VueScrollTo from 'vue-scrollto'
import router from '@/router'
import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import UiUtils from '@/UiUtils'

Vue.use(VueDragscroll)
Vue.use(VueScrollTo);

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
        let element = bubble.getHtml();
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
                    offset = 1200 - element.offsetWidth;
                } else {
                    offset = 200;
                }
                let position = Math.abs(offset * screen.width / 1366);
                return position * -1;
            },
            force: true,
            cancelable: true,
            onStart: function (element) {
                // scrolling started
            },
            onDone: function (element) {
                options.x = false;
                options.y = true;
                options.offset = function () {
                    let position = Math.abs(200 * screen.height / 768);
                    return position * -1;
                };
                VueScrollTo.scrollTo(
                    element,
                    250,
                    options
                )
            },
            onCancel: function () {
                // scrolling has been interrupted
            },
            x: true,
            y: false
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
        Vue.nextTick(function () {
            setTimeout(function () {
                let element = bubble.getHtml();
                if (isForTree && !bubble.isCenter && bubble.getNumberOfChild() > 0) {
                    element = element.parentElement;
                }
                if (!UiUtils.isElementFullyOnScreen(element)) {
                    Scroll.goToGraphElement(bubble)
                }
            }, 100)
        });
    }
};
export default Scroll;
