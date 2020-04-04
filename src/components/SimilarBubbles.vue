<template>
    <div>
        <v-bottom-navigation
                v-if="isSimilarBubblesNotice"
                class="text-center"
                fixed
                :value="0"
        >
            <v-btn
                    color="secondary"
                    text
                    large
                    @click="hasConfirmToEnterFlow = true"
            >
                {{$t('cohesion:similarBubble')}}
                <v-icon>expand_less</v-icon>
            </v-btn>
        </v-bottom-navigation>
        <v-bottom-sheet
                v-model="hasConfirmToEnterFlow"
                multi-line
                :timeout="0"
                color="white"
                class="cohesive-snackbar"
                style="opacity:0.9"
                hide-overlay
                :scrollable="!loading"
        >
            <v-card>
                <v-card v-show="loading" flat class="vh-center" width="100%" style="height:200px;">
                    <v-progress-circular indeterminate color="third" size="50"></v-progress-circular>
                </v-card>
                <v-card v-show="!loading">
                    <v-card-title>
                        <v-spacer></v-spacer>
                        <v-btn text class="font-weight-bold" @click="hasConfirmToEnterFlow = false" small
                               color="secondary">
                            {{$t('cohesion:similarBubble')}}
                            <v-icon class="ml-2">expand_more</v-icon>
                        </v-btn>
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-card-text style="height: 200px;" id="cohesion-scroll-container">
                        <v-radio-group v-model="selectedUri" class="mt-0 cohesion-radio-group">
                            <v-layout wrap>
                                <v-flex xs12 md3
                                        v-for="(item, index) in results"
                                >
                                    <v-list two-line>
                                        <v-list-item>
                                            <v-list-item-action>
                                                <v-radio
                                                        :value="item.uri"
                                                        :key="index" color="primary"
                                                        on-icon="radio_button_checked"
                                                        off-icon="radio_button_unchecked"
                                                ></v-radio>
                                            </v-list-item-action>
                                            <v-list-item-content class="">
                                                <SearchResultContent :item="item" class="mr-2"></SearchResultContent>
                                            </v-list-item-content>
                                            <SearchResultAction :item="item"></SearchResultAction>
                                            <v-list-item-action>
                                                <v-btn icon :href="urlFromUri(item.uri)" target="_blank">
                                                    <v-icon color="secondary">open_in_new</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-list>
                                </v-flex>
                                <v-flex xs12
                                        md3
                                        class="vh-center"
                                        v-show="showLoadMore"
                                >
                                    <v-btn color="secondary" text @click="loadMore()">
                                        ... {{$t('moreResults')}}
                                    </v-btn>
                                </v-flex>
                            </v-layout>
                        </v-radio-group>
                    </v-card-text>
                    <v-card-actions class="vh-center">
                        <v-btn color="secondary" class="ma-0 mr-8" @click="tag"
                               :disabled="!addTagCanDo">
                            <v-icon class="mr-2">
                                label
                            </v-icon>
                            {{$t('cohesion:tag')}}
                        </v-btn>
                        <v-btn color="secondary" class="ma-0 ml-8" :disabled="!mergeCanDo"
                               @click="merge">
                            <v-icon class="mr-2">
                                merge_type
                            </v-icon>
                            {{$t('cohesion:merge')}}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-card>
        </v-bottom-sheet>
    </div>
</template>

<script>
    import SearchService from '@/search/SearchService'
    import Selection from '@/Selection'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import I18n from '@/I18n'
    import Tag from '@/tag/Tag'
    import IdUri from '@/IdUri'

    const cacheByUri = {};

    export default {
        name: "SimilarBubbles",
        components: {
            SearchResultContent,
            SearchResultAction
        },
        data: function () {
            return {
                isSimilarBubblesNotice: false,
                hasConfirmToEnterFlow: false,
                loading: false,
                selectedUri: null,
                results: [],
                showLoadMore: true,
                working: false,
                nbLoadResults: 0
            }
        },
        mounted: function () {
            I18n.i18next.addResources("en", "cohesion", {
                similarBubble: "Similar bubble",
                merge: "Merge",
                tag: "Tag",
                viewMore: "View more"
            });

            I18n.i18next.addResources("fr", "cohesion", {
                similarBubble: "Bulles similaires",
                merge: "Fusionner",
                tag: "Étiquetter",
                viewMore: "Voir plus"
            });
        },
        computed: {
            selected: function () {
                return this.$store.state.selected;
            },
            mergeCanDo: function () {
                let single = Selection.getSingle();
                if (single == undefined) {
                    return false;
                }
                let controller = Selection.getSingle().controller();
                return controller.mergeCanDo() &&
                    this.selectedUri && controller.convertToDistantBubbleWithUriCanDo(this.selectedUri);
            },
            addTagCanDo: function () {
                let single = Selection.getSingle();
                return single !== undefined && single.controller().addIdentificationCanDo();
            },
            similarBubblesRefresh: function () {
                return this.$store.state.similarBubblesRefresh;
            }
        },
        watch: {
            selected: function () {
                this.hasConfirmToEnterFlow = false;
                this.isSimilarBubblesNotice = false;
                if (Selection.isSingle()) {
                    this.restoreCache();
                }
            },
            similarBubblesRefresh: function () {
                this.tryRefresh();
            }
        },
        methods: {
            leaveFlow: function () {
                this.hasConfirmToEnterFlow = false;
                this.isSimilarBubblesNotice = false;
            },
            merge: function () {
                this.leaveFlow();
                this.$store.dispatch("setIsMergeFlow", this.getSelectedResult());
            },
            tag: function () {
                this.loading = true;
                const selectedResult = this.getSelectedResult();
                const tag = Tag.fromSearchResult(
                    selectedResult
                );
                let bubble = Selection.getSingle();
                if (bubble.hasIdentification(tag)) {
                    this.loading = false;
                    this.leaveFlow();
                    return false;
                }
                tag.makeGeneric();
                selectedResult.getImageUrl(selectedResult).then((imageUrl) => {
                    if (imageUrl) {
                        tag.addImage(imageUrl);
                    }
                    return bubble.controller().addIdentification(
                        tag
                    );
                }).then(() => {
                    this.$store.dispatch("tagRefresh");
                    return this.$nextTick();
                }).then(() => {
                    this.loading = false;
                    this.leaveFlow();
                    this.$store.dispatch("redraw");
                })
            },
            urlFromUri: function (uri) {
                return IdUri.absoluteUrlForBubbleUri(
                    uri
                )
            },
            tryRefresh: function () {
                if (!this.$store.state.isEditFlow && this.$store.state.selected.length === 1 && !this.working) {
                    let selectedId = this.$store.state.selected[0].id;
                    this.$nextTick(() => {
                        setTimeout(() => {
                            if (!this.$store.state.isEditFlow && this.$store.state.selected.length === 1 && this.$store.state.selected[0].id === selectedId && !this.working) {
                                this.refresh();
                            }
                        }, 250)
                    });
                }
            },
            refresh: function () {
                this.leaveFlow();
                this.loading = false;
                this.showLoadMore = true;
                this.nbLoadResults = 0;
                this.results = [];
                if (this.$store.state.selected.length !== 1) {
                    return;
                }
                if (!this.mergeCanDo && !this.addTagCanDo) {
                    return;
                }
                this.loadMore();
            },
            loadMore: function () {
                let bubble = Selection.getSingle();
                if (!bubble || bubble.loading || bubble.getLabel() === "") {
                    return;
                }
                SearchService.searchForAllOwnResources(
                    bubble.getLabel(),
                    this.nbLoadResults * 10,
                    true
                ).then((results) => {
                    if (results.length < 10) {
                        this.showLoadMore = false;
                    }
                    results = results.filter((result) => {
                        let filter = bubble.getUri() !== result.uri && !bubble.hasTagRelatedToUri(result.uri);
                        if (result.original.graphElement && result.original.graphElement.hasTagRelatedToUri) {
                            filter = filter && !result.original.graphElement.hasTagRelatedToUri(
                                bubble.getUri()
                            )
                        }
                        return filter;
                    });
                    if (results.length === 0) {
                        return;
                    }
                    if (this.nbLoadResults === 0) {
                        let hasOneRelevantResult = results.some((result) => {
                            return result.label.toLowerCase().trim() === bubble.getLabel().toLowerCase().trim()
                        });
                        if (!hasOneRelevantResult) {
                            return;
                        }
                        this.selectedUri = results[0].uri;
                    }
                    this.results = this.results.concat(results);
                    this.isSimilarBubblesNotice = true;
                    if (this.nbLoadResults === 0) {
                        this.$nextTick(() => {
                            const scrollContainer = document.getElementById("cohesion-scroll-container");
                            if (scrollContainer) {
                                scrollContainer.scrollTop = 0;
                            }
                        });
                    }
                    this.nbLoadResults++;
                    this.saveInCache(bubble);
                });
            },
            getSelectedResult: function () {
                return this.results.filter((result) => {
                    return result.uri === this.selectedUri;
                })[0];
            },
            saveInCache: function (bubble) {
                cacheByUri[bubble.getUri()] = {
                    label: bubble.getLabel(),
                    nbLoadResults: this.nbLoadResults,
                    results: this.results,
                    showLoadMore: this.showLoadMore,
                    selectedUri: this.selectedUri
                };
            },
            restoreCache: function () {
                let selected = Selection.getSingle();
                if (!selected) {
                    return;
                }
                const cache = cacheByUri[selected.getUri()];
                if (!cache || cache.label !== selected.getLabel()) {
                    return;
                }
                this.nbLoadResults = cache.nbLoadResults;
                this.results = cache.results;
                this.showLoadMore = cache.showLoadMore;
                this.selectedUri = cache.selectedUri;
                this.isSimilarBubblesNotice = true;
            }
        }
    }
</script>

<style>
    .cohesive-snackbar .v-list-item__content {
        padding: 0;
    }

    .cohesive-snackbar .v-subheader {
        height: auto;
    }

    .cohesive-snackbar .v-list-item {
        min-height: inherit;
    }

    .cohesion-radio-group.v-input--radio-group, .cohesion-radio-group .v-input--radio-group__input, .cohesion-radio-group .v-input__control {
        width: 100%;
    }
</style>