<template>
    <v-dialog v-model="dialog" v-if="dialog" width="900" top>
        <v-card>
            <v-card-title>
                {{bubble.getLabel()}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >
                    close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0 pb-0">
                <v-autocomplete
                        ref="mergeSearch"
                        v-model="selectedSearchResult"
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
                        @focus="focus"
                        @blur="$emit('blur')"
                        :disabled="!bubble"
                >
                    <template v-slot:item="{ item }">
                        <SearchResultContent :item="item"></SearchResultContent>
                        <SearchResultAction :item="item"></SearchResultAction>
                    </template>
                    <SearchLoadMore slot="append-item" @loadMore="loadMore" :noCreateButton="true"
                                    ref="mergeLoadMore"></SearchLoadMore>
                </v-autocomplete>
                <div style="height:150px;" class="vh-center">
                    <!--                    <v-progress-circular-->
                    <!--                            :size="70"-->
                    <!--                            :width="3"-->
                    <!--                            color="third"-->
                    <!--                            indeterminate-->
                    <!--                            v-show="tagLoading"-->
                    <!--                    ></v-progress-circular>-->
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import I18n from '@/I18n'
    import SearchService from '@/search/SearchService'
    import SearchLoadMore from '@/components/search/SearchLoadMore'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import Breakpoint from "@/Breakpoint";
    import Selection from "@/Selection"

    export default {
        name: "MergeMenu",
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
                    "contentClass": 'search-menu merge-dialog-menu'
                },
                dialog: false
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsMergeFlow", false);
        },
        computed: {
            isMergeFlow: function () {
                return this.$store.state.isMergeFlow;
            },
            bubble: function () {
                return Selection.getSingle();
            }
        },
        watch: {
            search: function (val) {
                this.setMenuPosition();
                val && val !== this.select && this.querySelections(val)
            },
            isMergeFlow: function () {
                if (this.$store.state.isMergeFlow) {
                    this.dialog = true;
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.$refs.mergeSearch.$el.querySelector("input").focus();
                        }, 100)
                    });
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsMergeFlow", false)
                }
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
            querySelections(term) {
                this.loading = true;
                let searchFunction = this.bubble.isMeta() ? SearchService.ownTagsOnly : SearchService.ownVertices;
                searchFunction(term).then((results) => {
                    this.items = results.map((result) => {
                        result.disabled = this.bubble.getUri() === result.uri;
                        return result;
                    });
                    this.loading = false;
                    if (this.$refs.mergeLoadMore) {
                        this.$refs.mergeLoadMore.reset(results.length, term);
                    }
                });
            },
            loadMore: function (callback) {
                let searchFunction = this.bubble.isMeta() ? SearchService.ownTagsOnly : SearchService.ownVertices;
                searchFunction(this.search, this.items.length).then((results) => {
                    this.items = this.items.concat(results.map((result) => {
                            result.disabled = this.bubble.getUri() === result.uri;
                            return result;
                        })
                    );
                    this.$nextTick(() => {
                        callback(results.length, this.$refs.mergeSearch);
                    });
                });
            },
            selectSearchResult: function () {
                this.bubble.controller().convertToDistantBubbleWithUri(
                    this.selectedSearchResult.uri
                );
                this.$refs.mergeSearch.reset();
                this.$refs.mergeSearch.blur();
            },
            filter: function (item, searchText, itemText) {
                if (!this.bubble.controller().convertToDistantBubbleWithUriCanDo(item.uri)) {
                    return false;
                }
                return itemText.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
            },
            setMenuPosition: function () {
                const menu = document.getElementsByClassName('merge-dialog-menu')[0];
                if (!menu) {
                    return;
                }
                const autocompleteRect = this.$refs.mergeSearch.$el.getBoundingClientRect();
                menu.style.left = autocompleteRect.x + "px";
                menu.style.top = (autocompleteRect.y + autocompleteRect.height) + "px";
            }
        }
    }

</script>

<style scoped>

</style>