<template>
    <v-navigation-drawer
            stateless
            style="margin-top:42px;"
            value="true"
            fixed
            :width="mainWidth"
            :mini-variant="!SelectionHandler.isSingle() || $store.state.isSideMenuCollapsed"
            :mini-variant-width="mainNavMiniWidth"
    >
        <v-layout fill-height>
            <v-navigation-drawer
                    v-if="SelectionHandler.isSingle()"
                    :mini-variant="$store.state.isSideMenuCollapsed"
                    mini-variant-width="50"
                    :width="menuWidth"
            >
                <v-card class="" flat>
                    <v-btn @click="expand" icon v-if="$store.state.isSideMenuCollapsed" class="mt-4">
                        <v-icon>chevron_right</v-icon>
                    </v-btn>
                    <v-card-title class="subheading" v-if="!$store.state.isSideMenuCollapsed">
                        <div class="grey--text">
                            {{$t('side:creationDate')}}
                            {{formatDate(SelectionHandler.getSingle().getCreationDate())}}
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
                                icons-and-text
                        >
                            <v-tab class="primary--text">
                                <span class="grey--text">{{$t('side:tags')}}</span>
                                <v-icon>label</v-icon>
                            </v-tab>
                            <v-tab class="primary--text">
                                <span class="grey--text">{{$t('side:merge')}}</span>
                                <v-icon>merge_type</v-icon>
                            </v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="tabMenu" class="white">
                            <v-tab-item>
                                <TagMenu @focus="isStretched = true" @blur="isStretched = false"></TagMenu>
                            </v-tab-item>
                            <v-tab-item>
                                <MergeMenu></MergeMenu>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                </v-card>
            </v-navigation-drawer>
            <v-navigation-drawer
                    value="true"
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
    import TagMenu from '@/components/TagMenu'
    import MergeMenu from '@/components/MergeMenu'
    import BubbleButtons from '@/components/graph/BubbleButtons'
    import Moment from 'moment'
    import I18n from '@/I18n'
    import SelectionHandler from '@/SelectionHandler'

    export default {
        name: "SideMenu",
        components: {
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
                SelectionHandler: SelectionHandler,
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
                return SelectionHandler.getSingle();
            },
            isSingle: () => {
                return SelectionHandler.isSingle();
            },
            menuWidth: function () {
                return this.isStretched ? 340 : 340;
            },
            mainWidth: function () {
                return this.isStretched ? 400 : 400;
            },
            mainNavMiniWidth: function () {
                return SelectionHandler.isSingle() ? 110 : 60;
            }
        },
        methods: {
            formatDate: function (date) {
                return new Moment(date).fromNow();
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