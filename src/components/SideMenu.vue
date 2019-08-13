<template>
    <v-navigation-drawer
            stateless
            style="margin-top:43px;"
            :value="true"
            v-if="$vuetify.breakpoint.mdAndUp || (!isSingle || $store.state.sideMenuFlow !== false)"
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
                    v-if="$vuetify.breakpoint.lgAndUp || $store.state.sideMenuFlow !== false"
                    stateless
                    touchless
            >
                <v-card flat class="text-center">
                    <v-btn @click="expand" small icon v-if="$store.state.sideMenuFlow === false" class="mt-6 text-center">
                        <v-icon>chevron_right</v-icon>
                    </v-btn>
                    <v-card-title class="subtitle-1" v-if="$store.state.sideMenuFlow !== false">
                        <div class="grey--text" v-if="isSingle">
                            {{$t('side:creationDate')}}
                            {{formatDate(creationDate)}}
                        </div>
                        <v-spacer></v-spacer>
                        <v-btn @click="collapse" icon>
                            <v-icon>chevron_left</v-icon>
                        </v-btn>
                    </v-card-title>
                    <div v-if="$store.state.sideMenuFlow !== false" class="text-left">
                        <v-tabs
                                v-model="tabMenu"
                                grow
                                centered
                                show-arrows
                                color="transparent"
                                class="side-tabs"
                        >
                            <v-tab class="primary--text side-tab">
                                <v-icon>note</v-icon>
                            </v-tab>
                            <v-tab class="primary--text side-tab">
                                <v-icon>label</v-icon>
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
                                <p v-if="!noteCanDo" class="pt-4 grey--text text-center">
                                    {{$t('side:noteCantDo')}}</p>
                                <NoteMenu :bubble="selected" v-if="noteCanDo"></NoteMenu>
                            </v-tab-item>
                            <v-tab-item>
                                <p v-if="!tagCanDo" class="pt-4 grey--text text-center">{{$t('side:tagCantDo')}}</p>
                                <TagMenu @focus="focus" @blur="blur" :bubble="selected" v-if="tagCanDo"></TagMenu>
                            </v-tab-item>
                            <v-tab-item>
                                <p v-if="!mergeCanDo" class="pt-4 grey--text text-center">
                                    {{$t('side:mergeCantDo')}}</p>
                                <MergeMenu @focus="focus" @blur="blur" :bubble="selected" v-if="mergeCanDo"></MergeMenu>
                            </v-tab-item>
                            <v-tab-item>
                                <p v-if="!shareCanDo" class="pt-4 grey--text text-center">
                                    {{$t('side:shareCantDo')}}</p>
                                <ShareMenu @focus="focus" @blur="blur"
                                           v-if="shareCanDo"></ShareMenu>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                </v-card>
            </v-navigation-drawer>
            <v-navigation-drawer
                    v-if="$vuetify.breakpoint.mdAndUp || !isSingle"
                    :value="true"
                    right
                    mini-variant
                    mini-variant-width="60"
                    stateless
                    id="buttonsDrawer"
            >
                <BubbleButtons :isInSideMenu="true"></BubbleButtons>
            </v-navigation-drawer>
        </v-layout>
    </v-navigation-drawer>
</template>

<script>
    import NoteMenu from '@/components/NoteMenu'
    import TagMenu from '@/components/TagMenu'
    import MergeMenu from '@/components/MergeMenu'
    import ShareMenu from '@/components/ShareMenu'
    import BubbleButtons from '@/components/graph/BubbleButtons'
    import DateUtil from '@/DateUtil'
    import I18n from '@/I18n'
    import Selection from '@/Selection'
    import SideMenu from '@/SideMenu'
    import KeyboardActions from '@/KeyboardActions'
    import BreakPoint from "../Breakpoint";

    export default {
        name: "SideMenu",
        components: {
            NoteMenu,
            TagMenu,
            MergeMenu,
            ShareMenu,
            BubbleButtons
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
                mainWidth: SideMenu.EXPANDED_WIDTH,
            }
        },
        computed: {
            selected: function () {
                return Selection.getSingle();
            },
            creationDate: function () {
                return Selection.getSingle().getCreationDate();
            },
            isSingle: () => {
                return Selection.isSingle();
            },
            noteCanDo: function () {
                return Selection.isSingle() && Selection.getSingle().controller().noteCanDo();
            },
            tagCanDo: function () {
                return Selection.isSingle() && Selection.getSingle().controller().identifyCanDo();
            },
            mergeCanDo: function () {
                return Selection.isSingle() && Selection.getSingle().controller().mergeCanDo();
            },
            shareCanDo: function () {
                return Selection.controller().setShareLevelCanDo();
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

    .side-search-menu {
        top: -16px !important;
    }

    .side-search-menu .v-list__tile {
        height: auto;
        min-height: 48px;
        max-height: 105px;
    }

    .side-tab{
        min-width:40px !important;
    }
    .side-tabs .v-slide-group__prev{
        display:none;
    }
</style>