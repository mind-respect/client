/**
 * Copyright Vincent Blouin GNU General Public License v3.0
 */
import VueScrollTo from 'vue-scrollto'
import router from '@/router'
import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
Vue.use(VueDragscroll)
Vue.use(VueScrollTo);

export default {
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
    goToGraphElement: function(element){
        var options = {
            container: 'body',
            easing: 'ease-in',
            offset: -200,
            force: true,
            cancelable: true,
            onStart: function(element) {
                // scrolling started
            },
            onDone: function(element) {
                // scrolling is done
            },
            onCancel: function() {
                // scrolling has been interrupted
            },
            x: true,
            y: true
        }

        var cancelScroll = VueScrollTo.scrollTo(
            element,
            300,
            options
        )

// or alternatively inside your components you can use
//         cancelScroll = Vue.$scrollTo(element, duration, options);
    }
}
