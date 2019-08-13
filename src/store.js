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
                "sideMenuFlow",
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
        isRemoveTagFlow: false,
        isDescriptionFlow: false,
        isListViewFlow: false,
        isFontFlow: false,
        isEditFlow: false,
        redraws: Math.random(),
        sideMenuFlow: false,
        isViewOnly: null,
        selected: []
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
        setIsRemoveTagFlow: function (state, isRemoveTagFlow) {
            state.isRemoveTagFlow = isRemoveTagFlow;
        },
        setIsDescriptionFlow: function (state, isDescriptionFlow) {
            state.isDescriptionFlow = isDescriptionFlow;
        },
        setIsFontFlow: function (state, isFontFlow) {
            state.isFontFlow = isFontFlow;
        },
        setIsEditFlow: function (state, isEditFlow) {
            state.isEditFlow = isEditFlow;
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
        setSideMenuFlow: function (state, sideMenuFlow) {
            state.sideMenuFlow = sideMenuFlow;
        },
        setIsListViewFlow: function (state, isListViewFlow) {
            state.isListViewFlow = isListViewFlow;
        },
        setIsViewOnly: function (state, isViewOnly) {
            state.isViewOnly = isViewOnly;
        },
        setSelected: function (state, selected) {
            state.selected = selected;
        },
        addSelected: function (state, selected) {
            state.selected.push(selected);
        },
        removeSelected: function (state, toRemove) {
            let l = state.selected.length;
            while (l--) {
                let selected = state.selected[l];
                if (selected.id === toRemove.id) {
                    state.selected.splice(l, 1)
                }
            }
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
        setIsRemoveTagFlow: function (action, isRemoveTagFlow) {
            action.commit('setIsRemoveTagFlow', isRemoveTagFlow);
        },
        setIsDescriptionFlow: function (action, isDescriptionFlow) {
            action.commit('setIsDescriptionFlow', isDescriptionFlow);
        },
        setIsFontFlow: function (action, isFontFlow) {
            action.commit('setIsFontFlow', isFontFlow);
        },
        setIsEditFlow: function (action, setIsEditFlow) {
            action.commit('setIsEditFlow', setIsEditFlow);
        },
        redraw: function (action, spec) {
            action.commit('redraw', spec);
        },
        zoom: function (action, zoom) {
            action.commit('zoom', zoom);
        },
        setSideMenuFlow: function (action, sideMenuFlow) {
            action.commit('setSideMenuFlow', sideMenuFlow);
        },
        setIsListViewFlow: function (action, isListViewFlow) {
            action.commit('setIsListViewFlow', isListViewFlow);
        },
        setIsViewOnly: function (action, isViewOnly) {
            action.commit('setIsViewOnly', isViewOnly);
        },
        setSelected: function (action, selected) {
            action.commit('setSelected', selected);
        },
        addSelected: function (action, selected) {
            action.commit('addSelected', selected);
        },
        removeSelected: function (action, selected) {
            action.commit('removeSelected', selected);
        }
    }
});

export default Store;

