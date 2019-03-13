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
    goToGraphElement: function (element) {
        var options = {
            container: 'body',
            easing: 'ease',
            offset: -550,
            force: true,
            cancelable: true,
            onStart: function (element) {
                // scrolling started
            },
            onDone: function (element) {
                options.x = false;
                options.y = true;
                options.offset = -200;
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
    centerBubbleIfApplicable: function (bubble) {
        let html = bubble.getHtml();
        if (!UiUtils.isElementFullyOnScreen(html)) {
            Vue.nextTick(function () {
                Scroll.goToGraphElement(html)
            })
        }
    }
};
export default Scroll;
