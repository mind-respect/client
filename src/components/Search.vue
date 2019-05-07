<template>
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
            hide-no-data
            cache-items
            attach="#mind_map"
            :placeholder="$t('search:placeholder')"
            @change="selectSearchResult()"
            :menuProps="menuProps"
            clearable
            height="43">
        <template v-slot:item="{ item }">
            <SearchResultContent :item="item"></SearchResultContent>
            <SearchResultAction :item="item"></SearchResultAction>
        </template>
    </v-autocomplete>
</template>

<script>
    import SearchResultContent from '@/components/SearchResultContent'
    import SearchResultAction from '@/components/SearchResultAction'
    import I18n from '@/I18n'
    import SearchService from '@/search/SearchService'
    import SubGraph from '@/graph/SubGraph'
    import IdUri from '@/IdUri'

    export default {
        name: "Search",
        components: {
            SearchResultContent,
            SearchResultAction
        },
        data: () => {
            I18n.i18next.addResources("en", "search", {
                "placeholder": "Search your bubbles"
            });
            I18n.i18next.addResources("fr", "search", {
                "placeholder": "Recherchez vos bulles"
            });
            return {
                selectedSearchResult: null,
                searchText: null,
                loading: false,
                items: [],
                menuProps: {
                    "nudge-left": 50
                },
                readyToDisplay: false
            };
        },
        watch: {
            searchText: function (val) {
                val && val !== this.select && this.querySelections(val)
            }
        },
        methods: {
            selectSearchResult: function () {
                this.$router.push(
                    IdUri.htmlUrlForBubbleUri(
                        this.selectedSearchResult.uri
                    )
                );
                this.$refs.search.reset();
            },
            querySelections: function (searchText) {
                this.loading = true;
                SearchService.searchForAllOwnResources(searchText).then((results) => {
                    this.items = results;
                    this.loading = false;
                });
            }
        }
    }
</script>

<style></style>