<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card flat>
        <v-card-text class="pt-0 pb-0">
            <v-autocomplete
                    ref="search"
                    v-model="selectedSearchResult"
                    attach="#tagMenu"
                    :items="items"
                    :search-input.sync="search"
                    item-value="uri"
                    item-text="label"
                    return-object
                    :menu-props="menuProps"
                    :loading="loading"
                    @change="selectSearchResult()"
                    cache-items
                    hide-no-data
                    clearable
                    @focus="$emit('focus')"
                    @blur="$emit('blur')"
                    :placeholder="$t('tag:title')"
            >
                <template v-slot:prepend-inner>
                    <i class="fab fa-wikipedia-w mt-1"></i>
                    <v-icon>
                        label
                    </v-icon>
                </template>
                <template v-slot:item="{ item }">
                    <SearchResultContent :item="item"></SearchResultContent>
                    <SearchResultAction :item="item"></SearchResultAction>
                </template>
            </v-autocomplete>
        </v-card-text>
        <v-card flat class="pt-0">
            <v-card-text class="pt-0" id="tagMenu"></v-card-text>
        </v-card>
        <v-card min-height="150" flat class="pt-0">
            <v-list subheader three-line>
                <v-list-tile v-for="identifier in identifiersByLatest" :key="identifier.externalResourceUri" :href="identifier.url" target="_blank">
                    <v-list-tile-action v-if="identifier.hasImages()">
                        <v-img :src="identifier.getImage().urlForSmall" max-height="90"></v-img>
                    </v-list-tile-action>
                    <v-list-tile>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{identifier.getLabel()}}
                            </v-list-tile-title>
                            <v-list-tile-sub-title v-html="identifier.getComment()">
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-spacer></v-spacer>
                    <v-icon class="mr-4" v-if="identifier.refersToAGraphElement()">
                        {{identifier.getIcon()}}
                    </v-icon>
                    <i class="fab fa-wikipedia-w mr-4" v-else></i>
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
    </v-card>
</template>

<script>
    import SearchResultContent from '@/components/SearchResultContent'
    import SearchResultAction from '@/components/SearchResultAction'
    import I18n from '@/I18n'
    import SelectionHandler from '@/SelectionHandler'
    import SearchService from '@/search/SearchService'
    import Identification from '@/identifier/Identification'

    export default {
        name: "TagMenu",
        components: {
            SearchResultContent,
            SearchResultAction
        },
        data: function () {
            I18n.i18next.addResources("en", "tag", {
                "title": "Tag",
                'tags': 'Tags'
            });
            I18n.i18next.addResources("fr", "tag", {
                "title": "Étiquette",
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
                    "contentClass": 'side-search-menu search-menu'
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
                            // if(this.selected.getIdentifiers().length === 0){
                            //     this.search = this.selected.getLabel();
                            // }
                            // this.$nextTick(()=>{
                            this.$refs.search.focus();
                            // })
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
                if (this.selected.model().hasIdentification(identifier)) {
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
</style>
