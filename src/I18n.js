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
                        confirm: "Confirm"
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
                        confirm: "Confirmer"
                    }
                }
            }
        });
        i18next.addResources("en", "vertex", {
            "default": "write it"
        });
        i18next.addResources("fr", "vertex", {
            "default": "écris le"
        });
        i18next.addResources("en", "edge", {
            "default": "relate"
        });
        i18next.addResources("fr", "edge", {
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

        i18next.addResources("en", "button", {
            "select": "Hand selector",
            "group": "Merge bubbles into one",
            "addChild": "Add a child (tab)",
            "identify": "Tags",
            "identifyWhenMany": "Tags",
            "compare": "Compare with another user",
            "reverseToRight": "Invert relation",
            "reverseToLeft": "Invert relation",
            "suggestions": "Suggestions",
            "subElements": "Made of graph elements",
            "center": "Center bubble",
            "note": "Description",
            "images": "Add images",
            "cut": "Cut",
            "paste": "Paste",
            "selectTree": "Select tree",
            "makePrivate": "Make private",
            "makePublic": "Make public",
            "remove": "Delete (del)",
            "accept": "Accept",
            "addSibling": "Add sibling (enter)",
            "zoomIn": "Zoom in",
            "zoomOut": "Zoom out",
            "expandAll": "Expand all",
            "selectAllBubbles": "Select all bubbles",
            "visitOtherInstances": "See where this bubble is also found on this map",
            "collapse": "Hide tree",
            "expand": "Expand",
            "wikidataOn": "Activate autocompletion from Wikidata",
            "wikidataOff": "Deactivate autocompletion from Wikidata",
            "copy": "Copy",
            "undo": "Undo",
            "redo": "Redo",
            "changeBackgroundColor": "Change background color for this map",
            "convertToRelation": "Convert to relation",
            "convertToGroupRelation": "Convert to group relation",
            "wikipediaLinks": "Learn more on Wikipedia",
            "merge": "Merge",
            "list": "See the selection as a list",
            "fontPicker": "Font picker",
            "share": "Share"
        });
        i18next.addResources("fr", "button", {
            "select": "Sélection à la main",
            "group": "Créer une bulle à partir de celles sélectionnés",
            "addChild": "Ajouter un enfant (tab)",
            "identify": "Étiquettes",
            "identifyWhenMany": "Étiquettes",
            "compare": "Comparer avec un autre usager",
            "reverseToRight": "Inverser la relation",
            "reverseToLeft": "Inverser la relation",
            "suggestions": "Suggestions",
            "subElements": "De quoi est composé la bulle",
            "center": "Centrer la bulle",
            "note": "Description",
            "images": "Ajouter des images",
            "cut": "Couper",
            "paste": "Coller",
            "selectTree": "Sélectionner l'arbre",
            "makePrivate": "Rendre privé",
            "makePublic": "Rendre public",
            "remove": "Effacer (suppr)",
            "accept": "Accepter",
            "addSibling": "Ajouter une bulle soeur (enter)",
            "zoomIn": "Zoom intérieur",
            "zoomOut": "Zoom extérieur",
            "expandAll": "Expandre tout",
            "selectAllBubbles": "Sélectionner toutes les bulles",
            "visitOtherInstances": "Voir où cette bulle se trouve également sur cette carte",
            "collapse": "Cacher l'arbre",
            "expand": "Expandre",
            "wikidataOn": "Activer l'autocompletion de Wikidata",
            "wikidataOff": "Désactiver l'autocompletion de Wikidata",
            "copy": "Copier",
            "undo": "Annuller",
            "redo": "Refaire",
            "changeBackgroundColor": "Modifier la couleur de fond pour cette carte",
            "convertToRelation": "Convertir en relation",
            "convertToGroupRelation": "Convertir en relation groupée",
            "wikipediaLinks": "En savoir plus sur Wikipédia",
            "merge": "Fusionner",
            "list": "Voir la sélection sous forme de liste",
            "fontPicker": "Sélecteur de polices",
            "share": "Partager"
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
