<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="dialog" width="900" v-if="dialog">
        <v-card>
            <v-card-title class="title">
                {{$t('existing:addRelationTo')}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0 pb-0">
                <v-autocomplete
                        v-if="parentAsSearchResult === null"
                        v-model="parentAsSearchResult"
                        :search-input.sync="searchTextParent"
                        prepend-icon="looks_one"
                        :no-data-text="$t('noSearchResults')"
                        :items="bubblesOnMap"
                        item-value="uri"
                        item-text="label"
                        :menu-props="parentMenuProps"
                        :placeholder="$t('existing:bubblesOnMap')"
                        @change="chooseParent"
                        return-object
                        light
                        :loading="loading"
                        flat
                        :label="$t('existing:parent')"
                        ref="parentOnMapAutocomplete"
                        @focus="focusParent()"
                >
                    <template v-slot:item="{ item }">
                        <SearchResultContent :item="item"></SearchResultContent>
                        <SearchResultAction :item="item"></SearchResultAction>
                    </template>
                    <SearchLoadMore slot="append-item" @loadMore="loadMore"
                                    ref="loadMore"></SearchLoadMore>
                </v-autocomplete>
                <v-list v-if="parentAsSearchResult !== null">
                    <v-list-item>
                        <v-list-item-action class="font-weight-bold">
                            <v-icon>
                                looks_one
                            </v-icon>
                        </v-list-item-action>
                        <SearchResultContent :item="parentAsSearchResult"></SearchResultContent>
                        <v-list-item-action>
                            <v-btn icon @click="resetParentSearch()">
                                <v-icon>close</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-text class="pt-0">
                <v-autocomplete
                        v-if="!canConfirm && canParentRelateToChild"
                        v-model="childAsSearchResult"
                        :search-input.sync="searchText"
                        prepend-icon="looks_two"
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
                        :label="$t('existing:child')"
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
                <v-list v-else>
                    <v-list-item>
                        <v-list-item-action class="font-weight-bold">
                            <v-icon>
                                looks_two
                            </v-icon>
                        </v-list-item-action>
                        <SearchResultContent :item="childAsSearchResult"></SearchResultContent>
                        <v-list-item-action>
                            <v-btn icon @click="resetChildAutocomplete()">
                                <v-icon>close</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
                <v-checkbox v-model="includeAllPatterns" :label="$t('existing:includeAllPatterns')"
                            v-show="!canConfirm && !confirmLoading"></v-checkbox>
            </v-card-text>
            <v-card-text v-if="!canParentRelateToChild">
                <v-alert type="warning">
                    {{$t('existing:cannotRelate')}}
                </v-alert>
            </v-card-text>
            <v-card-actions>
                <v-btn
                        class="mr-2"
                        @click="confirm"
                        color="secondary"
                        :loading="confirmLoading"
                        :disabled="!canConfirm"
                >
                    <v-icon class="mr-2" v-if="!canParentRelateToChild">
                        warning
                    </v-icon>
                    {{$t('existing:relate')}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
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
    import ListView from "./ListView";

    export default {
        name: "AddExistingBubbleDialog",
        components: {
            ListView,
            SearchLoadMore,
            SearchResultContent,
            SearchResultAction
        },
        data: function () {
            I18n.i18next.addResources("en", "existing", {
                "title": "Your bubbles",
                "titleWithPatterns": "Your bubbles and the patterns",
                "includeAllPatterns": "Include patterns of all users",
                addRelationTo: "Link two bubbles",
                bubblesOnMap: "Your bubbles on this map",
                parent: "Parent",
                child: "Child",
                relate: "Link",
                cannotRelate: "There can only be one relationship between each bubble"
            });
            I18n.i18next.addResources("fr", "existing", {
                "title": "Vos bulles",
                "titleWithPatterns": "Vos bulles et les patterns",
                "includeAllPatterns": "Inclure les patterns de tous les usagers",
                addRelationTo: "Relier deux bulles",
                bubblesOnMap: "Vos bulles sur cette carte",
                parent: "Parent",
                child: "Enfant",
                relate: "Relier",
                cannotRelate: "Il ne peut y avoir qu'une seule relation entre chaque bulle"
            });
            return {
                dialog: false,
                child: null,
                childAsSearchResult: null,
                parent: null,
                parentAsSearchResult: null,
                searchText: null,
                searchTextParent: null,
                items: [],
                bubblesOnMap: [],
                menuProps: {
                    "contentClass": "add-existing-dialog-menu",
                    "max-width": 800
                },
                parentMenuProps: {
                    "contentClass": "parent-dialog-menu",
                    "max-width": 800
                },
                loading: false,
                confirmLoading: false,
                x: null,
                y: null,
                closestData: null
            }
        },
        watch: {
            searchText: function (val) {
                this.setMenuPosition();
                val && val !== this.select && this.querySelections(val)
            },
            searchTextParent: function () {
                this.setMenuPositionForParent();
            },
            dialog: function () {
                if (this.dialog) {
                    KeyboardActions.disable();
                    GraphUi.disableDragScroll();
                } else {
                    KeyboardActions.enable();
                    GraphUi.enableDragScroll();
                    this.childAsSearchResult = null;
                    this.parentAsSearchResult = null;
                    this.parent = null;
                    this.child = null;
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
            },
            canConfirm: function () {
                return this.canParentRelateToChild && this.childAsSearchResult !== null && this.childAsSearchResult !== undefined && !this.confirmLoading;
            },
            canParentRelateToChild: function () {
                return this._canParentRelateToChild();
            }
        },
        methods: {
            _canParentRelateToChild: function () {
                if (this.parent === null || this.child === null) {
                    return true;
                }
                return this.parent.controller().relateToDistantVertexWithUriCanDo(this.child.getUri());
            },
            resetParentSearch: async function () {
                this.parentAsSearchResult = null;
                await this.$nextTick();
                this.$refs.parentOnMapAutocomplete.reset();
                this.parentAsSearchResult = null;
                this.searchTextParent = "";
                this.parent = null;
                this.$refs.parentOnMapAutocomplete.focus();
            },
            resetChildAutocomplete: async function () {
                this.childAsSearchResult = null;
                this.child = null;
                await this.$nextTick();
                this.$refs.existingBubbleAutocomplete.reset();
                this.childAsSearchResult = null;
                this.$refs.existingBubbleAutocomplete.focus();
            },
            confirm: async function () {
                this.confirmLoading = true;
                let distantUri = this.childAsSearchResult.uri;
                if (this.childAsSearchResult.original.getGraphElement().isPattern()) {
                    distantUri = await PatternService.use(
                        distantUri
                    ).then((response) => {
                        return response.data.uri;
                    });
                }
                await this.parent.controller().relateToDistantVertexWithUri(
                    distantUri,
                    this.closestData.edge === undefined ? 0 : this.closestData.edge.getIndexInTree(this.closestData.isAbove),
                    this.isLeft,
                    this.childAsSearchResult.original.getShareLevel()
                );
                this.confirmLoading = false;
                this.dialog = false;
            },
            chooseItem: function () {
                this.searchText = "";
                this.child = this.childAsSearchResult.original.getGraphElement();
            },
            chooseParent: async function () {
                this.loading = true;
                this.searchTextParent = "";
                this.parent = this.parentAsSearchResult.original.getGraphElement();
                if (this.parent.canExpand()) {
                    await this.parent.controller().expand(true, true, true);
                    this.parent.collapse();
                }
                this.loading = false;
            },
            enter: async function (x, y, isLeft) {
                this.childAsSearchResult = null;
                this.parentAsSearchResult = null;
                this.x = x;
                this.y = y;
                this.searchText = "";
                this.closestData = Dragged.getClosestChildEdge(
                    this.x + document.scrollingElement.scrollLeft,
                    this.y + document.scrollingElement.scrollTop,
                    CurrentSubGraph.get().center,
                    this.isLeft
                );
                return this.enterUsingParentBubble(
                    (
                        this.closestData.edge === undefined ?
                            CurrentSubGraph.get().center :
                            this.closestData.edge.getParentFork()
                    ),
                    isLeft
                );
            },
            enterForCenter: async function () {
                this.closestData = {};
                return this.enterUsingParentBubble(
                    CurrentSubGraph.get().center
                );
            },
            enterUsingParentBubble: async function (parentBubble, isLeft) {
                this.parent = parentBubble;
                this.parentAsSearchResult = SearchService.searchResultFromOnMapGraphElement(this.parent);
                this.bubblesOnMap = CurrentSubGraph.get().getGraphElements().filter((graphElement) => {
                    return graphElement.isForkType();
                }).map((graphElement) => {
                    return SearchService.searchResultFromOnMapGraphElement(graphElement);
                });
                this.confirmLoading = false;
                this.isLeft = isLeft || parentBubble._shouldAddLeft(isLeft);
                this.dialog = true;
                await this.$nextTick();
                this.$refs.existingBubbleAutocomplete.reset();
                await this.$nextTick();
                this.$refs.existingBubbleAutocomplete.focus();
            },
            querySelections: function (searchText) {
                this.loading = true;
                let searchFctn = this.getSearchFctn();
                searchFctn(searchText).then((results) => {
                    this.items = results.map((result) => {
                        return result;
                    });
                    this.loading = false;
                    this.$nextTick(() => {
                        if (this.$refs.loadMore) {
                            this.$refs.loadMore.reset(results.length, searchText);
                        }
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
            setMenuPosition: function () {
                const menu = document.getElementsByClassName('add-existing-dialog-menu')[0];
                if (!menu) {
                    return;
                }
                const autocompleteRect = this.$refs.existingBubbleAutocomplete.$el.getBoundingClientRect();
                menu.style.left = autocompleteRect.x + "px";
                menu.style.top = (autocompleteRect.y + autocompleteRect.height) + "px";
            },
            setMenuPositionForParent: function () {
                const menu = document.getElementsByClassName('parent-dialog-menu')[0];
                if (!menu) {
                    return;
                }
                const autocompleteRect = this.$refs.parentOnMapAutocomplete.$el.getBoundingClientRect();
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
            focusParent: function () {
                this.$nextTick(async () => {
                    await this.$nextTick();
                    await this.$nextTick();
                    await this.$nextTick();
                    setTimeout(() => {
                        this.setMenuPositionForParent();
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
