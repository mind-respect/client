<template>
    <v-bottom-sheet v-model="dialog" inset max-width="600" top v-if="dialog" scrollable>
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
                <v-list class="pl-0 pr-0">
                    <v-list-item>
                        <v-card-actions>
                            <v-icon>
                                looks_one
                            </v-icon>
                        </v-card-actions>
                        <SearchResultContent :item="bubbleAsSearchResult"></SearchResultContent>
                    </v-list-item>
                    <v-list-item>
                        <v-card-actions>
                            <v-icon>
                                looks_two
                            </v-icon>
                        </v-card-actions>
                        <SearchResultContent :item="mergeBubbleAsSearchResult"
                                             v-if="mergeBubble"></SearchResultContent>
                        <v-list-item-content v-show="!mergeBubble">
                            <v-autocomplete
                                    ref="mergeSearch"
                                    v-model="selectedSearchResult"
                                    :items="searchItems"
                                    :search-input.sync="search"
                                    item-value="uri"
                                    item-text="label"
                                    return-object
                                    :menu-props="menuProps"
                                    :loading="loading"
                                    @change="selectSearchResult()"
                                    cache-items
                                    :no-data-text="$t('noSearchResults')"
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
                        </v-list-item-content>
                        <v-card-actions v-if="mergeBubble !== null">
                            <v-btn icon @click="cancelMergeBubble">
                                <v-icon>close</v-icon>
                            </v-btn>
                        </v-card-actions>
                    </v-list-item>
                </v-list>
                <v-card>
                    <v-card-title class="subtitle-1" :class="{
                        'grey--text': mergeBubble === null
                    }">
                        {{$t('merge:result')}}
                    </v-card-title>
                    <v-card-text class="pt-0 pb-0">
                        <v-card flat class="pt-0">
                            <v-card-title class="subtitle-1">
                                {{$t('merge:urlKept')}}
                            </v-card-title>
                            <v-card-text class="pt-0 pb-0">
                                <v-radio-group v-model="keptUri" class="pa-0 mt-0"
                                               :disabled="mergeBubble === null">
                                    <v-radio
                                            :label="bubble.uri().getGraphElementShortId()"
                                            :value="bubble.getUri()"
                                            color="third"
                                            on-icon="looks_one" off-icon="looks_one"
                                    ></v-radio>
                                    <v-radio
                                            :label="mergeBubble.uri().getGraphElementShortId()"
                                            :value="mergeBubble.getUri()"
                                            color="third" v-if="mergeBubble"
                                            on-icon="looks_two" off-icon="looks_two"
                                    ></v-radio>
                                </v-radio-group>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                    <v-card-text class="pt-0 pb-0">
                        <v-card flat class="pt-0 pb-0">
                            <v-card-title class="subtitle-1 pt-0 grey--text" v-if="isSameColor">
                                {{$t('merge:sameColor')}}
                            </v-card-title>
                            <v-card-title class="subtitle-1 pt-0" v-if="!isSameColor">
                                {{$t('merge:color')}}
                            </v-card-title>
                            <v-card-text class="pt-0 pb-0" v-if="!isSameColor">
                                <v-radio-group v-model="keptColor" class="pa-0 mt-0"
                                               :disabled="mergeBubble === null">
                                    <v-radio
                                            :value="bubble.getBackgroundColor()"
                                            color="third"
                                            on-icon="looks_one" off-icon="looks_one"
                                    >
                                        <template v-slot:label>
                                            <v-badge v-if="bubble.isBackgroundColorDefined()"
                                                     :color="bubble.getChipBackgroundColor(false)"
                                                     inline
                                                     left>
                                                <template v-slot:badge>
                                                </template>
                                            </v-badge>
                                            <span v-else>
                                                {{$t('merge:colorDefault')}}
                                            </span>
                                        </template>
                                    </v-radio>
                                    <v-radio
                                            :value="mergeBubble.getBackgroundColor()"
                                            color="third" v-if="mergeBubble"
                                            on-icon="looks_two" off-icon="looks_two"
                                    >
                                        <template v-slot:label>
                                            <v-badge v-if="mergeBubble.isBackgroundColorDefined()"
                                                     :color="mergeBubble.getChipBackgroundColor(false)"
                                                     inline
                                                     left>
                                                <template v-slot:badge>
                                                </template>
                                            </v-badge>
                                            <span v-else>
                                            {{$t('merge:colorDefault')}}
                                        </span>
                                        </template>
                                    </v-radio>
                                </v-radio-group>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                    <v-card-text class="pt-0" v-if="mergeBubble">
                        <v-card flat class="pt-0">
                            <v-card-title class="subtitle-1 pb-0 pt-0">
                                {{$t('merge:textAndRelation')}}
                            </v-card-title>
                            <ListView :bubble="mergeBubble" :preventExpand="true" :collapse="true"
                                      :showTags="true"
                            ></ListView>
                        </v-card>
                    </v-card-text>
                </v-card>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" @click="confirm()" :loading="confirmLoading" :disabled="!mergeBubble">
                    {{$t('merge:confirm')}}
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
    import Relation from '@/relation/Relation'
    import KeyboardActions from '@/KeyboardActions'
    import CurrentSubGraph from "../graph/CurrentSubGraph";

    let searchTimeout;

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
                title: 'Merge with another bubble',
                placeholder: "Merge with",
                result: "Merge result",
                resultShort: "Result",
                tree: "Tree",
                urlKept: "URL kept",
                color: "Color kept",
                sameColor: "same color",
                textAndRelation: "Text and relations",
                colorDefault: "Default color",
                confirm: 'Merge'
            });
            I18n.i18next.addResources("fr", "merge", {
                title: 'Fusionner avec une autre bulle',
                placeholder: "Fusionner avec",
                result: "Résultat de la fusion",
                resultShort: "Résultat",
                tree: "Arbre",
                urlKept: "URL conservée",
                color: "Couleur conservée",
                sameColor: "même couleur",
                textAndRelation: "Texte et relations",
                colorDefault: "Couleur par défaut",
                confirm: 'Fusionner'
            });
            return {
                bubble: null,
                loading: false,
                selectedSearchResult: null,
                search: null,
                searchItems: [],
                menuProps: {
                    "contentClass": 'search-menu merge-dialog-menu'
                },
                dialog: false,
                originalMergeBubbleLabel: null,
                mergeBubble: null,
                confirmLoading: false,
                keptUri: null,
                keptColor: null,
                bubbleAsSearchResult: null,
                mergeBubbleAsSearchResult: null,
                isSameColor: false
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsMergeFlow", false);
        },
        computed: {
            isMergeFlow: function () {
                return this.$store.state.isMergeFlow;
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
            isMergeFlow: async function () {
                if (this.$store.state.isMergeFlow) {
                    this.bubble = Selection.getSingle();
                    this.bubbleAsSearchResult = SearchService.searchResultFromOnMapGraphElement(
                        this.bubble
                    );
                    if (this.bubble.canExpand()) {
                        await this.bubble.controller().expand(true, true, true);
                    }
                    this.dialog = true;
                    this.mergeBubble = null;
                    this.confirmLoading = false;
                    this.keptUri = this.bubble.getUri();
                    this.keptColor = this.bubble.getBackgroundColor();
                    if (this.$store.state.isMergeFlow === true) {
                        await this.$nextTick();
                        setTimeout(async () => {
                            this.search = "";
                            this.$refs.mergeSearch.reset();
                            await this.$nextTick();
                            this.$refs.mergeSearch.$el.querySelector("input").focus();
                        }, 100)
                    } else {
                        this.selectedSearchResult = this.$store.state.isMergeFlow;
                        this.selectSearchResult();
                    }
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
            cancelMergeBubble: function () {
                this.mergeBubble = null;
                this.search = "";
                this.$refs.mergeSearch.reset();
            },
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
            querySelectionsDebounced: function (searchText) {
                this.loading = true;
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(async () => {
                    await this.querySelections(searchText)
                    this.loading = false;
                }, 500);
            },
            async querySelections(term) {
                let searchFunction = this.bubble.isMeta() ? SearchService.ownTagsOnly : SearchService.ownVertices;
                const results = await searchFunction(term);
                this.searchItems = results.map((result) => {
                    result.disabled = this.bubble.getUri() === result.uri || (result.isMindRespect && result.original.getGraphElement().isPattern());
                    return result;
                });
                if (this.$refs.mergeLoadMore) {
                    this.$refs.mergeLoadMore.reset(results.length, term);
                }
            },
            loadMore: function (callback) {
                let searchFunction = this.bubble.isMeta() ? SearchService.ownTagsOnly : SearchService.ownVertices;
                searchFunction(this.search, this.searchItems.length).then((results) => {
                    this.searchItems = this.searchItems.concat(results.map((result) => {
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
                    if (!this.bubble.isCenter) {
                        let parentEdge = this.bubble.getParentBubble();
                        let parentVertex = this.bubble.getParentVertex();
                        let parentVertexCopy = Vertex.withUri(
                            parentVertex.getUri()
                        );
                        parentVertexCopy.setLabel(parentVertex.getLabel());
                        let edge = Relation.withUriAndSourceAndDestinationVertex(
                            parentEdge.getUri(),
                            this.mergeBubble,
                            parentVertexCopy
                        );
                        edge.parentBubble = edge.parentVertex = this.mergeBubble;
                        this.mergeBubble.addChild(edge);
                    }
                    this.bubble.getNextChildren().forEach((child) => {
                        if (child.isEdge()) {
                            let vertex = child.getOtherVertex(this.bubble);
                            let vertexCopy = Vertex.withUri(
                                vertex.getUri()
                            );
                            vertexCopy.setLabel(vertex.getLabel());
                            vertexCopy.addIdentifications(vertex.getIdentifiers());
                            child = Relation.withUriAndSourceAndDestinationVertex(
                                child.getUri(),
                                this.mergeBubble,
                                vertexCopy
                            );
                        }
                        this.mergeBubble.addChild(
                            child
                        );
                    });
                    this.mergeBubbleAsSearchResult = SearchService.searchResultFromOnMapGraphElement(
                        this.mergeBubble
                    );
                    this.originalMergeBubbleLabel = this.mergeBubble.getLabel();
                    if (this.mergeBubble.getLabel().toLowerCase().trim() !== this.bubble.getLabel().toLowerCase().trim()) {
                        this.mergeBubble.cloneOwnServerFormat();
                        this.mergeBubble.setLabel(
                            this.bubble.getLabel() + " " + this.mergeBubble.getLabel()
                        );
                    }
                    this.isSameColor = this.bubble.getBackgroundColor() === this.mergeBubble.getBackgroundColor();
                });
            },
            confirm: async function () {
                this.confirmLoading = true;
                let keptBubble;
                let removedBubble;
                let bubbleToReplace;
                this.mergeBubble.setLabel(this.originalMergeBubbleLabel);
                if (this.keptUri === this.bubble.getUri()) {
                    removedBubble = this.mergeBubble;
                    bubbleToReplace = keptBubble = this.bubble;
                } else {
                    removedBubble = this.bubble;
                    keptBubble = this.mergeBubble;
                }
                const response = await removedBubble.controller().convertToDistantBubbleWithUri(
                    keptBubble.getUri(),
                    bubbleToReplace,
                    this.keptColor
                );
                if (response === 'isRefreshing') {
                    return;
                }
                this.dialog = false;
                this.$refs.mergeSearch.blur();
                this.confirmLoading = false;

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