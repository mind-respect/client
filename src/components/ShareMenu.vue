<template>
    <div>
        <v-card flat>
            <v-expansion-panels class="mt-4 mb-4">
                <v-expansion-panel class="text-left" expand-icon="link">
                    <v-expansion-panel-header class="font-weight-bold" expand-icon="link" disable-icon-rotate>
                        {{$t('share:copyLink')}}
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-list>
                            <v-list-item @click="copyCentralUrl">
                                <v-list-item-icon>
                                    <v-icon>
                                        filter_center_focus
                                    </v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{$t('share:centralBubble')}}
                                    </v-list-item-title>
                                    <transition name="fade-transition">
                                        <v-list-item-subtitle v-show="centralBubbleCopied" class="third-color">
                                            {{$t('share:linkCopied')}}
                                        </v-list-item-subtitle>
                                    </transition>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item @click="copySelectedBubble">
                                <v-list-item-icon>
                                    <v-icon>
                                        select_all
                                    </v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{$t('share:selectedBubble')}}
                                    </v-list-item-title>
                                    <transition name="fade-transition">
                                        <v-list-item-subtitle v-if="selectedBubbleCopied" class="third-color">
                                            {{$t('share:linkCopied')}}
                                        </v-list-item-subtitle>
                                    </transition>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            <v-card-title class="pt-1 pb-0 subtitle-1 vh-center font-weight-bold">
                {{$t('share:title')}}
            </v-card-title>
            <v-card flat class="pt-0 pb-0">
                <v-card-text class="pt-0 pb-0 mt-0 vh-center" id="shareMenu">
                    <ShareLevelSelection :shareLevel="shareLevel" @update="update"></ShareLevelSelection>
                </v-card-text>
            </v-card>
            <v-card-title class="pt-1 pb-0 subtitle-1 text-center grey--text" v-show="tagsByLatest.length">
                {{$t('share:tags')}}
            </v-card-title>
            <v-card-actions class="pt-0 pb-0 vh-center" v-show="tagsByLatest.length">
                <v-btn text :disabled="tagsByLatest.length === selectedTags.length" x-small
                       @click="selectAllTags">
                    {{$t('selectAll')}}
                </v-btn>
                <v-divider vertical></v-divider>
                <v-btn text :disabled="selectedTags.length === 0" x-small @click="selectedTags = []">
                    {{$t('deselectAll')}}
                </v-btn>
            </v-card-actions>
            <v-card-text class="pt-0">
                <v-list subheader three-line>
                    <v-list-item-group
                            v-model="selectedTags"
                            multiple
                    >
                        <v-list-item v-for="tag in tagsByLatest" :key="tag.externalResourceUri"
                                     class="mr-0 pr-0">
                            <template v-slot:default="{ active, toggle }">
                                <v-list-item-action class="">
                                    <v-checkbox
                                            v-model="active"
                                            color="primary"
                                            @click="toggle"
                                            class="mt-3"
                                    ></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content class="pt-0 mt-0">
                                    <v-list-item-title class="text-left mb-0">
                                        <v-badge class="pt-0 mt-0"
                                                 :color="tag.isBackgroundColorDefined() ? tag.getBackgroundColor() : 'grey'"
                                                 inline
                                                 left
                                        >
                                            <template v-slot:badge>
                                            <span
                                                    class="font-weight-bold"
                                                    :class="{
                                                        'black--text' : !shouldTextBeWhiteFromBackgroundColor(tag.isBackgroundColorDefined() ? tag.getBackgroundColor() : 'grey')
                                                    }"
                                            >
                                                {{tag.getNbNeighbors().getTotal()}}
                                            </span>
                                            </template>
                                            <v-icon class="mr-1 grey--text" small>
                                                {{tag.getShareIcon()}}
                                            </v-icon>
                                            {{tag.getLabel()}}
                                        </v-badge>
                                        <v-list-item-subtitle v-html="tag.getComment()"
                                                              class="grey--text text-left"></v-list-item-subtitle>
                                    </v-list-item-title>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import I18n from '@/I18n'
    import Selection from '@/Selection'
    import ShareLevel from '@/vertex/ShareLevel'
    import GraphElementController from '@/graph-element/GraphElementController'
    import Color from "../Color";
    import ShareLevelSelection from "./ShareLevelSelection";
    import CurrentSubGraph from "../graph/CurrentSubGraph";

    export default {
        name: "ShareMenu",
        components: {ShareLevelSelection},
        data: function () {
            I18n.i18next.addResources("en", "share", {
                title: "Share level",
                copyLink: "Copy link",
                centralBubble: "Central bubble",
                selectedBubble: "Selected bubble",
                tags: "Also apply to these labels",
                linkCopied: "Link copied"
            });
            I18n.i18next.addResources("fr", "share", {
                title: "Niveau de partage",
                copyLink: "Copier le lien",
                centralBubble: "Bulle centrale",
                selectedBubble: "Bulle sélectionnée",
                tags: "Appliquer également à ces étiquettes",
                linkCopied: "Lien copié"
            });
            return {
                loading: false,
                shareLevel: null,
                selectedTags: [],
                centralBubbleCopied: false,
                centralBubbleCopiedTimeout: null,
                selectedBubbleCopied: false,
                selectedBubbleCopiedTimeout: null
            }
        },
        mounted: function () {
            if (this.$store.state.selected.length === 0) {
                return;
            }
            this.shareLevel = this.getShareLevel();
            this.selectAllTags();
        },
        computed: {
            tagsByLatest: function () {
                return Selection.getSelectedBubbles().reduce((tags, bubble) => {
                    return tags.concat(bubble.getRelevantTags());
                }, []).sort((a, b) => {
                    return b.getCreationDate() - a.getCreationDate();
                });
            },
            selected: function () {
                return this.$store.state.selected;
            },
            controller: function () {
                return new GraphElementController.GraphElementController(
                    Selection.getSelectedBubbles().filter((bubble) => {
                        return bubble.canChangeShareLevel();
                    })
                );
            }
        },
        watch: {
            selected: function () {
                this.shareLevel = this.getShareLevel();
                this.selectAllTags();
            },
            tagsByLatest: function () {
                this.selectAllTags();
            }
        },
        methods: {
            copyCentralUrl: function () {
                this.$copyText(
                    CurrentSubGraph.get().center.uri().absoluteUrl()
                );
                this.centralBubbleCopied = true;
                this.selectedBubbleCopied = false;
                if (this.centralBubbleCopiedTimeout !== null) {
                    clearTimeout(this.centralBubbleCopiedTimeout);
                }
                if (this.selectedBubbleCopiedTimeout !== null) {
                    clearTimeout(this.selectedBubbleCopiedTimeout);
                }
                this.centralBubbleCopiedTimeout = setTimeout(() => {
                    this.centralBubbleCopied = false;
                    this.centralBubbleCopiedTimeout = null;
                }, 5000)

            },
            copySelectedBubble: function () {
                let single = Selection.getSingle();
                if (single === undefined) {
                    return;
                }
                this.$copyText(
                    single.uri().absoluteUrl()
                );
                this.centralBubbleCopied = false;
                this.selectedBubbleCopied = true;
                if (this.centralBubbleCopiedTimeout !== null) {
                    clearTimeout(this.centralBubbleCopiedTimeout);
                }
                if (this.selectedBubbleCopiedTimeout !== null) {
                    clearTimeout(this.selectedBubbleCopiedTimeout);
                }
                this.selectedBubbleCopiedTimeout = setTimeout(() => {
                    this.selectedBubbleCopied = false;
                    this.selectedBubbleCopiedTimeout = null;
                }, 5000)
            },
            shouldTextBeWhiteFromBackgroundColor: function (hexColor) {
                return Color.getContrast(hexColor) === 'white'
            },
            selectAllTags: function () {
                this.selectedTags = this.tagsByLatest.map((tag, index) => {
                    return index;
                });
            },
            update: function (newShareLevel) {
                this.shareLevel = newShareLevel;
                new GraphElementController.GraphElementController(
                    Selection.getSelectedBubbles().concat(
                        this.selectedTags.map((index) => {
                            return this.tagsByLatest[index]
                        })
                    )
                ).setShareLevelDo(this.shareLevel);
            },
            getShareLevel: function () {
                if (this.controller._areAllElementsPublicWithLink()) {
                    return ShareLevel.PUBLIC_WITH_LINK;
                } else if (this.controller._areAllElementsPublic()) {
                    return ShareLevel.PUBLIC;
                } else if (this.controller._areAllElementsFriendsOnly()) {
                    return ShareLevel.FRIENDS;
                } else if (this.controller._areAllElementsPrivate()) {
                    return ShareLevel.PRIVATE;
                } else {
                    return "na"
                }
            }
        }
    }

</script>

<style scoped>

</style>