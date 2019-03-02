`<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="drawn_graph" v-if="loaded" v-dragscroll @click="click" class="draggable" data-zoom="9">
        <div id="graph-width">
            <v-layout row class='root-vertex-super-container v-center' data-zoom='1'>
                <v-flex xs6 class="vertices-children-container left-oriented">
                    <div v-for="leftBubble in graph.center.leftBubbles">
                        <Bubble :bubble="leftBubble" :parentVertex="graph.center"
                                orientation="left"></Bubble>
                    </div>
                </v-flex>
                <v-flex xs0 class="vh-center pl-5 pr-5" style="display:inline-flex">
                    <Bubble :bubble="graph.center" :isCenter="true" orientation="center"></Bubble>
                </v-flex>
                <v-flex xs6 class="vertices-children-container right-oriented">
                    <div v-for="rightBubble in graph.center.rightBubbles">
                        <Bubble :bubble="rightBubble" :parentVertex="graph.center" orientation="right"></Bubble>
                    </div>
                </v-flex>
            </v-layout>
        </div>
    </div>
</template>

<script>
    import GraphService from '@/graph/GraphService'
    import MindMapInfo from '@/MindMapInfo'
    import TreeDisplayerCommon from '@/graph/TreeDisplayerCommon'
    import SubGraph from '@/graph/SubGraph'
    import Bubble from '@/components/graph/Bubble'
    import Scroll from '@/Scroll'
    import Vue from 'vue'
    import GraphUi from '@/graph/GraphUi'
    import SelectionHandler from '@/SelectionHandler'

    export default {
        name: "Graph",
        components: {
            Bubble
        },
        data: function () {
            return {
                graph: null,
                loaded: false,
                centerServerFormat: null
            }
        },
        mounted: function () {
            let centerUri = MindMapInfo.getCenterBubbleUri();
            GraphService.getForCentralBubbleUri(
                centerUri
            ).then(function (response) {
                let serverGraph = response.data;
                TreeDisplayerCommon.setUiTreeInfoToVertices(
                    serverGraph,
                    centerUri
                );
                this.graph = SubGraph.withFacadeAndCenterUri(
                    serverGraph,
                    centerUri
                );
                let center = this.graph.center;
                this.centerServerFormat = center.getServerFormat();
                center.makeCenter();
                center.groupRelationRoots.forEach(function (groupRelationRoot) {
                    center.addChild(groupRelationRoot)
                }.bind(this));
                this.loaded = true;
                Vue.nextTick(function () {
                    GraphUi.resetBackGroundColor();
                    GraphUi.refreshWidth();
                    Scroll.goToGraphElement(
                        document.getElementById("center")
                    );
                }.bind(this))
            }.bind(this));
        },
        methods: {
            click: function () {
                SelectionHandler.removeAll();
            }
        },
        watch: {
            "centerServerFormat.label": function () {
                document.title = this.graph.center.getTextOrDefault() + " | MindRespect";
            }
        }
    }
</script>

<style scoped>
    /*#drawn_graph {*/
    /*position: absolute;*/
    /*padding: 100%;*/
    /*top: 0;*/
    /*display: flex;*/
    /*justify-content: center;*/
    /*align-items: center;*/
    /*overflow: scroll;*/
    /*z-index: 1;*/
    /*}*/

    .draggable {
        cursor: move;
        -khtml-user-drag: element;
    }

    #drawn_graph {
        position: absolute;
        padding: 100%;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    / / display: flex !important;
    / / justify-items: center !important;;
    / / align-items: center !important;;
    / / background: radial-gradient(rgba(0, 0, 255, 0) 5 %, #0b46ff 100 %);
    / / background: radial-gradient(rgba(0, 0, 255, 0) 5 %, #084A62 100 %);
    / / background: radial-gradient(rgba(0, 0, 255, 0) 5 %, #44C9FB 100 %);
    / / background: radial-gradient(rgba(0, 0, 255, 0) 5 %, #623300 100 %);
    / / background: radial-gradient(at 4250 px, rgba(0, 0, 255, 0) 5 %, #1E87AF 100 %);
    / / background: -webkit-radial-gradient(4250 px, rgba(0, 0, 255, 0) 5 %, #1E87AF 100 %);
    / / background: radial-gradient(rgba(0, 0, 255, 0) 5 %, #AF6A1E 100 %);

    }

</style>
