import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import colors from 'vuetify/es5/util/colors'

// '067f88'
Vue.use(Vuetify, {
    iconfont: 'md',
    theme: {
        primary: '#000000',
        secondary: colors.indigo.darken4,
        third: colors.teal.darken1,
        accent: '#82B1FF',
        error: '#ff4444',
        info: '#33b5e5',
        success: '#00C851',
        warning: '#ffbb33',
        edgeColor: '#3A87AD'
    }
})
