/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import UserService from '@/service/UserService'

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
        user: null,
        dragged: null,
        isRemoveFlow: false,
        redraws: Math.random()
    },
    mutations: {
        setUser: function (state, user) {
            if (user) {
                state.user = {
                    id: user.id,
                    email: user.email,
                    status: user.status,
                    user_name: user.user_name,
                    username: user.user_name,
                    locale: user.locale
                };
            } else {
                state.user = undefined;
            }
            UserService.setAuthenticatedUserInCache(state.user);
        },
        setLocale: function (state, locale) {
            if (state.locale === locale) {
                return;
            }
            state.locale = locale;
            location.reload();
        },
        setDragged: function (state, dragged) {
            state.dragged = dragged;
        },
        setIsRemoveFlow: function (state, isRemoveFlow) {
            state.isRemoveFlow = isRemoveFlow;
        },
        redraw: function (state, spec) {
            state.redraws = {
                refresh: Math.random(),
                spec: spec
            };
        }
    },
    actions: {
        setUser: function (action, user) {
            action.commit('setUser', user);
        },
        setLocale: function (action, locale) {
            action.commit('setLocale', locale);
        },
        setDragged: function (action, dragged) {
            action.commit('setDragged', dragged);
        },
        setIsRemoveFlow: function (action, isRemoveFlow) {
            action.commit('setIsRemoveFlow', isRemoveFlow);
        },
        redraw: function (action, spec) {
            action.commit('redraw', spec);
        }
    }
});

export default Store;

