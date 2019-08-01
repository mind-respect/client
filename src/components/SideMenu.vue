<template>
    <v-navigation-drawer
            stateless
            style="margin-top:42px;"
            value="true"
            fixed
            :width="mainWidth"
            :mini-variant="$store.state.isSideMenuCollapsed"
            :mini-variant-width="mainNavMiniWidth"
    >
        <v-layout fill-height>
            <v-navigation-drawer
                    :mini-variant="$store.state.isSideMenuCollapsed"
                    mini-variant-width="50"
                    :width="menuWidth"
            >
                <v-card class="" flat>
                    <v-btn @click="expand" icon v-if="$store.state.isSideMenuCollapsed" class="mt-4">
                        <v-icon>chevron_right</v-icon>
                    </v-btn>
                    <v-card-title class="subheading" v-if="!$store.state.isSideMenuCollapsed">
                        <div class="grey--text" v-if="isSingle">
                            {{$t('side:creationDate')}}
                            {{formatDate(Selection.getSingle().getCreationDate())}}
                        </div>
                        <v-spacer></v-spacer>
                        <v-btn @click="collapse" icon>
                            <v-icon>chevron_left</v-icon>
                        </v-btn>
                    </v-card-title>
                    <div v-if="!$store.state.isSideMenuCollapsed">
                        <v-tabs
                                v-model="tabMenu"
                                grow
                                centered
                                next-icon=""
                                color="transparent"
                                v-if="noteCanDo || tagCanDo || mergeCanDo"
                        >
                            <v-tab class="primary--text" v-if="noteCanDo">
                                <!--                                <span class="grey&#45;&#45;text">{{$t('side:note')}}</span>-->
                                <v-icon>note</v-icon>
                            </v-tab>
                            <v-tab class="primary--text" v-if="tagCanDo">
                                <!--                                <span class="grey&#45;&#45;text">{{$t('side:tags')}}</span>-->
                                <v-icon>label</v-icon>
                            </v-tab>
                            <v-tab class="primary--text" v-if="mergeCanDo">
                                <!--                                <span class="grey&#45;&#45;text">{{$t('side:merge')}}</span>-->
                                <v-icon>merge_type</v-icon>
                            </v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="tabMenu" class="white">
                            <v-tab-item v-if="noteCanDo">
                                <NoteMenu></NoteMenu>
                            </v-tab-item>
                            <v-tab-item v-if="tagCanDo">
                                <TagMenu @focus="focus" @blur="blur"></TagMenu>
                            </v-tab-item>
                            <v-tab-item v-if="mergeCanDo">
                                <MergeMenu @focus="focus" @blur="blur"></MergeMenu>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                </v-card>
            </v-navigation-drawer>
            <v-navigation-drawer
                    :value="$vuetify.breakpoint.lgAndUp"
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
    import BubbleButtons from '@/components/graph/BubbleButtons'
    import DateUtil from '@/DateUtil'
    import I18n from '@/I18n'
    import Selection from '@/Selection'
    import SideMenu from '@/SideMenu'
    import KeyboardActions from '@/KeyboardActions'

    export default {
        name: "SideMenu",
        components: {
            NoteMenu,
            TagMenu,
            MergeMenu,
            BubbleButtons
        },
        data: () => {
            I18n.i18next.addResources("en", "side", {
                "creationDate": "Created",
                "tags": "Tags",
                "merge": "Merge"
            });
            I18n.i18next.addResources("fr", "side", {
                "creationDate": "Créé",
                "tags": "Étiquettes",
                "merge": "Fusion"
            });
            return {
                Selection: Selection,
                tabMenu: null,
                isStretched: false,
                items: [
                    {title: 'Home', icon: 'dashboard'},
                    {title: 'About', icon: 'question_answer'}
                ]
            }
        },
        computed: {
            selected: () => {
                return Selection.getSingle();
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
            menuWidth: function () {
                return this.isStretched ? 340 : 340;
            },
            mainWidth: function () {
                return this.isStretched ? SideMenu.EXPANDED_WIDTH : SideMenu.EXPANDED_WIDTH;
            },
            mainNavMiniWidth: function () {
                if (this.$vuetify.breakpoint.mdAndDown) {
                    return 0;
                }
                return Selection.isSingle() ? SideMenu.MINI_WIDTH : 60;
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
                this.$store.dispatch("setIsSideMenuCollapsed", true);
            },
            expand: function () {
                this.$store.dispatch("setIsSideMenuCollapsed", false);
            }
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
</style>