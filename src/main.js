import Vue from 'vue'
import I18n from '@/I18n'
import vuetify from '@/plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
Vue.config.productionTip = false

const vueI18nExt = I18n.setup();

new Vue({
    i18n: vueI18nExt,
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')