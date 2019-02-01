<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded" class="">
        <v-tabs
                style="margin-top:65px;"
                v-model="tabMenu"
                color="cyan"
                dark
                slider-color="yellow"
                grow
        >
            <v-tab ripple>
                <v-icon small class="mr-2">
                    fa-bullseye
                </v-icon>
                Centres
            </v-tab>
            <v-tab>
                <v-icon small class="mr-2">
                    people
                </v-icon>
                Amis
            </v-tab>
            <v-tab-item>
                <v-card>
                    <v-card-title>
                        <v-toolbar-title>Title</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items class="hidden-sm-and-down">
                            <v-tooltip v-if="!isListView">
                                <v-btn flat icon slot="activator" @click="isListView = !isListView">
                                    <v-icon>
                                        view_list
                                    </v-icon>
                                </v-btn>
                                {{$t('userhome:toList')}}
                            </v-tooltip>
                            <v-tooltip v-if="isListView">
                                <v-btn flat icon slot="activator" @click="isListView = !isListView">
                                    <v-icon>
                                        view_module
                                    </v-icon>
                                </v-btn>
                                {{$t('userhome:toGrid')}}
                            </v-tooltip>
                        </v-toolbar-items>
                    </v-card-title>
                    <v-card-text>
                        <v-layout row wrap v-if="!isListView">
                            <v-flex xs12 md4 lg2 v-for="center in centers">
                                <v-hover>
                                    <v-card height="200" class="ma-2" slot-scope="{hover}"
                                            :class="`elevation-${hover ? 12 : 2}`"
                                            :href="center.uri().url()">
                                        <v-card-title class="subheading">
                                            <v-icon>
                                                {{getIcon(center)}}
                                            </v-icon>
                                            <v-spacer></v-spacer>
                                            {{center.getLabel()}}
                                            <v-spacer></v-spacer>
                                        </v-card-title>
                                        <v-card-text class="text-xs-center">
                                            <div v-for="(value, key) in center.getContext()">
                                                {{value}}
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-hover>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap v-if="isListView">
                            <v-flex xs12>
                                <v-data-table
                                        :headers="headers"
                                        :items="centers"
                                        :pagination.sync="pagination"
                                        select-all
                                        item-key="name"
                                        class="elevation-1"
                                >

                                </v-data-table>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab-item>
                <v-card flat>
                    <v-card-text>
                        cholo
                    </v-card-text>
                </v-card>
            </v-tab-item>
        </v-tabs>
    </div>
</template>

<script>
    import CenterGraphElementService from '@/center/CenterGraphElementService'
    import CenterGraphElement from '@/center/CenterGraphElement'
    import IdUri from '@/IdUri'
    import GraphElementType from '@/graph-element/GraphElementType'
    import I18n from '@/I18n'

    export default {
        name: "CentersList",
        data: function () {
            I18n.i18next.addResources("en", "userhome", {
                "center": "Center",
                "context": "Bubbles around",
                "lastVisit": "Visit",
                "nbVisits": "#",
                "createInfo": "Create a new bubble",
                "removeInfo": "Remove from this list (does not remove the bubble)",
                "filter": "Filter",
                "confirmRemove": {
                    "title": "Remove from centers list",
                    "really": "Do you really want to remove that?",
                    "info": "This action does not remove the bubble(s). It will still be accessible throught the main search and by it's relations."
                },
                "reference": "Tag",
                "typeFilter": {
                    "tag": "Tag",
                    "vertex": "Bubble",
                    "relation": "Relation",
                    "bubbleType": "Bubble type",
                    "addAll": "Add All",
                    "removeAll": "Remove All"
                },
                "tabs": {
                    "friends": "FRIENDS"
                },
                "toGrid": "Grid view",
                "toList": "List view"
            });
            I18n.i18next.addResources("fr", "userhome", {
                "center": "Centre",
                "context": "Bulles autour",
                "lastVisit": "Visite",
                "nbVisits": "#",
                "createInfo": "Créer une nouvelle bulle",
                "removeInfo": "Supprimer de cette liste (n'efface pas la bulle)",
                "filter": "Filtrer",
                "confirmRemove": {
                    "title": "Supprimer de la liste des centres",
                    "really": "Voulez-vous vraiment supprimer ça?",
                    "info": "Cette action ne supprime pas la bulle(s). Elle pourra toujours être trouvée par la recherche principale et par ses relations."
                },
                "typeFilter": {
                    "tag": "Étiquette",
                    "vertex": "Bulle",
                    "relation": "Relation",
                    "bubbleType": "Type de bulle",
                    "addAll": "Ajouter tout",
                    "removeAll": "Enlever tout"
                },
                "tabs": {
                    "friends": "AMIS"
                },
                "toGrid": "Vue en grille",
                "toList": "Vue en liste"
            });
            return {
                isListView: false,
                centers: null,
                IdUri: IdUri,
                pagination: {
                    sortBy: 'name'
                },
                headers: [
                    {
                        text: this.$t('userhome:center'),
                        align: 'left',
                        value: 'name'
                    },
                    {text: this.$t('userhome:context'), value: 'calories'},
                    {text: this.$t('userhome:lastVisit'), value: 'fat'}
                ],
                loaded: false,
                tabMenu: null
            }
        },
        methods: {
            getIcon: function (center) {
                let uri = center.getUri();
                let graphElementType = IdUri.getGraphElementTypeFromUri(uri);
                switch (graphElementType) {
                    case GraphElementType.Relation :
                        return "arrow_right_alt";
                    case GraphElementType.Meta :
                        return "local_offer";
                    default :
                        return "panorama_fish_eye";
                }
            },
            link: function (center) {
                return IdUri.htmlUrlForBubbleUri(
                    center.getUri()
                )
            }
        },
        mounted: function () {
            CenterGraphElementService.getPublicAndPrivate().then(function (response) {
                this.centers = CenterGraphElement.fromServerFormat(response.data);
                this.loaded = true;
            }.bind(this))
        }
    }
</script>

<style scoped>

</style>
