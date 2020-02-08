<template>
    <v-bottom-sheet v-model="dialog" inset max-width="600" top v-if="bubble" scrollable>
        <v-card>
            <v-card-title>
                {{$t('merge:title')}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >
                    close
                </v-icon>
            </v-card-title>
            <v-card-text>
                <v-card-text v-if="false">
                    <v-card>
                        <v-list-item three-line>
                            <v-list-item-content>
                                <v-list-item-title class="subtitle-1 mb-1">
                                    {{bubble.getLabel()}}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-card>
                </v-card-text>
                <v-card-text>
                    <v-card>
                        <v-card-text>
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
                                    :label="$t('merge:placeholder')"
                                    :filter="filter"
                                    @focus="focus"
                                    @blur="$emit('blur')"
                                    :disabled="!bubble"
                            >
                                <template v-slot:item="{ item }">
                                    <SearchResultContent :item="item"></SearchResultContent>
                                    <SearchResultAction :item="item"></SearchResultAction>
                                </template>
                                <SearchLoadMore slot="append-item" @loadMore="loadMore"
                                                ref="mergeLoadMore"></SearchLoadMore>
                            </v-autocomplete>
                        </v-card-text>
                    </v-card>
                </v-card-text>
                <v-card-text>
                    <v-card>
                        <v-card-title class="subtitle-1" :class="{
                        'grey--text': mergeBubble === null
                    }">
                            {{$t('merge:result')}}
                        </v-card-title>
                        <v-card-text v-if="mergeBubble">
                            <ListView :bubble="mergeBubble" :preventExpand="true" :collapse="true"></ListView>
                        </v-card-text>
                    </v-card>
                </v-card-text>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" @click="confirm()" :loading="confirmLoading" :disabled="!mergeBubble">
                    {{$t('confirm')}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="dialog=false">
                    {{$t('cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-bottom-sheet>
</template>

<script>
    import I18n from '@/I18n'
    import SearchService from '@/search/SearchService'
    import SearchLoadMore from '@/components/search/SearchLoadMore'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import Selection from "@/Selection"
    import TagVertex from '@/tag/TagVertex'
    import Vertex from "@/vertex/Vertex";
    import Edge from '@/edge/Edge'
    import KeyboardActions from '@/KeyboardActions'

    export default {
        name: "MergeMenu",
        components: {
            SearchLoadMore,
            SearchResultContent,
            SearchResultAction,
            ListView: () => import('@/components/ListView')
        },
        data: function () {
            I18n.i18next.addResources("en", "merge", {
                title: 'Merge',
                placeholder: "Merge with",
                result: "Result"
            });
            I18n.i18next.addResources("fr", "merge", {
                title: 'Fusion',
                placeholder: "Fusionner avec",
                result: "Résultat"
            });
            return {
                loading: false,
                selectedSearchResult: null,
                search: null,
                items: [],
                menuProps: {
                    "contentClass": 'search-menu merge-dialog-menu'
                },
                dialog: false,
                mergeBubble: null,
                confirmLoading: false
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
            },
            label: function () {
                return this.bubble.getLabel();
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
                    this.mergeBubble = null;
                    this.$nextTick(() => {
                        setTimeout(async () => {
                            this.$refs.mergeSearch.reset();
                            await this.$nextTick();
                            this.$refs.mergeSearch.$el.querySelector("input").focus();
                        }, 100)
                    });
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    KeyboardActions.enable();
                    this.$store.dispatch("setIsMergeFlow", false)
                } else {
                    KeyboardActions.disable();
                }
                if (this.$refs.mergeSearch) {
                    this.$refs.mergeSearch.blur();
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
                    if (term !== this.search) {
                        return;
                    }
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
                if (!this.selectedSearchResult) {
                    this.mergeBubble = null;
                    return;
                }
                let center = this.bubble.isMeta() ?
                    TagVertex.withUri(this.selectedSearchResult.uri) :
                    Vertex.withUri(this.selectedSearchResult.uri);
                center.controller().getSubGraphController().loadForParentIsAlreadyOnMap(true).then((mergeWith) => {
                    this.mergeBubble = mergeWith;
                    if (this.mergeBubble.getLabel().toLowerCase().trim() !== this.bubble.getLabel().toLowerCase().trim()) {
                        this.mergeBubble.setLabel(
                            this.bubble.getLabel() + " " + this.mergeBubble.getLabel()
                        );
                    }
                    let parentEdge = this.bubble.getParentBubble();
                    let parentVertex = this.bubble.getParentVertex();
                    let parentVertexCopy = Vertex.withUri(
                        parentVertex.getUri()
                    );
                    parentVertexCopy.setLabel(parentVertex.getLabel());
                    let edge = Edge.withUriAndSourceAndDestinationVertex(
                        parentEdge.getUri(),
                        this.mergeBubble,
                        parentVertexCopy
                    );
                    edge.parentBubble = edge.parentVertex = this.mergeBubble;
                    this.mergeBubble.addChild(edge);
                    this.bubble.getNextChildren().forEach((child) => {
                        if (child.isEdge()) {
                            let vertex = child.getOtherVertex(this.bubble);
                            let vertexCopy = Vertex.withUri(
                                vertex.getUri()
                            );
                            vertexCopy.setLabel(vertex.getLabel());
                            child = Edge.withUriAndSourceAndDestinationVertex(
                                child.getUri(),
                                this.mergeBubble,
                                vertexCopy
                            );
                        }
                        this.mergeBubble.addChild(
                            child
                        );
                    });
                });
            },
            confirm: function () {
                this.confirmLoading = true;
                this.bubble.controller().convertToDistantBubbleWithUri(
                    this.mergeBubble.getUri()
                ).then(() => {
                    this.dialog = false;
                    this.$refs.mergeSearch.blur();
                    this.confirmLoading = false;
                });
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