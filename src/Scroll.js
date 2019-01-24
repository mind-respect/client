/**
 * Copyright Vincent Blouin GNU General Public License v3.0
 */
import VueScrollTo from 'vue-scrollto'
import router from '@/router'

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
    }
}
