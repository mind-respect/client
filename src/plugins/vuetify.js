import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
    iconfont: 'md',
    theme: {
        primary: '#000000',
        secondary: '#c00000',
        accent: '#82B1FF',
        error: '#ff4444',
        info: '#33b5e5',
        success: '#00C851',
        warning: '#ffbb33'
    }
})
