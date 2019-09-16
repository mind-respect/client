<template>
    <!--    <div>-->
    <!--        <v-btn fab icon v-if="!isFocusFLow" @click="isFocusFLow = true">-->
    <!--            search-->
    <!--        </v-btn>-->
    <v-autocomplete
            v-if="$store.state.user && loaded"
            ref="search"
            prepend-icon="search"
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
    import SearchResultContent from '@/components/SearchResultContent'
    import SearchResultAction from '@/components/SearchResultAction'
    import I18n from '@/I18n'
    import SearchService from '@/search/SearchService'
    import AppController from '@/AppController'
    import IdUri from '@/IdUri'
    import GraphUi from '@/graph/GraphUi'

    export default {
        name: "Search",
        components: {
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
            let menuClass = "search-menu";
            if (this.$vuetify.breakpoint.lgAndUp) {
                menuClass += " top-search top-search-desktop";
            }
            this.menuProps = {
                "nudge-left": 50,
                "max-width": 800,
                "contentClass": menuClass
            };
            this.loaded = true;
        },
        watch: {
            searchText: function (val) {
                val && val !== this.select && this.querySelections(val)
            }
        },
        methods: {
            focus: () => {
                GraphUi.disableDragScroll();
            },
            blur: () => {
                GraphUi.enableDragScroll();
            },
            selectSearchResult: function () {
                this.$router.push(
                    IdUri.htmlUrlForBubbleUri(
                        this.selectedSearchResult.uri
                    )
                );
                this.$refs.search.reset();
                this.$refs.search.blur();
            },
            querySelections: function (searchText) {
                this.loading = true;
                SearchService.searchForAllOwnResources(searchText).then((results) => {
                    this.items = results;
                    this.loading = false;
                });
            },
            createCenterVertex: function () {
                AppController.createVertex(null, this.searchText).then(() => {
                    this.$refs.search.reset();
                    this.$refs.search.blur();
                })
            }
        }
    }
</script>

<style>
    .search-menu .v-list__item {
        height: auto;
        min-height: 48px;
        max-height: 105px;
    }

    .top-search {
        position: fixed;
    }

    .top-search-desktop {
        left: 32% !important;
    }

</style>