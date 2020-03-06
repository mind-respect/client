<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="dialog" width="900">
        <v-card>
            <v-card-title class="title">
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0">
                <v-autocomplete
                        v-model="selectedSearchResult"
                        :search-input.sync="searchText"
                        prepend-icon="search"
                        :no-data-text="$t('noSearchResults')"
                        :items="items"
                        item-value="uri"
                        item-text="label"
                        :menu-props="menuProps"
                        :placeholder="includeAllPatterns ? $t('existing:titleWithPatterns'): $t('existing:title')"
                        @change="chooseItem"
                        cache-items
                        return-object
                        light
                        :loading="loading"
                        flat
                        ref="existingBubbleAutocomplete"
                        @focus="focus"
                >
                    <template v-slot:item="{ item }">
                        <SearchResultContent :item="item"></SearchResultContent>
                        <SearchResultAction :item="item"></SearchResultAction>
                    </template>
                    <SearchLoadMore slot="append-item" @loadMore="loadMore"
                                    ref="loadMore"></SearchLoadMore>
                </v-autocomplete>
                <v-checkbox v-model="includeAllPatterns" :label="$t('existing:includeAllPatterns')"></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                        text
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
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import GraphUi from '@/graph/GraphUi'
    import SearchService from '@/search/SearchService'
    import SearchLoadMore from '@/components/search/SearchLoadMore'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import PatternService from "@/pattern/PatternService";
    import Dragged from '@/Dragged'
    import KeyboardActions from '@/KeyboardActions'

    export default {
        name: "AddExistingBubbleDialog",
        components: {
            SearchLoadMore,
            SearchResultContent,
            SearchResultAction
        },
        data: function () {
            I18n.i18next.addResources("en", "existing", {
                "title": "Your bubbles",
                "titleWithPatterns": "Your bubbles and the patterns",
                "includeAllPatterns": "Include patterns of all users"
            });
            I18n.i18next.addResources("fr", "existing", {
                "title": "Vos bulles",
                "titleWithPatterns": "Vos bulles et les patterns",
                "includeAllPatterns": "Inclure les patterns de tous les usagers"
            });
            return {
                dialog: false,
                selectedSearchResult: null,
                searchText: null,
                items: [],
                menuProps: {
                    "contentClass": "add-existing-dialog-menu",
                    "max-width": 800
                },
                loading: false,
                x: null,
                y: null
            }
        },
        mounted: function () {

        },
        watch: {
            searchText: function (val) {
                this.setMenuPosition();
                val && val !== this.select && this.querySelections(val)
            },
            dialog: function () {
                if (this.dialog) {
                    KeyboardActions.disable();
                    GraphUi.disableDragScroll();
                } else {
                    KeyboardActions.enable();
                    GraphUi.enableDragScroll();
                }
            }
        },
        computed: {
            center: function () {
                return CurrentSubGraph.get().center;
            },
            includeAllPatterns: {
                get: function () {
                    return this.$store.state.addRelationIncludeAllPatterns;
                },
                set: function (value) {
                    this.$store.dispatch("setAddRelationIncludeAllPatterns", value);
                }
            }
        },
        methods: {
            enter: function (x, y, isLeft) {
                this.x = x;
                this.y = y;
                this.isLeft = isLeft;
                this.dialog = true;
                this.$nextTick(async () => {
                    this.$refs.existingBubbleAutocomplete.reset();
                    await this.$nextTick();
                    this.$refs.existingBubbleAutocomplete.focus();
                });
            },
            querySelections: function (searchText) {
                this.loading = true;
                let currentSubGraph = CurrentSubGraph.get();
                let searchFctn = this.getSearchFctn();
                searchFctn(searchText).then((results) => {
                    this.items = results.map((result) => {
                        result.disabled = currentSubGraph.hasUri(result.uri);
                        return result;
                    });
                    this.loading = false;
                    this.$nextTick(() => {
                        this.$refs.loadMore.reset(results.length, searchText);
                    });
                });
            },
            loadMore: function (callback) {
                let searchFctn = this.getSearchFctn();
                searchFctn(this.searchText, this.items.length).then((results) => {
                    this.items = this.items.concat(results);
                    callback(results.length, this.$refs.existingBubbleAutocomplete);
                });
            },
            chooseItem: async function () {
                let closest = Dragged.getClosestChildEdge(
                    this.x + document.scrollingElement.scrollLeft,
                    this.y + document.scrollingElement.scrollTop,
                    CurrentSubGraph.get().center,
                    this.isLeft
                );
                let forkToRelate = closest.edge === undefined ? CurrentSubGraph.get().center : closest.edge.getParentFork();
                let distantUri = this.selectedSearchResult.uri;
                if (this.selectedSearchResult.original.getGraphElement().isPattern()) {
                    distantUri = await PatternService.use(
                        distantUri
                    ).then((response) => {
                        return response.data.uri;
                    });
                }
                forkToRelate.controller().relateToDistantVertexWithUri(
                    distantUri,
                    closest.edge === undefined ? 0 : closest.edge.getIndexInTree(closest.isAbove),
                    this.isLeft
                );
                this.dialog = false;
            },
            setMenuPosition: function () {
                const menu = document.getElementsByClassName('add-existing-dialog-menu')[0];
                if (!menu) {
                    return;
                }
                const autocompleteRect = this.$refs.existingBubbleAutocomplete.$el.getBoundingClientRect();
                menu.style.left = autocompleteRect.x + "px";
                menu.style.top = (autocompleteRect.y + autocompleteRect.height) + "px";
            },
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
            getSearchFctn: function () {
                return this.$store.state.addRelationIncludeAllPatterns ?
                    SearchService.ownVerticesAndAllPatterns :
                    SearchService.ownVertices;
            }
        }
    }
</script>

<style>
</style>
