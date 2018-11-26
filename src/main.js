import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import I18n from '@/i18n'

Vue.config.productionTip = false

const vueI18nExt = I18n.setup()

new Vue({
    i18n: vueI18nExt,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
