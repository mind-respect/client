<template>
    <v-card flat>
        <v-card-text class="pt-2 pb-0 mt-0 vh-center">
            <v-btn small text class="pa-0 mt-0" v-clipboard:copy="bubbleUrl" v-if="$store.state.selected.length === 1">
                <v-icon class="mr-2">link</v-icon>
                {{$t('share:copy')}}
            </v-btn>
        </v-card-text>
        <v-card-title class="pt-1 pb-0 subtitle-1 vh-center font-weight-bold">
            {{$t('share:title')}}
        </v-card-title>
        <v-card flat class="pt-0 pb-0">
            <v-card-text class="pt-0 pb-0 mt-0 vh-center" id="shareMenu">
                <v-radio-group v-model="shareLevel" class="pa-0 mt-0" @change="update"
                               :disabled="$store.state.selected.length === 0">
                    <v-radio :label="$t('share:private')" on-icon="lock" off-icon="lock" value="PRIVATE"
                             color="third"></v-radio>
                    <v-radio :label="$t('share:friendsOnly')" value="FRIENDS" on-icon="people"
                             off-icon="people" color="third"></v-radio>
                    <v-radio :label="$t('share:publicWithLink')" value="PUBLIC_WITH_LINK" on-icon="link"
                             off-icon="link" color="third"></v-radio>
                    <v-radio :label="$t('share:public')" value="PUBLIC" on-icon="public" off-icon="public"
                             color="third"></v-radio>
                </v-radio-group>
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
                                        class="mt-2"
                                ></v-checkbox>
                            </v-list-item-action>
                            <v-list-item-content class="pt-0 mt-0">
                                <v-list-item-title class="text-left mb-0">
                                    <v-badge class="pt-0 mt-0" :color="tag.isBackgroundColorDefined() ? tag.getBackgroundColor() : 'grey'"
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
                                                {{tag.getNbReferences()}}
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
</template>

<script>
    import I18n from '@/I18n'
    import Selection from '@/Selection'
    import ShareLevel from '@/vertex/ShareLevel'
    import GraphDisplayer from '@/graph/GraphDisplayer'
    import GraphElementController from '@/graph-element/GraphElementController'
    import Color from "../Color";

    export default {
        name: "ShareMenu",
        data: function () {
            I18n.i18next.addResources("en", "share", {
                title: "Share level",
                private: "Private",
                public: "Public and indexed by search engines",
                publicWithLink: "Public with link",
                friendsOnly: "Friends only",
                copy: "Copy bubble's link",
                tags: "Also apply to these labels"
            });
            I18n.i18next.addResources("fr", "share", {
                title: "Niveau de partage",
                private: "Privé",
                public: "Publique et indexé par les moteurs de recherche",
                publicWithLink: "Publique avec le lien",
                friendsOnly: "Amis seulement",
                copy: "Copier le lien de la bulle",
                tags: "Appliquer également à ces étiquettes"
            });
            return {
                loading: false,
                shareLevel: null,
                selectedTags: []
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
                return GraphDisplayer.getVertexMenuHandler().fromDifferentGraphElements(
                    Selection.getSelectedElements()
                );
            },
            bubbleUrl: function () {
                return Selection.getSingle().uri().absoluteUrl();
            }
        },
        watch: {
            selected: function () {
                this.shareLevel = this.getShareLevel();
                this.selectAllTags();
            }
        },
        methods: {
            shouldTextBeWhiteFromBackgroundColor: function (hexColor) {
                return Color.getContrast(hexColor) === 'white'
            },
            selectAllTags: function () {
                this.selectedTags = this.tagsByLatest.map((tag, index) => {
                    return index;
                });
            },
            update: function () {
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