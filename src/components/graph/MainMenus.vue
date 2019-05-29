<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
<!--        <v-spacer></v-spacer>-->
<!--        <v-toolbar flat fixed color="transparent" class="top-toolbar pl-1" height="36" dense right>-->
<!--            <v-toolbar-side-icon></v-toolbar-side-icon>-->
<!--            <v-toolbar-title>Title</v-toolbar-title>-->
<!--            <v-spacer></v-spacer>-->
<!--            <v-toolbar-items class="pa-0 mt-3">-->
<!--                <div v-for="(button, i) in graphButtons" :key="button.action">-->
<!--                    <Button :button="button" :isInSideMenu="true" :buttonIndex="i"></Button>-->
<!--                </div>-->
<!--            </v-toolbar-items>-->
<!--        </v-toolbar>-->
        <!--        <v-navigation-drawer-->
        <!--                v-model="sideNavigation"-->
        <!--                :mini-variant.sync="mini"-->
        <!--                class="elevation-0 pt-0 side-navigation-drawer"-->
        <!--                fixed-->
        <!--                width="50"-->
        <!--                mini-variant-width="50"-->
        <!--                color="transparent"-->
        <!--                flat-->
        <!--                floating-->
        <!--        >-->
        <!--            <div v-for="(button, i) in graphButtons" :key="button.action">-->
        <!--                <Button :button="button" :isInSideMenu="true" :buttonIndex="i"></Button>-->
        <!--            </div>-->
        <!--        </v-navigation-drawer>-->
    </div>
</template>

<script>
    import SelectionHandler from '@/SelectionHandler'
    import AppController from '@/AppController'
    import GraphController from '@/graph/GraphController'
    import Button from '@/components/graph/Button'
    import SubGraph from '@/graph/SubGraph'
    import VertexService from '@/vertex/VertexService'

    export default {
        name: "MainMenus",
        components: {
            Button: Button
        },
        mounted: function () {
            this.backgroundColor = SubGraph.graph.center.getBackgroundColor();
            setTimeout(function () {
                this.loaded = true;
            }.bind(this), 1000)
        },
        methods: {
            changeBackgroundColor: function () {
                SubGraph.graph.center.setBackgroundColor(this.backgroundColor);
                VertexService.saveColors({
                    background: this.backgroundColor
                });
            }
        },
        data: function () {
            return {
                sideNavigation: true,
                mini: true,
                refreshKey: Math.random(),
                loaded: false,
                backgroundColor: null,
                graphButtons: [{
                    action: "createVertex",
                    icon: "add",
                    controller: AppController
                }, {
                    action: "zoomIn",
                    icon: "zoom_in",
                    ctrlShortcut: "&plus;",
                    controller: AppController
                }, {
                    action: "zoomOut",
                    icon: "zoom_out",
                    ctrlShortcut: "&minus;",
                    controller: AppController
                }, {
                    action: "expandAll",
                    icon: "unfold_more",
                    controller: GraphController
                }, {
                    action: "selectAllBubbles",
                    icon: "select_all",
                    controller: GraphController
                }, {
                    action: "undo",
                    icon: "undo",
                    ctrlShortcut: "Z",
                    controller: AppController
                }, {
                    action: "redo",
                    icon: "redo",
                    ctrlShortcut: "Y",
                    controller: AppController
                }, {
                    action: "fontPicker",
                    icon: "font_download",
                    controller: AppController
                }, {
                    action: "changeBackgroundColor",
                    icon: "format_paint",
                    controller: AppController,
                    isCustom: true
                }, {
                    action: "list",
                    icon: "list",
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
        margin-top: 33px !important;
        height: 43px;
    }

    /*.top-toolbar .v-toolbar__content {*/
    /*    margin-top: 0;*/
    /*    display: inline-block;*/
    /*}*/

    /*.top-toolbar .v-toolbar__content, .side-toolbar .v-toolbar__content {*/
    /*    padding: 0;*/
    /*}*/

    .side-navigation-drawer {
        padding-left: 4px;
        margin-top: 86px !important;
        background-color: transparent !important;
        border: none !important;
        overflow: hidden;
        left: 100% !important;
        margin-left: -40px;
    }
</style>
