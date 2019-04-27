<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
        <v-layout row>
            <v-flex grow>
                <v-toolbar fixed flat color="transparent" class="top-toolbar pl-1" height="36" dense>
                    <v-toolbar-items class="pa-0 mt-3">
                        <BubbleButtons :key="refreshKey" :isInTopMenu="true"></BubbleButtons>
                    </v-toolbar-items>
                </v-toolbar>
            </v-flex>
        </v-layout>
        <v-navigation-drawer
                v-model="sideNavigation"
                :mini-variant.sync="mini"
                class="elevation-0 pt-0 side-navigation-drawer ml-0"
                fixed
                width="50"
                mini-variant-width="50"
                color="transparent"
                flat
                floating
        >
            <div v-for="(button, i) in graphButtons">
                <Button :button="button" :isInSideMenu="true" :buttonIndex="i"></Button>
            </div>
        </v-navigation-drawer>
        <input
                id="background-color-picker"
                v-show="false"
                type="color"
                v-model="backgroundColor"
                @change="changeBackgroundColor"
        >
    </div>
</template>

<script>
    import BubbleButtons from '@/components/graph/BubbleButtons'
    import SelectionHandler from '@/SelectionHandler'
    import AppController from '@/AppController'
    import GraphController from '@/graph/GraphController'
    import Button from '@/components/graph/Button'
    import I18n from '@/I18n'
    import SubGraph from '@/graph/SubGraph'
    import VertexService from '@/vertex/VertexService'

    export default {
        name: "MainMenus",
        components: {
            BubbleButtons: BubbleButtons,
            Button: Button
        },
        mounted: function () {
            this.backgroundColor = SubGraph.graph.center.getBackgroundColor();
            setTimeout(function () {
                this.loaded = true;
            }.bind(this), 1000)
        },
        methods: {
            changeBackgroundColor: function () {
                SubGraph.graph.center.setBackgroundColor(this.backgroundColor);
                VertexService.saveColors({
                    background: this.backgroundColor
                });
            }
        },
        data: function () {
            I18n.i18next.addResources("en", "button", {
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
                "share": "Share",
                "createVertex": "Create a new bubble"
            });
            I18n.i18next.addResources("fr", "button", {
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
                "share": "Partager",
                "createVertex": "Créer une nouvelle bulle"
            });
            return {
                sideNavigation: true,
                mini: true,
                refreshKey: Math.random(),
                loaded: false,
                backgroundColor: null,
                graphButtons: [{
                    action: "createVertex",
                    icon: "add",
                    controller: AppController
                }, {
                    action: "zoomIn",
                    icon: "zoom_in",
                    ctrlShortcut: "&plus;",
                    controller: AppController
                }, {
                    action: "zoomOut",
                    icon: "zoom_out",
                    ctrlShortcut: "&minus;",
                    controller: AppController
                }, {
                    action: "expandAll",
                    icon: "unfold_more",
                    controller: GraphController
                }, {
                    action: "selectAllBubbles",
                    icon: "select_all",
                    controller: GraphController
                }, {
                    action: "undo",
                    icon: "undo",
                    ctrlShortcut: "Z",
                    controller: AppController
                }, {
                    action: "redo",
                    icon: "redo",
                    ctrlShortcut: "Y",
                    controller: AppController
                }, {
                    action: "fontPicker",
                    icon: "font_download",
                    controller: AppController
                }, {
                    action: "changeBackgroundColor",
                    icon: "format_paint",
                    controller: AppController,
                    isCustom: true
                }, {
                    action: "list",
                    icon: "list",
                    controller: AppController
                }]
            }
        },
        computed: {
            selection: function () {
                return SelectionHandler.selected;
            }
        },
        watch: {
            selection: function () {
                this.refreshKey = Math.random();
            }
        }
    }
</script>
<style>
    .top-toolbar {
        margin-top: 33px !important;
        height: 43px;
    }

    .top-toolbar .v-toolbar__content {
        margin-top: 0;
        display: inline-block;
    }

    .top-toolbar .v-toolbar__content, .side-toolbar .v-toolbar__content {
        padding: 0;
    }

    .side-navigation-drawer {
        margin-left: 8px;
        padding-left: 4px;
        margin-top: 86px !important;
        background-color: transparent !important;
        border: none !important;
        overflow: hidden;
    }
</style>
