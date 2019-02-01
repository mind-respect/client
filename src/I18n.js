/**
 * Copyright Vincent Blouin GNU General Public License v3.0
 */
import Vue from 'vue'
import Store from '@/store'
import i18next from 'i18next'
import VueI18Next from '@panter/vue-i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

export default {
    setup: function () {
        Vue.use(VueI18Next);
        let savedLocale = Store.state.locale;
        if (!savedLocale) {
            let localesArray = new I18nextBrowserLanguageDetector().detectors.navigator.lookup();
            let frIndex = localesArray.indexOf("fr");
            let enIndex = localesArray.indexOf("en");
            let isFrenchPreferredOverEnglish = frIndex !== -1 && frIndex < enIndex;
            savedLocale = Store.state.locale = isFrenchPreferredOverEnglish ? "fr" : "en";
        }
        Store.dispatch('setLocale', savedLocale);
        i18next.init({
            lng: savedLocale,
            resources: {
                en: {
                    translation: {
                        login: 'Login',
                        register: 'Register',
                        search: 'Search'
                    }
                },
                fr: {
                    translation: {
                        login: 'Connexion',
                        register: "S'inscrire",
                        search: 'Chercher'
                    }
                }
            }
        });
        return new VueI18Next(i18next);
    },
    i18next: i18next,
    getLocale: function () {
        return Store.state.locale;
    }
};
