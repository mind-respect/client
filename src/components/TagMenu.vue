<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card flat v-if="loaded">
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
                    :searchLoading="searchLoading"
                    @change="selectSearchResult()"
                    cache-items
                    clearable
                    :hide-no-data='!search || search.trim() === ""'
                    @focus="$emit('focus')"
                    @blur="$emit('blur')"
                    :placeholder="$t('tag:title')"
                    v-show="!bubble.isGroupRelation() && !bubble.isMeta()"
            >
                <template v-slot:prepend-inner>
                    <img :src="require('@/assets/wikipedia.svg')" width="25">
                </template>
                <template v-slot:item="{ item }" :attr="searchResultAttrs(item.uri)">
                    <SearchResultContent :item="item"></SearchResultContent>
                    <SearchResultAction :item="item"></SearchResultAction>
                </template>
                <SearchLoadMore slot="append-item" @loadMore="loadMore" @create="createTagWithNoRef"
                                ref="loadMore" v-show="!searchLoading"></SearchLoadMore>
                <!--                <v-list-item slot="append-item" @click="createTagWithNoRef"-->
                <!--                             v-if="search && search.trim() !== '' && items.length > 0" >-->
                <!--                    <v-list-item-content>-->
                <!--                        <v-list-item-title>-->
                <!--                            "{{search}}"-->
                <!--                        </v-list-item-title>-->
                <!--                        <v-list-item-subtitle class="">-->
                <!--                            {{$t('tag:createNew')}}-->
                <!--                        </v-list-item-subtitle>-->
                <!--                    </v-list-item-content>-->
                <!--                    <v-list-item-action>-->
                <!--                        <v-icon>-->
                <!--                            add-->
                <!--                        </v-icon>-->
                <!--                    </v-list-item-action>-->
                <!--                </v-list-item>-->
                <v-list-item slot="no-data" @click="createTagWithNoRef" v-if="search && search.trim() !== ''"
                             v-show="!searchLoading">
                    <v-list-item-content>
                        <v-list-item-title>
                            "{{search}}"
                        </v-list-item-title>
                        <v-list-item-subtitle class="">
                            {{$t('tag:createNew')}}
                        </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-icon>
                            add
                        </v-icon>
                    </v-list-item-action>
                </v-list-item>
            </v-autocomplete>
        </v-card-text>
        <v-card flat class="pt-0">
            <v-card-text class="pt-0" id="tagMenu"></v-card-text>
        </v-card>
        <v-card min-height="150" flat class="pt-0 text-center">
            <v-progress-circular indeterminate color="third" v-if="tagLoading"></v-progress-circular>
            <v-list subheader three-line :key="$store.state.tagRefresh + 'tagMenu'">
                <v-list-item v-for="identifier in identifiersByLatest()" :key="identifier.externalResourceUri"
                             class="mr-0 pr-0">
                    <v-list-item-action v-if="identifier.hasImages()" class="ma-3 ml-0">
                        <v-img :src="identifier.getImage().urlForSmall" max-height="90"></v-img>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title class="text-left mb-0">
                            {{identifier.getLabel()}}
                            <v-icon class="mr-6 float-right" v-if="identifier.refersToAGraphElement()">
                                {{identifier.getIcon()}}
                            </v-icon>
                            <img v-else :src="require('@/assets/wikipedia.svg')" width="25" class="float-right">
                        </v-list-item-title>
                        <v-list-item-subtitle v-html="identifier.getComment()"
                                              class="grey--text text-left"></v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action class="ma-0 vh-center"
                                        style="min-height:100%;height:100%" v-show="!bubble.isMeta()">
                        <v-menu>
                            <template v-slot:activator="{ on }">
                                <v-btn icon text v-on="on" class="mt-5 ml-2 mr-1" small>
                                    <v-icon color="third">
                                        more_horiz
                                    </v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item :href="identifier.url" v-if="!$store.state.isViewOnly">
                                    <v-list-item-action>
                                        <v-icon>filter_center_focus</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>
                                        {{$t('tag:center')}}
                                    </v-list-item-title>
                                </v-list-item>
                                <v-list-item :href="identifier.externalUrl" target="_blank"
                                             v-if="!identifier.isVoidReferenceTag()">
                                    <v-list-item-action>
                                        <v-icon class="mr-6 float-right" v-if="identifier.refersToAGraphElement()">
                                            {{identifier.getIcon()}}
                                        </v-icon>
                                        <img v-else :src="require('@/assets/wikipedia.svg')" width="25"
                                             class="float-right">
                                    </v-list-item-action>
                                    <v-list-item-title>
                                        {{$t('tag:reference')}}
                                    </v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="removeIdentifier($event, identifier)"
                                             v-if="!bubble.isGroupRelation()">
                                    <v-list-item-action>
                                        <v-icon>delete</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>
                                        {{$t('tag:disassociate')}}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-card>
    </v-card>
</template>

<script>
    import IdUri from "@/IdUri";
    import SearchLoadMore from '@/components/search/SearchLoadMore'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import I18n from '@/I18n'
    import SearchService from '@/search/SearchService'
    import Identification from '@/identifier/Identification'

    export default {
        name: "TagMenu",
        props: ['bubble'],
        components: {
            SearchLoadMore,
            SearchResultContent,
            SearchResultAction
        },
        data: function () {
            I18n.i18next.addResources("en", "tag", {
                "title": "Tag",
                'tags': 'Tags',
                'disassociate': 'Disassociate',
                'center': 'Center',
                'reference': 'Reference',
                'createNew': 'Create new tag'
            });
            I18n.i18next.addResources("fr", "tag", {
                "title": "Étiquette",
                'tags': 'Étiquettes',
                'disassociate': 'Désassocier',
                'center': 'Centrer',
                'reference': 'Référence',
                'createNew': 'Créer une nouvelle étiquette'
            });
            return {
                loaded: false,
                searchLoading: false,
                tagLoading: false,
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
            this.buildExternalUrls().then(() => {
                this.loaded = true;
            })
        },
        computed: {
            selected: function () {
                return this.$store.state.selected;
            },
            identifiers: function () {
                return this.bubble.identifiers;
            }
        },
        watch: {
            search: function (val) {
                val && val !== this.select && this.querySelections(val)
            },
            selected: function () {
                this.buildExternalUrls();
            }
        },
        methods: {
            createTagWithNoRef: function () {
                this.tagLoading = true;
                let tag = Identification.withUriLabelAndDescription(
                    Identification.generateVoidUri(),
                    this.search,
                    ""
                );
                this.identify(tag).then((tags) => {
                    this.tagLoading = false;
                    this.refresh();
                });
                this.$refs.search.reset();
                this.$refs.search.blur();
            },
            refresh: function () {
                this.$store.dispatch("tagRefresh");
            },
            identifiersByLatest: function () {
                if (this.bubble.isMeta()) {
                    return [
                        this.bubble.getOriginalMeta()
                    ];
                }
                return this.bubble.getTagsAndSelfIfRelevant().sort((a, b) => {
                    return b.getCreationDate() - a.getCreationDate();
                })
            },
            querySelections(term) {
                this.searchLoading = true;
                SearchService.tags(term).then((results) => {
                    this.items = results.map((result) => {
                        result.disabled = this.bubble.hasTagRelatedToUri(result.uri);
                        if (!result.disabled && result.original.graphElement && result.original.graphElement.hasTagRelatedToUri) {
                            result.disabled = result.original.graphElement.hasTagRelatedToUri(
                                this.bubble.getUri()
                            );
                        }
                        return result;
                    });
                    this.searchLoading = false;
                    this.$refs.loadMore.reset(results.length, this.search);
                });
            },
            loadMore: function (callback) {
                SearchService.tags(this.search, this.items.filter((item) => {
                    return item.source === "mindrespect.com";
                }).length).then((results) => {
                    this.items = this.items.concat(results);
                    callback(results.length, this.$refs.search);
                });
            },
            selectSearchResult: function () {
                this.tagLoading = true;
                let identifier = Identification.fromSearchResult(
                    this.selectedSearchResult
                );
                if (this.bubble.hasIdentification(identifier)) {
                    return false;
                }
                identifier.makeGeneric();
                this.selectedSearchResult.getImageUrl(this.selectedSearchResult).then((imageUrl) => {
                    if (imageUrl) {
                        identifier.addImage(imageUrl);
                    }
                    return this.identify(identifier);
                }).then(() => {
                    this.tagLoading = false;
                    this.refresh();
                    this.$store.dispatch("redraw");
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
                this.$refs.search.blur();
                return identifier;
            },
            identify: function (identifier) {
                return this.bubble.controller().addIdentification(
                    identifier
                );
            },
            removeIdentifier: async function ($event, identifier) {
                $event.preventDefault();
                await this.bubble.controller().removeIdentifier(identifier);
                this.refresh();
                await this.$nextTick();
                this.$store.dispatch("redraw");
            },
            buildExternalUrls: function () {
                this.loaded = false;
                return Promise.all(this.bubble.getTagsAndSelfIfRelevant().map((tag) => {
                    return tag.buildExternalUrls();
                })).then(() => {
                    this.loaded = true;
                })
            }
        }
    }
</script>

<style>
</style>
