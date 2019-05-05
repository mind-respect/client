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
                        ref="search"
                        v-model="selectedSearchResult"
                        attach="#tagDialog"
                        :items="items"
                        :search-input.sync="search"
                        item-text="label"
                        return-object
                        :menu-props="menuProps"
                        :loading="loading"
                        @change="selectSearchResult()"
                        cache-items
                        hide-no-data
                >
                    <template v-slot:prepend-inner>
                        <i class="fab fa-wikipedia-w mt-1"></i>
                        <v-icon>
                            label
                        </v-icon>
                    </template>
                    <template v-slot:item="{ item }">
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
            </v-card-text>
            <v-card flat class="pt-0">
                <v-card-text class="pt-0" id="tagDialog"></v-card-text>
            </v-card>
            <v-card min-height="150" flat class="pt-0">
                <v-list subheader three-line>
                    <v-subheader>
                        {{$t('tag:tags')}}
                    </v-subheader>
                    <v-list-tile v-for="identifier in identifiersByLatest" :href="identifier.url" target="_blank">
                        <v-list-tile-action v-if="identifier.hasImages()">
                            <v-img :src="identifier.getImage().urlForSmall" max-height="90"></v-img>
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
                        <v-spacer></v-spacer>
                        <i class="fab fa-wikipedia-w mr-4"></i>
                        <v-list-tile-action>
                            <v-btn icon flat @click.native="removeIdentifier($event, identifier)">
                                <v-icon color="third">
                                    delete
                                </v-icon>
                            </v-btn>
                        </v-list-tile-action>
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
    import Identification from '@/identifier/Identification'
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
                selectedSearchResult: null,
                search: null,
                identifier: null,
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
            selectedIdentifiers: function () {
                if (!this.dialog) {
                    return;
                }
                return SelectionHandler.getSingle().identifiers;
            },
            isTagFlow: function () {
                return this.$store.state.isTagFlow;
            },
            identifiersByLatest: function () {
                return this.selected.getIdentifiers().sort((a, b) => {
                    return b.getCreationDate() - a.getCreationDate();
                })
            }
        },
        watch: {
            search: function (val) {
                val && val !== this.select && this.querySelections(val)
            },
            isTagFlow: function () {
                if (this.$store.state.isTagFlow) {
                    this.defineUrls().then(() => {
                        this.dialog = true;
                        this.$nextTick(() => {
                            this.$refs.search.focus();
                        })
                    });
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsTagFlow", false)
                }
            },
            selectedIdentifiers: function () {
                this.defineUrls()
            }
        },
        methods: {
            querySelections(term) {
                this.loading = true;
                SearchService.tags(term).then((results) => {
                    this.items = results;
                    this.loading = false;
                });
            },
            selectSearchResult: function () {
                let identifier = Identification.fromSearchResult(
                    this.selectedSearchResult
                );
                if (this.selected.getModel().hasIdentification(identifier)) {
                    return false;
                }
                identifier.makeGeneric();
                this.selectedSearchResult.getImageUrl(this.selectedSearchResult).then((imageUrl) => {
                    if (imageUrl) {
                        identifier.addImage(imageUrl);
                    }
                    this.identify(identifier);
                });
                // var self = this;
                // SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                //     graphElement,
                //     searchResult.uri
                // );
                // if (graphElement.isSuggestion()) {
                //     var vertexSuggestion = graphElement.isRelationSuggestion() ?
                //         graphElement.childVertexInDisplay() : graphElement;
                //     vertexSuggestion.getController().accept(vertexSuggestion).then(
                //         identify
                //     );
                // } else {
                // }
                this.$refs.search.reset();
                this.search = '';
                return identifier;
            },
            identify: function (identifier) {
                return this.selected.getController().addIdentification(
                    identifier
                );
            },
            removeIdentifier: function ($event, identifier) {
                $event.preventDefault();
                this.selected.getController().removeIdentifier(identifier);
            },
            defineUrls: function () {
                return Promise.all(
                    this.selected.getIdentifiers().map((identifier) => {
                        return identifier.getUrl();
                    })
                );
            }
        }
    }
</script>

<style>
    #tagDialog .v-menu__content {
        top: -16px !important;
    }
</style>
