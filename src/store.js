/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);

const Store = new Vuex.Store({
    strict: true,
    plugins: [
        createPersistedState({
            paths: [
                "user",
                "locale"
            ]
        })
    ],
    state: {
        user: null
    },
    mutations: {
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
        setUser: function (action, user) {
            action.commit('setUser', user);
        },
        setLocale: function (action, locale) {
            action.commit('setLocale', locale);
        }
    }
});

export default Store;

