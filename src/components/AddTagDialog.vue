<template>
    <v-dialog v-model="dialog" v-if="dialog" width="900" top>
        <v-card>
            <v-card-title>
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >
                    close
                </v-icon>
            </v-card-title>
            <v-card-text>
                <v-autocomplete
                        ref="tagSearch"
                        v-model="selectedSearchResult"
                        :items="items"
                        :search-input.sync="search"
                        item-value="uri"
                        item-text="label"
                        return-object
                        :menu-props="menuProps"
                        :loading="searchLoading"
                        @change="selectSearchResult()"
                        cache-items
                        clearable
                        :hide-no-data='!search || search.trim() === ""'
                        @focus="focus"
                        :placeholder="$t('addTag:title')"
                        v-show="!bubble || (!bubble.isGroupRelation() && !bubble.isMeta())"
                        :disabled="!bubble"
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
                <div style="height:150px;" class="vh-center">
                    <v-progress-circular
                            :size="70"
                            :width="3"
                            color="third"
                            indeterminate
                            v-show="tagLoading"
                    ></v-progress-circular>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import I18n from '@/I18n'
    import Tag from "@/tag/Tag";
    import Selection from '@/Selection'
    import SearchService from '@/search/SearchService'
    import SearchLoadMore from '@/components/search/SearchLoadMore'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import KeyboardActions from '@/KeyboardActions'

    export default {
        name: "AddTagDialog",
        components: {
            SearchLoadMore,
            SearchResultContent,
            SearchResultAction
        },
        mounted: function () {
            this.$store.dispatch("setIsAddTagFlow", false);
        },
        data: function () {
            I18n.i18next.addResources("en", "addTag", {
                "title": "Add tag"
            });
            I18n.i18next.addResources("fr", "addTag", {
                "title": "Ajouter un étiquette"
            });
            return {
                search: null,
                dialog: false,
                selectedSearchResult: null,
                items: [],
                searchLoading: false,
                menuProps: {
                    "contentClass": 'search-menu add-tag-dialog-menu'
                },
                tagLoading: false
            }
        },
        computed: {
            isAddTagFlow: function () {
                return this.$store.state.isAddTagFlow;
            },
            bubble: function () {
                return Selection.getSingle();
            }
        },
        watch: {
            isAddTagFlow: function () {
                if (this.$store.state.isAddTagFlow) {
                    this.dialog = true;
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.$refs.tagSearch.$el.querySelector("input").focus();
                        }, 100)
                    });
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog) {
                    KeyboardActions.disable();
                } else {
                    KeyboardActions.enable();
                    this.$store.dispatch("setIsAddTagFlow", false)
                }
            },
            search: function (val) {
                this.setMenuPosition();
                val && val !== this.select && this.querySelections(val);
            }
        },
        methods: {
            focus: function () {
                this.$nextTick(async () => {
                    await this.$nextTick();
                    await this.$nextTick();
                    await this.$nextTick();
                    setTimeout(() => {
                        this.setMenuPosition();
                    }, 100)
                });
            },
            selectSearchResult: function () {
                this.tagLoading = true;
                let identifier = Tag.fromSearchResult(
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
                    this.dialog = false;
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
                this.$refs.tagSearch.reset();
                this.$refs.tagSearch.blur();
                return identifier;
            },
            createTagWithNoRef: function () {
                this.tagLoading = true;
                let tag = Tag.withUriLabelAndDescription(
                    Tag.generateVoidUri(),
                    this.search,
                    ""
                );
                this.identify(tag).then((tags) => {
                    this.tagLoading = false;
                    this.dialog = false;
                });
                this.$refs.tagSearch.reset();
                this.$refs.tagSearch.blur();
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
                    if (this.$refs.loadMore) {
                        this.$refs.loadMore.reset(results.length, this.search);
                    }
                });
            },
            loadMore: function (callback) {
                SearchService.tags(this.search, this.items.filter((item) => {
                    return item.source === "mindrespect.com";
                }).length).then((results) => {
                    this.items = this.items.concat(results);
                    callback(results.length, this.$refs.tagSearch);
                });
            },
            setMenuPosition: function () {
                const menu = document.getElementsByClassName('add-tag-dialog-menu')[0];
                if (!menu) {
                    return;
                }
                const autocompleteRect = this.$refs.tagSearch.$el.getBoundingClientRect();
                menu.style.left = autocompleteRect.x + "px";
                menu.style.top = (autocompleteRect.y + autocompleteRect.height) + "px";
            },
            identify: function (identifier) {
                return Selection.getSingle().controller().addIdentification(
                    identifier
                );
            }
        }
    }
</script>

<style scoped>

</style>