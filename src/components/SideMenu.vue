<template>
    <v-navigation-drawer
            stateless
            style="margin-top:43px;"
            :value="true"
            v-show="$vuetify.breakpoint.mdAndUp || (!isSingle || $store.state.sideMenuFlow !== false)"
            fixed
            :width="mainWidth"
            :mini-variant="$store.state.sideMenuFlow === false"
            :mini-variant-width="mainNavMiniWidth"
            touchless
    >
        <v-layout fill-height>
            <v-navigation-drawer
                    :mini-variant="$store.state.sideMenuFlow === false"
                    mini-variant-width="50"
                    :width="menuWidth"
                    :value="true"
                    v-show="$vuetify.breakpoint.lgAndUp || $store.state.sideMenuFlow !== false"
                    stateless
                    touchless
            >
                <v-card flat class="text-center">
                    <v-btn @click="expand" small icon v-show="$store.state.sideMenuFlow === false"
                           class="mt-6 text-center">
                        <v-icon>chevron_right</v-icon>
                    </v-btn>
                    <v-card-title class="subtitle-1" v-show="$store.state.sideMenuFlow !== false">
                        <div class="grey--text text-left">
                            <v-skeleton-loader
                                    type="text"
                                    width="200"
                                    v-show="$store.state.selected.length ===0"
                            >
                            </v-skeleton-loader>
                            <v-skeleton-loader
                                    type="text"
                                    width="200"
                                    v-show="$store.state.selected.length ===0"
                            >
                            </v-skeleton-loader>
                            <div class="font-weight-bold side-menu-label" :key="$store.state.labelRefresh + 'sideMenu'" v-if="isSingle">
                                {{selected.getLabel()}}
                            </div>
                            <div class="font-italic" v-if="isSingle">
                                {{$t('side:creationDate')}}
                                {{formatDate(creationDate)}}
                            </div>
                        </div>
                        <v-spacer></v-spacer>
                        <v-btn @click="collapse" icon>
                            <v-icon>chevron_left</v-icon>
                        </v-btn>
                    </v-card-title>
                    <div v-show="$store.state.sideMenuFlow !== false" class="text-left">
                        <v-tabs
                                v-model="tabMenu"
                                grow
                                centered
                                show-arrows
                                class="side-tabs"
                        >
                            <v-tab class="primary--text side-tab">
                                <v-badge color="transparent" :key="$store.state.noteRefresh + 'noteHeader'">
                                    <template v-slot:badge>
                                        <v-icon color="third"
                                                v-if="selected && selected.hasComment()">
                                            brightness_1
                                        </v-icon>
                                    </template>
                                    <v-icon>note</v-icon>
                                </v-badge>
                            </v-tab>
                            <v-tab class="primary--text side-tab">
                                <v-badge color="transparent" :key="$store.state.tagRefresh + 'tagMenuHeader'">
                                    <template v-slot:badge>
                                        <v-icon color="third"
                                                v-if="selected && selected.hasIdentifications()">
                                            brightness_1
                                        </v-icon>
                                    </template>
                                    <v-icon>label</v-icon>
                                </v-badge>
                            </v-tab>
                            <v-tab class="primary--text side-tab">
                                <v-icon>merge_type</v-icon>
                            </v-tab>
                            <v-tab class="primary--text side-tab">
                                <v-icon>share</v-icon>
                            </v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="tabMenu" class="white">
                            <v-tab-item>
                                <p v-show="!noteCanDo"
                                   class="pt-4 grey--text text-center"
                                   v-if="$store.state.selected.length > 0"
                                >
                                    {{$t('side:noteCantDo')}}</p>
                                <NoteMenu
                                        :bubble="selected"
                                        v-show="noteCanDo || !selected"
                                ></NoteMenu>
                            </v-tab-item>
                            <v-tab-item>
                                <p
                                        v-show="!tagCanDo"
                                        class="pt-4 grey--text text-center"
                                        v-if="$store.state.selected.length > 0"
                                >
                                    {{$t('side:tagCantDo')}}
                                </p>
                                <TagMenu
                                        @focus="focus"
                                        @blur="blur"
                                        :bubble="selected"
                                        v-show="tagCanDo || !selected"
                                ></TagMenu>
                            </v-tab-item>
                            <v-tab-item>
                                <p v-show="!mergeCanDo"
                                   class="pt-4 grey--text text-center"
                                   v-if="$store.state.selected.length > 0"
                                >
                                    {{$t('side:mergeCantDo')}}</p>
                                <MergeMenu @focus="focus" @blur="blur" :bubble="selected"
                                           v-show="mergeCanDo || !selected"
                                ></MergeMenu>
                            </v-tab-item>
                            <v-tab-item>
                                <p v-show="!shareCanDo"
                                   class="pt-4 grey--text text-center"
                                   v-if="$store.state.selected.length > 0"
                                >
                                    {{$t('side:shareCantDo')}}</p>
                                <ShareMenu @focus="focus"
                                           @blur="blur"
                                           v-if="shareCanDo || !selected"
                                           :key="$store.state.shareRefresh + 'shareMenu'"
                                ></ShareMenu>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                </v-card>
            </v-navigation-drawer>
            <v-navigation-drawer
                    v-show="$vuetify.breakpoint.mdAndUp || !isSingle"
                    :value="true"
                    right
                    mini-variant
                    mini-variant-width="60"
                    stateless
                    id="buttonsDrawer"
            >
                <BubbleButtons :isInSideMenu="true" @refresh="buttonRefresh"></BubbleButtons>
            </v-navigation-drawer>
        </v-layout>
    </v-navigation-drawer>
</template>

<script>
    import DateUtil from '@/DateUtil'
    import I18n from '@/I18n'
    import Selection from '@/Selection'
    import SideMenu from '@/SideMenu'
    import KeyboardActions from '@/KeyboardActions'
    import IdUri from "@/IdUri";

    export default {
        name: "SideMenu",
        components: {
            NoteMenu: () => import('@/components/NoteMenu'),
            TagMenu: () => import('@/components/TagMenu'),
            MergeMenu: () => import('@/components/MergeMenu'),
            ShareMenu: () => import('@/components/ShareMenu'),
            BubbleButtons: () => import('@/components/graph/BubbleButtons'),
        },
        data: () => {
            I18n.i18next.addResources("en", "side", {
                "creationDate": "Created",
                "tags": "Tags",
                "merge": "Merge",
                "noteCantDo": "Note not available",
                "tagCantDo": "Tags not available",
                "mergeCantDo": "Merge not available",
                "shareCantDo": "Share is not available"
            });
            I18n.i18next.addResources("fr", "side", {
                "creationDate": "Créé",
                "tags": "Étiquettes",
                "merge": "Fusion",
                "noteCantDo": "Note non disponible",
                "tagCantDo": "Étiquettes non disponible",
                "mergeCantDo": "Fusion non disponible",
                "shareCantDo": "Partage non disponible"
            });
            return {
                tabMenu: null,
                items: [
                    {title: 'Home', icon: 'dashboard'},
                    {title: 'About', icon: 'question_answer'}
                ],
                mainWidth: SideMenu.EXPANDED_WIDTH
            }
        },
        computed: {
            selected: function () {
                return Selection.getSingle();
            },
            creationDate: function () {
                let single = Selection.getSingle();
                return single ? single.getCreationDate() : new Date();
            },
            isSingle: () => {
                return Selection.isSingle();
            },
            noteCanDo: function () {
                if (!Selection.isSingle()) {
                    return false;
                }
                let single = Selection.getSingle();
                return single && single.controller().noteCanDo();
            },
            tagCanDo: function () {
                if (!Selection.isSingle()) {
                    return false;
                }
                let single = Selection.getSingle();
                return single && (single.controller().identifyCanDo() || single.isMeta() || single.hasIdentifications());
            },
            mergeCanDo: function () {
                if (!Selection.isSingle()) {
                    return false;
                }
                let single = Selection.getSingle();
                return single && single.controller().mergeCanDo();
            },
            shareCanDo: function () {
                return this.$store.state.selected.length > 0 && Selection.controller().setShareLevelCanDo();
            },
            menuWidth: function () {
                return this.$vuetify.breakpoint.mdAndDown ? this.mainWidth : 340;
            },
            sideMenuFlow: function () {
                return this.$store.state.sideMenuFlow;
            },
            mainNavMiniWidth: function () {
                return this.$vuetify.breakpoint.mdAndDown ? 60 : SideMenu.MINI_WIDTH;
            }
        },
        methods: {
            buttonRefresh: function () {
                Selection.getSelectedElements().forEach((graphElement) => {
                    graphElement.refreshButtons();
                });
            },
            focus: function () {
                KeyboardActions.disable();
            },
            blur: function () {
                KeyboardActions.enable();
            },
            formatDate: function (date) {
                return DateUtil.fromNow(date);
            },
            collapse: function () {
                this.$store.dispatch("setSideMenuFlow", false);
            },
            expand: function () {
                this.$store.dispatch("setSideMenuFlow", 0);
            }
        },
        watch: {
            tabMenu: function () {
                if (this.$store.state.sideMenuFlow === false) {
                    return;
                }
                this.$store.dispatch("setSideMenuFlow", this.tabMenu);
            },
            sideMenuFlow: function () {
                this.tabMenu = this.$store.state.sideMenuFlow
            }
        },
        mounted: function () {
            this.tabMenu = this.$vuetify.breakpoint.mdAndDown ? false : this.$store.state.sideMenuFlow;
        }
    }
</script>

<style>
    .side-menu-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 250px;
    }

    .side-search-menu {
        top: -16px !important;
    }

    .side-search-menu .v-list__tile {
        height: auto;
        min-height: 48px;
        max-height: 105px;
    }

    .side-tab {
        min-width: 40px !important;
    }

    .side-tabs .v-slide-group__prev {
        display: none;
    }
</style>