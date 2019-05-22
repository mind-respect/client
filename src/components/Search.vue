<template>
    <!--    <div>-->
    <!--        <v-btn fab icon v-if="!isFocusFLow" @click="isFocusFLow = true">-->
    <!--            search-->
    <!--        </v-btn>-->
    <v-autocomplete
            v-if="$store.state.user"
            ref="search"
            prepend-icon="search"
            v-model="selectedSearchResult"
            :items="items"
            item-text="label"
            :search-input.sync="searchText"
            return-object
            light
            solo
            :loading="loading"
            flat
            cache-items
            attach="#mind_map"
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
        <v-list-tile slot="no-data" @click="createCenterVertex">
            <v-list-tile-content>
                <v-list-tile-title>
                    {{$t('noSearchResults')}}
                </v-list-tile-title>
                <v-list-tile-sub-title class="">
                    {{$t('create')}} "{{searchText}}"
                </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <v-icon>
                    add
                </v-icon>
            </v-list-tile-action>
        </v-list-tile>
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
                items: [],
                menuProps: {
                    "nudge-left": 50
                },
                readyToDisplay: false,
                isFocusFLow: false
            };
        },
        watch: {
            searchText: function (val) {
                val && val !== this.select && this.querySelections(val)
            }
        },
        methods: {
            focus:()=>{
                GraphUi.disableDragScroll();
            },
            blur:()=>{
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

<style></style>