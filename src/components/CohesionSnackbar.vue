<template>
    <v-snackbar
            v-model="snackbar"
            multi-line
            :timeout="0"
            color="white"
            class="cohesive-snackbar"
            bottom
            style="opacity:0.85"
    >
        <v-layout>
            <v-flex xs12>
                <v-layout>
                    <v-flex xs12>
                        <v-card v-if="loading" flat class="text-center" width="100%">
                            <v-progress-circular indeterminate color="third"></v-progress-circular>
                        </v-card>
                        <v-card flat v-if="!loading">
                            <v-card-title>
                                <span class="mt-2 mb-2 subtitle-1">
                                    {{$t('cohesion:similarBubble')}}
                                </span>
                                <v-spacer></v-spacer>
                                <v-btn small text color="secondary" class="ma-0 pa-1" :disabled="!mergeCanDo"
                                       @click="merge">
                                    <v-icon class="mr-2">
                                        merge_type
                                    </v-icon>
                                    {{$t('cohesion:merge')}}
                                </v-btn>
                                <v-divider vertical class="ml-2 mr-2"></v-divider>
                                <v-btn small text color="secondary" class="ma-0 pa-1" @click="tag"
                                       :disabled="!addTagCanDo">
                                    <v-icon class="mr-2">
                                        label
                                    </v-icon>
                                    {{$t('cohesion:tag')}}
                                </v-btn>
                                <v-divider vertical class="ml-2 mr-2"></v-divider>
                                <v-badge
                                        color="third"
                                        @click="snackbar = false"
                                >
                                    <template v-slot:badge @click="snackbar=false">
                                        <v-icon dark @click="snackbar=false">
                                            close
                                        </v-icon>
                                    </template>
                                    <v-btn
                                            small
                                            color="third"
                                            text
                                            class="ma-0 pa-1"
                                            @click="snackbar=false"
                                    >
                                        {{$t('close')}}
                                    </v-btn>
                                </v-badge>
                            </v-card-title>
                        </v-card>
                    </v-flex>
                </v-layout>
                <v-layout>
                    <v-flex xs12>
                        <v-card flat class="pa-0" v-if="!loading">
                            <v-card-text class="pa-0">
                                <v-radio-group v-model="selectedUri" class="mt-0">
                                    <v-list width="100%" two-line class="pa-0">
                                        <v-list-item class="pt-0" v-for="(item, index) in results"
                                                     v-if="index === 0 || isSeeMoreFlow">
                                            <v-list-item-action>
                                                <v-radio
                                                        :value="item.uri"
                                                        :key="index" color="primary"
                                                        on-icon="radio_button_checked"
                                                        off-icon="radio_button_unchecked"
                                                ></v-radio>
                                            </v-list-item-action>
                                            <SearchResultContent :item="item"></SearchResultContent>
                                            <SearchResultAction :item="item"></SearchResultAction>
                                            <v-list-item-action>
                                                <v-btn icon :href="urlFromUri(item.uri)" target="_blank">
                                                    <v-icon color="secondary">open_in_new</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-list>
                                </v-radio-group>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
                <v-layout v-if="results.length > 1">
                    <v-flex xs12>
                        <v-btn text color="third" class="ml-1" @click="isSeeMoreFlow=true" :disabled="isSeeMoreFlow">
                            {{$t('cohesion:viewMore')}}
                        </v-btn>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-snackbar>
</template>

<script>
    import SearchService from '@/search/SearchService'
    import Selection from '@/Selection'
    import SearchResultContent from '@/components/SearchResultContent'
    import SearchResultAction from '@/components/SearchResultAction'
    import I18n from '@/I18n'
    import Identification from '@/identifier/Identification'
    import IdUri from '@/IdUri'

    export default {
        name: "CohesionSnackbar",
        components: {
            SearchResultContent,
            SearchResultAction
        },
        data: function () {
            return {
                snackbar: false,
                loading: false,
                firstResult: null,
                selectedUri: null,
                results: [],
                isSeeMoreFlow: false
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
                similarBubble: "Bulle similaire",
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
                if (!Selection.isSingle()) {
                    return false;
                }
                let controller = Selection.getSingle().controller();
                return controller.mergeCanDo() &&
                    this.selectedUri && controller.convertToDistantBubbleWithUriCanDo(this.selectedUri);
            },
            addTagCanDo: function () {
                return Selection.isSingle() && Selection.getSingle().controller().addIdentificationCanDo();
            },
            isEditFlow: function () {
                return this.$store.state.isEditFlow;
            }
        },
        watch: {
            selected: function () {
                this.refresh();
            },
            isEditFlow: async function () {
                if (!this.$store.state.isEditFlow) {
                    await this.$nextTick();
                    setTimeout(()=>{
                        this.refresh();
                    }, 100)
                }
            }
        },
        methods: {
            merge: async function () {
                this.loading = true;
                await Selection.getSingle().controller().convertToDistantBubbleWithUri(
                    this.firstResult.uri
                );
                await this.$nextTick();
                this.loading = false;
                this.snackbar = false;
            },
            tag: async function () {
                this.loading = true;
                let identifier = Identification.fromSearchResult(
                    this.firstResult
                );
                let bubble = Selection.getSingle();
                if (bubble.hasIdentification(identifier)) {
                    this.loading = false;
                    this.snackbar = false;
                    return false;
                }
                identifier.makeGeneric();
                let imageUrl = await this.firstResult.getImageUrl(this.firstResult);
                if (imageUrl) {
                    identifier.addImage(imageUrl);
                }
                await bubble.controller().addIdentification(
                    identifier
                );
                await this.$nextTick();
                this.$store.dispatch("redraw");
                this.loading = false;
                this.snackbar = false;
            },
            urlFromUri: function (uri) {
                return IdUri.absoluteUrlForBubbleUri(
                    uri
                )
            },
            refresh: async function () {
                this.snackbar = false;
                this.loading = false;
                this.isSeeMoreFlow = false;
                if (this.$store.state.selected.length !== 1) {
                    return;
                }
                if (!this.mergeCanDo && !this.addTagCanDo) {
                    return;
                }
                let bubble = Selection.getSingle();
                let results = await SearchService.searchForAllOwnResources(
                    bubble.getLabel()
                );
                results = results.filter((result) => {
                    return bubble.getUri() !== result.uri && !bubble.hasTagRelatedToUri(result.uri);
                }).sort((result) => {
                    return result.label.toLowerCase().trim() === bubble.getLabel().toLowerCase().trim();
                });
                if (results.length === 0) {
                    return;
                }
                this.firstResult = results[0];
                if (this.firstResult.label.toLowerCase().trim() !== bubble.getLabel().toLowerCase().trim()) {
                    return;
                }
                this.selectedUri = this.firstResult.uri;
                this.results = results;
                this.snackbar = true;
            }
        }
    }
</script>

<style>
    .cohesive-snackbar {
        z-index: 1;
    }

    .cohesive-snackbar .v-list-item__content {
        padding: 0;
    }

    .cohesive-snackbar .v-subheader {
        height: auto;
    }

    .cohesive-snackbar .v-list-item {
        min-height: inherit;
    }
</style>