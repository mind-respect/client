import Vue from 'vue'
import I18n from '@/I18n'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import DateUtil from '@/DateUtil'
import linkify from 'vue-linkify'

Vue.directive('linkified', linkify)

Vue.config.productionTip = false

const vueI18nExt = I18n.setup()

new Vue({
    i18n: vueI18nExt,
    router,
    store,
    render: h => h(App)
}).$mount('#app')

DateUtil.setup();