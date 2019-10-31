<template>
    <v-card flat>
        <v-card-text class="pt-0 pb-0">
            <v-autocomplete
                    ref="mergeSearch"
                    v-model="selectedSearchResult"
                    attach="#mergeMenu"
                    :items="items"
                    :search-input.sync="search"
                    item-value="uri"
                    item-text="label"
                    return-object
                    :menu-props="menuProps"
                    :loading="loading"
                    @change="selectSearchResult()"
                    cache-items
                    hide-no-data
                    clearable
                    :placeholder="$t('merge:placeholder')"
                    :filter="filter"
                    @focus="$emit('focus')"
                    @blur="$emit('blur')"
            >
                <template v-slot:item="{ item }">
                    <SearchResultContent :item="item"></SearchResultContent>
                    <SearchResultAction :item="item"></SearchResultAction>
                </template>
                <SearchLoadMore slot="append-item" @loadMore="loadMore" :noCreateButton="true"
                                ref="mergeLoadMore"></SearchLoadMore>
            </v-autocomplete>
        </v-card-text>
        <v-card flat class="pt-0">
            <v-card-text class="pt-0" id="mergeMenu"></v-card-text>
        </v-card>
        <!--        <v-card-title class="subheading grey&#45;&#45;text">-->
        <!--            {{$t('merge:instruction')}}-->
        <!--        </v-card-title>-->
    </v-card>
</template>

<script>
    import I18n from '@/I18n'
    import SearchService from '@/search/SearchService'
    import SearchLoadMore from '@/components/search/SearchLoadMore'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import Breakpoint from "@/Breakpoint";

    export default {
        name: "MergeMenu",
        props: ['bubble'],
        components: {
            SearchLoadMore,
            SearchResultContent,
            SearchResultAction
        },
        data: function () {
            I18n.i18next.addResources("en", "merge", {
                "instruction": "This bubble will be removed but all its relationships will move to be added to bubble you will have selected in the search bar below.",
                'placeholder': "Merge with"
            });
            I18n.i18next.addResources("fr", "merge", {
                "instruction": "Cette bulle s'effacera mais toutes ses relations vont se déplacer pour s'ajouter à la bulle que vous aurez sélectionnée dans la barre de recherche ci-bas.",
                'placeholder': "Fusionner avec"
            });
            return {
                loading: false,
                selectedSearchResult: null,
                search: null,
                items: [],
                menuProps: {
                    "contentClass": 'side-search-menu search-menu'
                }
            }
        },
        watch: {
            search: function (val) {
                val && val !== this.select && this.querySelections(val)
            }
        },
        methods: {
            querySelections(term) {
                this.loading = true;
                SearchService.ownVertices(term).then((results) => {
                    this.items = results;
                    this.loading = false;
                    this.$nextTick(()=>{
                        this.$refs.mergeLoadMore.reset(results.length, term);
                    });
                });
            },
            loadMore: function (callback) {
                SearchService.ownVertices(this.search, this.items.length).then((results) => {
                    this.items = results;
                    callback(results.length);
                });
            },
            selectSearchResult: function () {
                this.bubble.controller().convertToDistantBubbleWithUri(
                    this.selectedSearchResult.uri
                );
                this.$refs.mergeSearch.reset();
                if (Breakpoint.isMobile()) {
                    this.$store.dispatch("setSideMenuFlow", false);
                }
            },
            filter: function (item, searchText, itemText) {
                if (!this.bubble.controller().convertToDistantBubbleWithUriCanDo(item.uri)) {
                    return false;
                }
                return itemText.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
            }
        }
    }

</script>

<style scoped>

</style>