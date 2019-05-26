import Vue from 'vue'
import Vuetify, { VLayout } from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import colors from 'vuetify/es5/util/colors'

// '067f88'
Vue.use(Vuetify, {
    iconfont: 'md',
    theme: {
        primary: '#000000',
        secondary: colors.indigo.darken4,
        secondaryLight: colors.indigo.lighten2,
        third: colors.teal.darken1,
        thirdLight: colors.teal.lighten1,
        gray: colors.blueGrey.lighten1,
        red: colors.red.lighten2,
        accent: '#82B1FF',
        error: '#ff4444',
        info: '#33b5e5',
        success: '#00C851',
        warning: '#ffbb33',
        edgeColor: '#3A87AD'
    },
    components: {
        VLayout
    }
})
