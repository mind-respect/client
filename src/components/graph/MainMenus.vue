<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
        <v-toolbar fixed flat color="transparent" class="top-toolbar pl-1" height="36" dense>
            <v-toolbar-items class="pa-0 mt-3">
                <BubbleButtons :key="refreshKey" :isInMainMenu="true"></BubbleButtons>
            </v-toolbar-items>
        </v-toolbar>
        <v-navigation-drawer
                v-model="sideNavigation"
                :mini-variant.sync="mini"
                class="elevation-0 pt-0 side-navigation-drawer"
                fixed
                mini-variant-width="50"
                color="transparent"
                flat
                floating
        >
            <v-toolbar flat color="transparent" class="side-toolbar" style="border:none;">
                <v-list class="pa-0" color="transparent">
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-btn flat icon>
                                <v-icon>fa-bullseye</v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-btn flat icon>
                                <v-icon>
                                    meeting_room
                                </v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-btn flat icon>
                                <v-icon>
                                    meeting_room
                                </v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-btn flat icon>
                                <v-icon>
                                    meeting_room
                                </v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-btn flat icon>
                                <v-icon>
                                    meeting_room
                                </v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-btn flat icon>
                                <v-icon>
                                    meeting_room
                                </v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-btn flat icon>
                                <v-icon>
                                    meeting_room
                                </v-icon>
                            </v-btn>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list>
            </v-toolbar>
        </v-navigation-drawer>
    </div>
</template>

<script>
    import BubbleButtons from '@/components/graph/BubbleButtons'
    import SelectionHandler from '@/SelectionHandler'
    export default {
        name: "MainMenus",
        components:{
            BubbleButtons: BubbleButtons
        },
        mounted:function(){
            setTimeout(function(){
                this.loaded = true;
            }.bind(this),1000)
        },
        data: function () {
            return {
                sideNavigation: true,
                mini: true,
                refreshKey: Math.random(),
                loaded: false
            }
        },
        computed: {
            selection: function () {
                return SelectionHandler.selected;
            }
        },
        watch: {
            selection: function () {
                console.log("refresh buttons ffd")
                this.refreshKey = Math.random();
            }
        }
    }
</script>
<style>
    .top-toolbar {
        margin-top: 43px !important;
    }

    .top-toolbar .v-toolbar__content, .side-toolbar .v-toolbar__content {
        padding: 0;
    }

    .side-navigation-drawer {
        margin-left: 8px;
        padding-left: 4px;
        margin-top: 86px !important;
        background-color: transparent !important;
        border: none !important;
    }
</style>
