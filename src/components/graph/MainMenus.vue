<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
        <v-toolbar fixed flat color="transparent" class="top-toolbar pl-1" height="36" dense>
            <v-toolbar-items class="pa-0 mt-3">
                <BubbleButtons :key="refreshKey" :isInTopMenu="true"></BubbleButtons>
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
                    <v-list-tile v-for="button in graphButtons">
                        <v-list-tile-action>
                            <Button :button="button" :isInSideMenu="true"></Button>
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
    import AppController from '@/AppController'
    import GraphController from '@/graph/GraphController'
    import Button from '@/components/graph/Button'

    export default {
        name: "MainMenus",
        components: {
            BubbleButtons: BubbleButtons,
            Button: Button
        },
        mounted: function () {
            setTimeout(function () {
                this.loaded = true;
            }.bind(this), 1000)
        },
        data: function () {
            return {
                sideNavigation: true,
                mini: true,
                refreshKey: Math.random(),
                loaded: false,
                graphButtons: [{
                    action: "zoomIn",
                    icon: "zoom_in",
                    ctrlShortcut: "&plus;",
                    controller: AppController
                }, {
                    action: "zoomOut",
                    icon: "zoom_out",
                    ctrlShortcut: "&minus;",
                    controller: AppController
                }]
            }
        },
        computed: {
            selection: function () {
                return SelectionHandler.selected;
            }
        },
        watch: {
            selection: function () {
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
