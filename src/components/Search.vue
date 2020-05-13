<template>
    <!--    <div>-->
    <!--        <v-btn fab icon v-if="!isFocusFLow" @click="isFocusFLow = true">-->
    <!--            search-->
    <!--        </v-btn>-->
    <v-autocomplete
            v-if="$store.state.user && loaded"
            ref="search"
            :prepend-icon="prependIcon"
            v-model="selectedSearchResult"
            :items="items"
            item-value="uri"
            item-text="label"
            :search-input.sync="searchText"
            return-object
            light
            solo
            :loading="loading"
            flat
            cache-items
            :placeholder="$t('search:placeholder')"
            @change="selectSearchResult()"
            :menuProps="menuProps"
            append-icon=""
            @focus="focus"
            @blur="blur"
            height="43">
        <template v-slot:item="{ item }">
            <SearchResultContent :item="item"></SearchResultContent>
            <SearchResultAction :item="item"></SearchResultAction>
        </template>
        <SearchCreate slot="append-item" @create="createCenterVertex"
                      ref="searchCreate"></SearchCreate>
        <SearchLoadMore slot="append-item" @loadMore="loadMore"
                        ref="loadMore"></SearchLoadMore>
        <v-list-item slot="no-data" @click="createCenterVertex" v-show="!loading">
            <v-list-item-content>
                <v-list-item-title>
                    {{$t('noSearchResults')}}
                </v-list-item-title>
                <v-list-item-subtitle class="">
                    {{$t('create')}} "{{searchText}}"
                </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
                <v-icon>
                    add
                </v-icon>
            </v-list-item-action>
        </v-list-item>
    </v-autocomplete>
    <!--    </div>-->
</template>

<script>
    import SearchCreate from '@/components/search/SearchCreate'
    import SearchLoadMore from '@/components/search/SearchLoadMore'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import I18n from '@/I18n'
    import SearchService from '@/search/SearchService'
    import AppController from '@/AppController'
    import IdUri from '@/IdUri'
    import GraphUi from '@/graph/GraphUi'
    import * as KeyCode from 'keycode-js';
    import UiUtils from '@/UiUtils'
    import Selection from '@/Selection'
    import CurrentSubGraph from "@/graph/CurrentSubGraph";

    let searchTimeout;

    export default {
        name: "Search",
        components: {
            SearchCreate,
            SearchLoadMore,
            SearchResultContent,
            SearchResultAction
        },
        data: () => {
            I18n.i18next.addResources("en", "search", {
                "placeholder": "Bubbles"
            });
            I18n.i18next.addResources("fr", "search", {
                "placeholder": "Bulles"
            });
            return {
                selectedSearchResult: null,
                searchText: null,
                loading: false,
                loaded: false,
                items: [],
                menuProps: null,
                readyToDisplay: false,
                isFocusFLow: false
            };
        },
        mounted: function () {
            this.menuProps = {
                "contentClass": "main-search-menu search-menu"
            };
            this.loaded = true;
        },
        watch: {
            searchText: function (val) {
                this.setMenuPosition();
                val && val !== this.select && this.querySelectionsDebounced(val)
            }
        },
        methods: {
            focus: function () {
                GraphUi.disableDragScroll();
                this.$nextTick(async () => {
                    await this.$nextTick();
                    await this.$nextTick();
                    await this.$nextTick();
                    setTimeout(() => {
                        this.setMenuPosition();
                    }, 100)
                });
            },
            blur: function () {
                GraphUi.enableDragScroll();
                this.$emit('leaveSearchFlow')
            },
            selectSearchResult: function () {
                const currentSubGraph = CurrentSubGraph.get();
                if (currentSubGraph && currentSubGraph.hasUri(this.selectedSearchResult.uri)) {
                    const graphElement = currentSubGraph.getHavingUri(this.selectedSearchResult.uri);
                    graphElement.getAncestors().forEach((ancestor) => {
                        ancestor.expand();
                    });
                    Selection.setToSingle(
                        graphElement,
                        true
                    );
                } else {
                    this.$router.push(
                        IdUri.htmlUrlForBubbleUri(
                            this.selectedSearchResult.uri
                        )
                    );
                }
                this.$refs.search.reset();
                this.$refs.search.blur();
            },
            querySelectionsDebounced: function (searchText) {
                this.loading = true;
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(async () => {
                    this.querySelections(searchText)
                }, 500);
            },
            querySelections: async function (searchText) {
                const results = await SearchService.searchForAllOwnResources(searchText, 0);
                setTimeout(async () => {
                    this.loading = false;
                    await this.$nextTick();
                    this.items = results.map((result) => {
                        result.disabled = result.original.getGraphElement().isGroupRelation();
                        return result;
                    });
                    console.log(items);
                    //if not await this.$nextTick(); the search response sometimes stays pending and freezes the search
                    await this.$nextTick();
                    if (this.$refs.loadMore) {
                        this.$refs.loadMore.reset(results.length, searchText);
                    }
                    if (this.$refs.searchCreate) {
                        this.$refs.searchCreate.reset(results.length, searchText);
                    }
                }, 50)
            },
            setMenuPosition: function () {
                const menu = document.getElementsByClassName('main-search-menu')[0];
                if (!menu) {
                    return;
                }
                const autocompleteRect = this.$refs.search.$el.getBoundingClientRect();
                if (this.$vuetify.breakpoint.smAndDown) {
                    menu.style.left = "0";
                    menu.style.position = "fixed"
                } else {
                    menu.style.left = autocompleteRect.x + "px";
                    menu.style.width = autocompleteRect.width + "px";
                }
            },
            loadMore: function (callback) {
                SearchService.searchForAllOwnResources(this.searchText, this.items.length).then((results) => {
                    this.items = this.items.concat(results);
                    callback(results.length, this.$refs.search);
                });
            },
            createCenterVertex: function () {
                AppController.createVertex(this.searchText).then(() => {
                    this.$refs.search.reset();
                    this.$refs.search.blur();
                })
            },
            enterSearchFlow: function () {
                this.$nextTick(() => {
                    this.$refs.search.focus();
                });
            },
            setupCtrlF: function (event) {
                const isCtrlPressed = UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey;
                if (isCtrlPressed && event.keyCode === KeyCode.KEY_F) {
                    event.preventDefault();
                    this.$refs.search.focus();
                }
            }
        },
        computed: {
            prependIcon: function () {
                return this.$vuetify.breakpoint.smAndDown ? "" : "search";
            }
        },
        created() {
            window.addEventListener("keydown", this.setupCtrlF);
        },
        beforeDestroy: function () {
            window.removeEventListener("keydown", this.setupCtrlF);
        }
    }
</script>

<style>
    .main-search-menu {
        /*43px is toolbar height*/
        top: 43px !important;
        width: 100%;
        max-width: 800px;
    }

    .search-menu .v-list__item {
        height: auto;
        min-height: 48px;
        max-height: 105px;
    }

</style>