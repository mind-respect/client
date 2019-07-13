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
                "locale",
                "zoom",
                "isSideMenuCollapsed",
                "areCentersInGridView"
            ]
        })
    ],
    state: {
        user: null,
        zoom: 1,
        isLoading: false,
        areCentersInGridView: true,
        dragged: null,
        isRemoveFlow: false,
        isDescriptionFlow: false,
        isListViewFlow: false,
        isFontFlow: false,
        isTagFlow: false,
        redraws: Math.random(),
        isSideMenuCollapsed: true,
        isViewOnly: null
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
        setIsLoading: function (state, isLoading) {
            state.isLoading = isLoading;
        },
        setLocale: function (state, locale) {
            if (state.locale === locale) {
                return;
            }
            state.locale = locale;
            location.reload();
        },
        setAreCentersInGridView: (state, areCentersInGridView) => {
            state.areCentersInGridView = areCentersInGridView;
        },
        setDragged: function (state, dragged) {
            state.dragged = dragged;
        },
        setIsRemoveFlow: function (state, isRemoveFlow) {
            state.isRemoveFlow = isRemoveFlow;
        },
        setIsDescriptionFlow: function (state, isDescriptionFlow) {
            state.isDescriptionFlow = isDescriptionFlow;
        },
        setIsFontFlow: function (state, isFontFlow) {
            state.isFontFlow = isFontFlow;
        },
        setIsTagFlow: function (state, isTagFlow) {
            state.isTagFlow = isTagFlow;
        },
        redraw: function (state, spec) {
            state.redraws = {
                refresh: Math.random(),
                spec: spec
            };
        },
        zoom: function (state, zoom) {
            state.zoom = zoom;
        },
        setIsSideMenuCollapsed: function (state, isSideMenuCollapsed) {
            state.isSideMenuCollapsed = isSideMenuCollapsed;
        },
        setIsListViewFlow: function (state, isListViewFlow) {
            state.isListViewFlow = isListViewFlow;
        },
        setIsViewOnly: function (state, isViewOnly) {
            state.isViewOnly = isViewOnly;
        }
    },
    actions: {
        setUser: function (action, user) {
            action.commit('setUser', user);
        },
        setIsLoading: function (action, isLoading) {
            action.commit('setIsLoading', isLoading);
        },
        setLocale: function (action, locale) {
            action.commit('setLocale', locale);
        },
        setAreCentersInGridView: (action, areCentersInGridView) => {
            action.commit('setAreCentersInGridView', areCentersInGridView);
        },
        setDragged: function (action, dragged) {
            action.commit('setDragged', dragged);
        },
        setIsRemoveFlow: function (action, isRemoveFlow) {
            action.commit('setIsRemoveFlow', isRemoveFlow);
        },
        setIsDescriptionFlow: function (action, isDescriptionFlow) {
            action.commit('setIsDescriptionFlow', isDescriptionFlow);
        },
        setIsFontFlow: function (action, isFontFlow) {
            action.commit('setIsFontFlow', isFontFlow);
        },
        setIsTagFlow: function (action, isTagFlow) {
            action.commit('setIsTagFlow', isTagFlow);
        },
        redraw: function (action, spec) {
            action.commit('redraw', spec);
        },
        zoom: function (action, zoom) {
            action.commit('zoom', zoom);
        },
        setIsSideMenuCollapsed: function (action, isSideMenuCollapsed) {
            action.commit('setIsSideMenuCollapsed', isSideMenuCollapsed);
        },
        setIsListViewFlow: function (action, isListViewFlow) {
            action.commit('setIsListViewFlow', isListViewFlow);
        },
        setIsViewOnly: function (action, isViewOnly) {
            action.commit('setIsViewOnly', isViewOnly);
        }
    }
});

export default Store;

