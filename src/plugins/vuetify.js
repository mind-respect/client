import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify)

// '067f88'
export default new Vuetify({
    icons: {
        iconfont: 'md',
    },
    theme: {
        dark: false,
        themes: {
            light: {
                primary: '#000000',
                secondary: colors.indigo.darken4,
                secondaryLight: colors.indigo.lighten2,
                third: colors.blueGrey.darken2,
                thirdLight: '#27cec0',
                grey: colors.grey.darken1,
                red: colors.red.lighten2,
                accent: '#82B1FF',
                error: '#ff4444',
                info: '#33b5e5',
                success: '#00C851',
                warning: '#ffbb33',
                edgeColor: '#3A87AD'
            },
            dark: {
                primary: '#FFFFFF',
                secondary: colors.indigo.darken4,
                secondaryLight: colors.indigo.lighten2,
                third: colors.teal.darken1,
                thirdLight: colors.teal.lighten1,
                grey: colors.grey.darken1,
                red: colors.red.lighten2,
                accent: '#82B1FF',
                error: '#ff4444',
                info: '#33b5e5',
                success: '#00C851',
                warning: '#ffbb33',
                edgeColor: '#3A87AD'
            }
        }
    }
})