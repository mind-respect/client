<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="drawn_graph" v-if="loaded" v-dragscroll @click="click" class="draggable">
        <div class="vertices-children-container left-oriented">
            <div v-for="leftBubble in graph.center.leftBubbles">
                <Bubble :bubble="leftBubble"></Bubble>
            </div>
        </div>
        <div class='root-vertex-super-container' data-zoom='1' id="center">
            <Bubble :bubble="graph.center"></Bubble>
        </div>
        <div class="vertices-children-container right-oriented">
            <div v-for="rightBubble in graph.center.rightBubbles">
                <Bubble :bubble="rightBubble"></Bubble>
            </div>
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
                centerServerFormat:null
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
                    Scroll.goToGraphElement(
                        document.getElementById("center")
                    );
                    GraphUi.resetBackGroundColor();
                }.bind(this))
            }.bind(this));
        },
        methods: {
            click: function(){
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
    #drawn_graph {
        position: absolute;
        padding: 100%;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: scroll;
        z-index: 1;
    / / for safari http: / / stackoverflow . com /a/ 397763
    }
    .draggable{
        cursor: move;
        -khtml-user-drag: element;
    }
    .root-vertex-super-container {
        width: 100%;
        height: 100%;
    / / padding-top: 50 %;
    / / padding-bottom: 50 %;
        table-layout: fixed
    }

    .vertices-children-container.left-oriented::before {
        margin-left: 2225px;
        content: " ";
        height: 100%;
        position: absolute;
    }
</style>
