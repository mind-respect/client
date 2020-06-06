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
                        search: 'Search',
                        logout: "Logout",
                        add: "Add",
                        create: "Create",
                        noSearchResults: "No search results",
                        'required': "Required",
                        invalidEmail: 'invalid email',
                        min8Char: "Minimum of 8 characters",
                        send: "Send",
                        change: "Change",
                        centers: "Centers",
                        confirm: "Confirm",
                        save: "Save",
                        cancel: "Cancel",
                        copy: "copy",
                        copied: "copied",
                        close: "Close",
                        areYouSure: "Are you sure ?",
                        use: "Use",
                        bubble: "Bubble",
                        bubbles: "Bubbles",
                        moreResults: "More results",
                        selectAll: "Add all",
                        deselectAll: "Remove all",
                        robotDoubt: "There is a doubt that you are a robot. If you are human, Im sorry and contact me at vincent.blouin@gmail.com",
                        and: "and",
                        to: "to",
                        toTheBubble: "to the bubble"
                    }
                },
                fr: {
                    translation: {
                        login: 'Connexion',
                        register: "S'inscrire",
                        search: 'Chercher',
                        logout: "Déconnexion",
                        add: "Ajouter",
                        create: "Créer",
                        noSearchResults: "Pas de résultats de recherche",
                        'required': "Requis",
                        invalidEmail: 'courriel invalide',
                        min8Char: "Minimum de 8 charactères",
                        send: "Envoyer",
                        change: "Modifier",
                        centers: "Centres",
                        confirm: "Confirmer",
                        save: "Sauvegarder",
                        cancel: "Annuler",
                        copy: "copier",
                        copied: "copié",
                        close: "Fermer",
                        areYouSure: "Êtes-vous certain?",
                        use: "Utiliser",
                        bubble: "Bulle",
                        bubbles: "Bulles",
                        moreResults: "Plus de résultats",
                        selectAll: "Ajouter tout",
                        deselectAll: "Enlever tout",
                        robotDoubt: "Il y a un doute que vous soyez un robot. Si vous êtes humain, je suis désolé et contactez moi à vincent.blouin@gmail.com",
                        and: "et",
                        to: "à",
                        toTheBubble: "à la bulle"
                    }
                }
            }
        });
        i18next.addResources("en", "vertex", {
            "default": "write it",
            "openLink": "Open link"
        });
        i18next.addResources("fr", "vertex", {
            "default": "écris le",
            "openLink": "Ouvrir le lien"
        });
        i18next.addResources("en", "edge", {
            "default": "write"
        });
        i18next.addResources("fr", "edge", {
            "default": "écris"
        });
        i18next.addResources("en", "tag", {
            "default": "Tag"
        });
        i18next.addResources("fr", "tag", {
            "default": "Étiquette"
        });
        i18next.addResources("en", "groupRelation", {
            "default": "relate"
        });
        i18next.addResources("fr", "groupRelation", {
            "default": "relie"
        });
        i18next.addResources("en", "childNotice", {
            "tooltip": "Expand (ctrl+E)",
            "tooltipForMac": "Expand (⌘+E)"
        });
        i18next.addResources("fr", "childNotice", {
            "tooltip": "Expandre (ctrl+E)",
            "tooltipForMac": "Expandre (⌘+E)"
        });

        i18next.addResources("en", "childNotice", {
            "tooltip": "Expand (ctrl+E)",
            "tooltipForMac": "Expand (⌘+E)"
        });

        i18next.addResources("fr", "childNotice", {
            "tooltip": "Expandre (ctrl+E)",
            "tooltipForMac": "Expandre (⌘+E)"
        });

        return new VueI18Next(i18next);
    },
    i18next: i18next,
    getLocale: function () {
        return Store.state.locale;
    }
};
