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
            height="43">
        <template v-slot:item="{ item }">
            <SearchResultContent :item="item"></SearchResultContent>
            <SearchResultAction :item="item"></SearchResultAction>
        </template>
        <div slot="no-data">
            <h3 class="subheading font-italic">
                {{$t('noSearchResults')}}
            </h3>
            <v-btn class="ml-0" color="secondary" @click="createCenterVertex">
                <v-icon class="mr-2">add</v-icon>
                {{searchText}}
            </v-btn>
        </div>
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
                AppController.createVertex(this.searchText).then(() => {
                    this.$refs.search.reset();
                    this.$refs.search.blur();
                })
            }
        }
    }
</script>

<style></style>