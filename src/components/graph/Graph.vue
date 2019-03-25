`<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="drawn_graph" v-if="loaded" @click="click" data-zoom="9" class="vh-center">
        <!--<div :style="'width:' + leftWidth() + 'px'"></div>-->
        <div style="width:8000px;"></div>
        <v-layout row class='root-vertex-super-container vh-center ma-5 pa-5' data-zoom='1'>
            <v-flex grow class="vertices-children-container left-oriented">
                <v-layout row v-for="leftBubble in graph.center.leftBubbles" :key="leftBubble.uiId">
                    <v-flex grow>
                        <Bubble :bubble="addBubbleContext(leftBubble, graph.center, 'left')"></Bubble>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex grow class="vh-center pl-5 pr-5">
                <Bubble :bubble="graph.center"></Bubble>
            </v-flex>
            <v-flex grow class="vertices-children-container right-oriented" style="flex-basis: 100%;">
                <v-layout v-for="rightBubble in graph.center.rightBubbles" :key="rightBubble.uiId">
                    <v-flex grow>
                        <Bubble :bubble="addBubbleContext(rightBubble, graph.center, 'right')"></Bubble>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
        <div style="width:8000px;"></div>
        <RemoveDialog></RemoveDialog>
    </div>
    <!--<div :style="'width:' + rightWidth() + 'px'"></div>-->
</template>

<script>
    import MindMapInfo from '@/MindMapInfo'
    import Bubble from '@/components/graph/Bubble'
    import Scroll from '@/Scroll'
    import Vue from 'vue'
    import GraphUi from '@/graph/GraphUi'
    import SelectionHandler from '@/SelectionHandler'
    import SubGraphController from '@/graph/SubGraphController'
    import Vertex from '@/vertex/Vertex'
    import RemoveDialog from '@/components/RemoveDialog'

    export default {
        name: "Graph",
        components: {
            Bubble,
            RemoveDialog
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
            let centerVertex = Vertex.withUri(centerUri);
            SelectionHandler.reset();
            centerVertex.makeCenter();
            SubGraphController.withVertex(
                centerVertex
            ).load().then(function (graph) {
                this.graph = graph;
                let center = this.graph.center;
                this.centerServerFormat = center.getServerFormat();
                center.makeCenter();
                this.loaded = true;
                Vue.nextTick(function () {
                    GraphUi.resetBackGroundColor();
                    Scroll.centerBubbleIfApplicable(
                        this.graph.center
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
            },
            rightWidth: function () {
                return Math.max(
                    this.nbBubblesLeft() - this.nbBubblesRight(),
                    0
                ) * 100;
            },
            leftWidth: function () {
                return Math.max(
                    this.nbBubblesRight() - this.nbBubblesLeft(),
                    0
                ) * 100;
            },
            nbBubblesLeft: function () {
                let nbBubbles = 0;
                this.graph.center.leftBubbles.forEach(function (leftBubble) {
                    nbBubbles += leftBubble.getNumberOfChildDeep();
                });
                return nbBubbles;
            },
            nbBubblesRight: function () {
                let nbBubbles = 0;
                this.graph.center.rightBubbles.forEach(function (leftBubble) {
                    nbBubbles += leftBubble.getNumberOfChildDeep();
                });
                return nbBubbles;
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
        padding: 50%;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1;
    }

    [draggable=true] {
        cursor: move;
        -khtml-user-drag: element;
    }

    body {
        overflow-x: scroll;
        margin: 0 !important;
    }

    #drawn_graph {
        top: 0;
        left: 0;
        min-width: 100%;
        /*display: flex;*/
        /*width:100%;*/
        /*height:100%;*/
        /*min-width: 2000px;*/
        /*min-height: 2000px;*/
        justify-content: center;
        align-items: center;
        z-index: 1;
    }

    .root-vertex-super-container > .vertices-children-container {
        /*max-width:inherit;*/
    }

    .root-vertex-super-container > .vertices-children-container.left-oriented {
        /*display: flex;*/
        max-width: inherit;
    }

    .root-vertex-super-container > .vertices-children-container.right-oriented {
        /*display: flex;*/
        max-width: inherit;
        /*padding-right:100%;*/
    }

</style>
