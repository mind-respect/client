`<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="drawn_graph" v-if="loaded" v-dragscroll @click="click" class="draggable" data-zoom="9">
        <v-layout row class='root-vertex-super-container vh-center' data-zoom='1'>
            <v-flex grow class="vertices-children-container left-oriented">
                <div v-for="leftBubble in graph.center.leftBubbles" :key="leftBubble.uiId">
                    <Bubble :bubble="addBubbleContext(leftBubble, graph.center, 'left')"></Bubble>
                </div>
            </v-flex>
            <v-flex grow class="vh-center pl-5 pr-5">
                <Bubble :bubble="graph.center"></Bubble>
            </v-flex>
            <v-flex grow class="vertices-children-container right-oriented">
                <div v-for="rightBubble in graph.center.rightBubbles" :key="rightBubble.uiId">
                    <Bubble :bubble="addBubbleContext(rightBubble, graph.center, 'right')"></Bubble>
                </div>
            </v-flex>
        </v-layout>
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
                });
                this.loaded = true;
                Vue.nextTick(function () {
                    GraphUi.resetBackGroundColor();
                    Scroll.goToGraphElement(
                        document.getElementById("center")
                    );
                }.bind(this))
            }.bind(this));
        },
        methods: {
            click: function () {
                SelectionHandler.removeAll();
            },
            addBubbleContext: function (bubble, parentVertex, orientation) {
                bubble.parentBubble = bubble.parentVertex = parentVertex;
                bubble.orientation = orientation;
                return bubble;
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
