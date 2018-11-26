import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);

const Store = new Vuex.Store({
    strict: true,
    plugins: [
        createPersistedState({
            paths: [
                "token",
                "user",
                "locale"
            ]
        })
    ],
    state: {
        token: null,
        user: null
    },
    mutations: {
        setToken: function (state, token) {
            state.token = token;
            if (token) {
                state.isUserLoggedIn = true;
            } else {
                state.isUserLoggedIn = false;
                state.user = null;
            }
        },
        setUser: function (state, user) {
            if (user) {
                state.user = {
                    id: user.id,
                    email: user.email,
                    status: user.status,
                    locale: user.locale
                };
            } else {
                state.user = null;
                state.token = null;
            }
        },
        setLocale: function (state, locale) {
            if (state.locale === locale) {
                return;
            }
            state.locale = locale;
            location.reload();
        }
    },
    actions: {
        setToken: function (action, token) {
            action.commit('setToken', token);
        },
        setUser: function (action, user) {
            action.commit('setUser', user);
        },
        setLocale: function (action, locale) {
            action.commit('setLocale', locale);
        }
    }
});

export default Store;

