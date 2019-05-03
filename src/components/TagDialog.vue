<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="dialog" width="900" v-if="dialog">
        <v-card>
            <v-card-title class="title">
<!--                <v-icon class="mr-2">label</v-icon>-->
                {{$t('tag:title')}}
                "{{selected.getLabel()}}"
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0 pb-0">
                <v-autocomplete
                        v-model="select"
                        attach="#tagDialog"
                        :items="items"
                        :search-input.sync="search"
                        item-value="uri"
                        item-text="label"
                        :menu-props="menuProps"
                        :loading="loading"
                        cache-items
                        hide-no-data
                >
                    <template v-slot:prepend-inner>
                        <!--                        <v-avatar size="20">-->
                        <!--                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png" alt="avatar">-->
                        <!--                        </v-avatar>-->
                        <i class="fab fa-wikipedia-w mt-1"></i>
                        <v-icon>
                            label
                        </v-icon>
                    </template>
                    <template v-slot:item="{ item }">
                        <!--                        <v-list-tile-action v-if="item.imageUrl">-->
                        <!--                            <img crossorigin="anonymous" :src="item.imageUrl"  width="40">-->
                        <!--                            <v-img crossorigin="anonymous" :src="item.imageUrl" max-height="60"></v-img>-->
                        <!--                        </v-list-tile-action>-->
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{item.label}}
                            </v-list-tile-title>
                            <v-list-tile-sub-title>
                                {{item.description}}
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                            <i class="fab fa-wikipedia-w mt-1" v-if="item.source ==='wikidata'"></i>
                        </v-list-tile-action>
                    </template>
                </v-autocomplete>
                </v-layout>
            </v-card-text>
            <v-card flat class="pt-0">
                <v-card-text class="pt-0" id="tagDialog"></v-card-text>
            </v-card>
            <v-card min-height="150" flat class="pt-0">
                <v-list subheader>
                    <v-subheader>
                        {{$t('tag:tags')}}
                    </v-subheader>
                    <v-list-tile v-for="identifier in selected.getIdentifiers()">
                        <v-list-tile-action>
                        </v-list-tile-action>
                        <v-list-tile>
                            <v-list-tile-content>
                                <v-list-tile-title>
                                    {{identifier.getLabel()}}
                                </v-list-tile-title>
                                <v-list-tile-sub-title>
                                    {{identifier.getComment()}}
                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list-tile>
                </v-list>
            </v-card>
            <v-card-actions>
                <v-btn
                        color="third" dark
                        class="mr-2"
                        @click="dialog = false"
                >
                    {{$t('cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import I18n from '@/I18n'
    import GraphElement from '@/graph-element/GraphElement'
    import SelectionHandler from '@/SelectionHandler'
    import SearchService from '@/search/SearchService'

    export default {
        name: "TagDialog",
        data: function () {
            I18n.i18next.addResources("en", "tag", {
                "title": "Tags of",
                'tags': 'Tags'
            });
            I18n.i18next.addResources("fr", "tag", {
                "title": "Étiquettes de",
                'tags': 'Étiquettes'
            });
            return {
                dialog: false,
                loading: false,
                select: null,
                search: null,
                items: [],
                menuProps: {
                    "content-class": 'search-menu'
                }
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsTagFlow", false)
        },
        computed: {
            selected: function () {
                return SelectionHandler.getSingle();
            },
            isTagFlow: function () {
                return this.$store.state.isTagFlow;
            }
        },
        watch: {
            search: function (val) {
                val && val !== this.select && this.querySelections(val)
            },
            isTagFlow: function () {
                if (this.$store.state.isTagFlow) {
                    this.dialog = true;
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsTagFlow", false)
                }
            }
        },
        methods: {
            querySelections(term) {
                this.loading = true;
                SearchService.tags(term).then((results) => {
                    this.items = results;
                    this.loading = false;
                });
            }
        }
    }
</script>

<style>
    #tagDialog .v-menu__content {
        top: -16px !important;
    }
</style>
