/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import UserService from '@/service/UserService'
import IdUri from '@/IdUri'

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
                "areCentersInGridView",
                "xsrfToken",
                "addRelationIncludeAllPatterns",
                "isShowTags",
                "isShowRelations",
                "isFirstTime",
                "cache"
            ]
        })
    ],
    state: {
        user: null,
        zoom: 1,
        isLoading: false,
        areCentersInGridView: true,
        isRemoveFlow: false,
        isRemoveTagFlow: false,
        isDescriptionFlow: false,
        isListViewFlow: false,
        isFontFlow: false,
        isPatternFlow: false,
        redraws: Math.random(),
        sideMenuFlow: false,
        isViewOnly: null,
        selected: [],
        centerRefresh: Math.random(),
        labelRefresh: Math.random(),
        noteRefresh: Math.random(),
        tagRefresh: Math.random(),
        shareRefresh: Math.random(),
        similarBubblesRefresh: Math.random(),
        failedToEdit: Math.random(),
        userHomeSelectedCenter: null,
        isNewContextFlow: false,
        isCopyTreeFlow: false,
        isAddTagFlow: false,
        isMergeFlow: false,
        isColorFlow: false,
        backgroundColor: "",
        xsrfToken: undefined,
        addRelationIncludeAllPatterns: true,
        isFirstTime: false,
        isServerNotResponding: false,
        isDuplicateFlow: false,
        isShowTags: false,
        isShowRelations: false,
        addExistingToParent: false,
        infoMessage: null,
        editMode: false,
        cache: {}
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
                    locale: user.locale,
                    consultNotificationsDate: user.consultNotificationsDate
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
        setIsPatternFlow: function (state, isPatternFlow) {
            state.isPatternFlow = isPatternFlow;
        },
        redraw: function (state, options) {
            state.redraws = options || {};
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
        },
        centerRefresh: function (state, key) {
            state.centerRefresh = key;
        },
        labelRefresh: function (state, key) {
            state.labelRefresh = key;
        },
        noteRefresh: function (state, key) {
            state.noteRefresh = key;
        },
        tagRefresh: function (state, key) {
            state.tagRefresh = key;
        },
        shareRefresh: function (state, key) {
            state.shareRefresh = key;
        },
        similarBubblesRefresh: function (state, key) {
            state.similarBubblesRefresh = key;
        },
        failedToEdit: function (state, key) {
            state.failedToEdit = key;
        },
        userHomeSelectedCenter: function (state, center) {
            state.userHomeSelectedCenter = center;
        },
        isNewContextFlow: function (state, isNewContextFlow) {
            state.isNewContextFlow = isNewContextFlow;
        },
        isCopyTreeFlow: function (state, isCopyTreeFlow) {
            state.isCopyTreeFlow = isCopyTreeFlow;
        },
        setIsAddTagFlow: function (state, isAddTagFlow) {
            state.isAddTagFlow = isAddTagFlow;
        },
        setIsMergeFlow: function (state, isMergeFlow) {
            state.isMergeFlow = isMergeFlow;
        },
        setIsColorFlow: function (state, isColorFlow) {
            state.isColorFlow = isColorFlow;
        },
        setBackgroundColor: function (state, backgroundColor) {
            state.backgroundColor = backgroundColor;
        },
        setIsDuplicateFlow: function (state, isDuplicateFlow) {
            state.isDuplicateFlow = isDuplicateFlow;
        },
        setXsrfToken: function (state, xsrfToken) {
            state.xsrfToken = xsrfToken;
        },
        setAddRelationIncludeAllPatterns: function (state, addRelationIncludeAllPatterns) {
            state.addRelationIncludeAllPatterns = addRelationIncludeAllPatterns;
        },
        setIsFirstTime: function (state, isFirstTime) {
            state.isFirstTime = isFirstTime;
        },
        setIsServerNotResponding: function (state, isServerNotResponding) {
            state.isServerNotResponding = isServerNotResponding;
        },
        setIsShowTags: function (state, isShowTags) {
            state.isShowTags = isShowTags;
        },
        setIsShowRelations: function (state, isShowRelations) {
            state.isShowRelations = isShowRelations;
        },
        setAddExistingToParent: function (state, parentId) {
            state.addExistingToParent = parentId;
        },
        setInfoMessage: function (state, infoMessage) {
            state.infoMessage = infoMessage;
        },
        setEditMode: function (state, editMode) {
            state.editMode = editMode;
        },
        saveGraph: function (state, graph) {
            state.cache[graph.centerUri] = graph;
        },
        invalidateGraphCache: function (state, graph) {
            state.cache[graph.centerUri] = false;
        },
        emptyAllCache: function (state) {
            state.cache = {};
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
        setIsPatternFlow: function (action, setIsPatternFlow) {
            action.commit('setIsPatternFlow', setIsPatternFlow);
        },
        redraw: function (action, options) {
            action.commit('redraw', options);
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
        },
        centerRefresh: function (action) {
            action.commit('centerRefresh', IdUri.uuid());
        },
        labelRefresh: function (action) {
            action.commit('labelRefresh', IdUri.uuid());
        },
        noteRefresh: function (action) {
            action.commit('noteRefresh', IdUri.uuid());
        },
        tagRefresh: function (action) {
            action.commit('tagRefresh', IdUri.uuid());
        },
        shareRefresh: function (action) {
            action.commit('shareRefresh', IdUri.uuid());
        },
        similarBubblesRefresh: function (action) {
            action.commit('similarBubblesRefresh', IdUri.uuid());
        },
        failedToEdit: function (action) {
            action.commit('failedToEdit', IdUri.uuid());
        },
        userHomeSelectedCenter: function (action, center) {
            action.commit('userHomeSelectedCenter', center);
        },
        isNewContextFlow: function (action, isNewContextFlow) {
            action.commit('isNewContextFlow', isNewContextFlow);
        },
        isCopyTreeFlow: function (action, isCopyTreeFlow) {
            action.commit('isCopyTreeFlow', isCopyTreeFlow);
        },
        setIsAddTagFlow: function (action, isAddTagFlow) {
            action.commit('setIsAddTagFlow', isAddTagFlow);
        },
        setIsMergeFlow: function (action, isMergeFlow) {
            action.commit('setIsMergeFlow', isMergeFlow);
        },
        setIsColorFlow: function (action, isColorFlow) {
            action.commit('setIsColorFlow', isColorFlow);
        },
        setBackgroundColor: function (action, backgroundColor) {
            action.commit('setBackgroundColor', backgroundColor);
        },
        setIsDuplicateFlow: function (action, isDuplicateFlow) {
            action.commit('setIsDuplicateFlow', isDuplicateFlow);
        },
        setXsrfToken: function (action, xsrfToken) {
            action.commit('setXsrfToken', xsrfToken);
        },
        setAddRelationIncludeAllPatterns: function (action, addRelationIncludeAllPatterns) {
            action.commit('setAddRelationIncludeAllPatterns', addRelationIncludeAllPatterns);
        },
        setIsFirstTime: function (action, isFirstTime) {
            action.commit('setIsFirstTime', isFirstTime);
        },
        setIsServerNotResponding: function (action, isServerNotResponding) {
            action.commit('setIsServerNotResponding', isServerNotResponding);
        },
        setIsShowTags: function (action, setIsShowTags) {
            action.commit('setIsShowTags', setIsShowTags);
        },
        setIsShowRelations: function (action, setIsShowRelations) {
            action.commit('setIsShowRelations', setIsShowRelations);
        },
        setAddExistingToParent: function (action, parentId) {
            action.commit('setAddExistingToParent', parentId);
        },
        setInfoMessage: function (action, infoMessage) {
            action.commit('setInfoMessage', infoMessage);
        },
        setEditMode: function (action, editMode) {
            action.commit('setEditMode', editMode);
        },
        saveGraph: function (action, graph) {
            action.commit('saveGraph', graph);
        },
        invalidateGraphCache: function (action, graph) {
            action.commit('invalidateGraphCache', graph);
        },
        emptyAllCache: function (action) {
            action.commit('emptyAllCache');
        },
    }
});

export default Store;

