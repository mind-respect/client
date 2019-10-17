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
                        :items="items"
                        item-value="uri"
                        item-text="label"
                        :menu-props="menuProps"
                        :placeholder="$t('existing:title')"
                        @change="chooseItem"
                        cache-items
                        return-object
                        light
                        :loading="loading"
                        flat
                        ref="existingBubbleAutocomplete"
                >
                    <template v-slot:item="{ item }">
                        <SearchResultContent :item="item"></SearchResultContent>
                        <SearchResultAction :item="item"></SearchResultAction>
                    </template>
                </v-autocomplete>
            </v-card-text>
            <v-card flat class="pt-0">
            </v-card>
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
    import SearchResultContent from '@/components/SearchResultContent'
    import SearchResultAction from '@/components/SearchResultAction'
    import IdUri from '@/IdUri'
    import Dragged from '@/Dragged'

    export default {
        name: "AddExistingBubbleDialog",
        components: {
            SearchResultContent,
            SearchResultAction
        },
        data: function () {
            I18n.i18next.addResources("en", "existing", {
                "title": "Your bubbles"
            });
            I18n.i18next.addResources("fr", "existing", {
                "title": "Vos bulles"
            });
            return {
                dialog: false,
                selectedSearchResult: null,
                searchText: null,
                items: [],
                menuProps: {
                    "offset-y": true,
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
                val && val !== this.select && this.querySelections(val)
            },
            dialog: function () {
                if (this.dialog) {
                    GraphUi.disableDragScroll();
                } else {
                    GraphUi.enableDragScroll();
                }
            }
        },
        computed: {
            center: function () {
                return CurrentSubGraph.get().center;
            },
            isFontFlow: function () {
                return this.$store.state.isFontFlow;
            }
        },
        methods: {
            enter: function (x, y, isLeft) {
                this.x = x;
                this.y = y;
                this.isLeft = isLeft;
                this.dialog = true;
                this.$nextTick(() => {
                    this.$refs.existingBubbleAutocomplete.reset();
                    this.$refs.existingBubbleAutocomplete.focus();
                });
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
                let currentSubGraph = CurrentSubGraph.get();
                SearchService.searchForAllOwnResources(searchText).then((results) => {
                    this.items = results.map((result) => {
                        result.disabled = currentSubGraph.hasUri(result.uri);
                        return result;
                    });
                    this.loading = false;
                });
            },
            chooseItem: function () {
                let closest = Dragged.getClosestChildEdge(
                    this.x,
                    this.y,
                    CurrentSubGraph.get().center,
                    this.isLeft
                );
                let forkToRelate = closest.edge ? CurrentSubGraph.get().center : closest.edge.getParentFork();
                forkToRelate.controller().relateToDistantVertexWithUri(
                    this.selectedSearchResult.uri,
                    closest.edge.getIndexInTree(closest.isAbove),
                    this.isLeft
                );
                this.dialog = false;
            }
        }
    }
</script>

<style>
</style>
