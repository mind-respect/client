<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
        <v-divider></v-divider>
        <MainMenus></MainMenus>
        <div id="drawn_graph" data-zoom="9" class="vh-center" :style="backgroundColorStyle">
            <!--<div :style="'width:' + leftWidth() + 'px'"></div>-->
            <div style="width:8000px;"></div>
            <v-layout row class='root-vertex-super-container vh-center ma-5 pa-5' :style="zoomScale">
                <v-flex grow class="vertices-children-container left-oriented" style="width:7000px;" :class="{
                    'blur-overlay': graph.center.isEditFlow
                }">
                    <v-layout row v-for="leftBubble in graph.center.leftBubbles" :key="leftBubble.uiId">
                        <v-flex grow :class="{
                        'mt-3' : graph.center.leftBubbles.length === 2 && graph.center.leftBubbles[0].isEdge(),
                        'mb-3' : graph.center.leftBubbles.length === 2 && graph.center.leftBubbles[1].isEdge()
                        }">
                            <Bubble :bubble="addBubbleContext(leftBubble, graph.center, 'left')"></Bubble>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="vh-center">
                    <Bubble :bubble="graph.center"></Bubble>
                </v-flex>
                <v-flex grow class="vertices-children-container right-oriented" style="width:7000px;" :class="{
                    'blur-overlay': graph.center.isEditFlow
                }">
                    <v-layout v-for="rightBubble in graph.center.rightBubbles" :key="rightBubble.uiId">
                        <v-flex grow :class="{
                            'mt-3' : graph.center.rightBubbles.length === 2 && graph.center.rightBubbles[0].isEdge(),
                            'mb-3' : graph.center.rightBubbles.length === 2 && graph.center.rightBubbles[1].isEdge()
                        }">
                            <Bubble :bubble="addBubbleContext(rightBubble, graph.center, 'right')"></Bubble>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <div style="width:8000px;"></div>
            <div class="svg-container" style="z-index:-1">
                <transition name="fade">
                    <GraphDrawing :center="graph.center" :key="redrawKey" v-if="redrawKey"></GraphDrawing>
                </transition>
            </div>
        </div>
        <RemoveDialog></RemoveDialog>
        <DescriptionDialog></DescriptionDialog>
        <FontDialog></FontDialog>
        <TagDialog></TagDialog>
    </div>
    <!--<div :style="'width:' + rightWidth() + 'px'"></div>-->
</template>

<script>
    import MindMapInfo from '@/MindMapInfo'
    import Bubble from '@/components/graph/Bubble'
    import GraphDrawing from '@/components/graph/GraphDrawing'
    import MainMenus from '@/components/graph/MainMenus'
    import Scroll from '@/Scroll'
    import Vue from 'vue'
    import SelectionHandler from '@/SelectionHandler'
    import SubGraphController from '@/graph/SubGraphController'
    import Vertex from '@/vertex/Vertex'
    import RemoveDialog from '@/components/RemoveDialog'
    import DescriptionDialog from '@/components/DescriptionDialog'
    import FontDialog from '@/components/FontDialog'
    import TagDialog from '@/components/TagDialog'
    import SubGraph from '@/graph/SubGraph'
    import Store from '@/store'
    import Color from '@/Color'

    export default {
        name: "Graph",
        components: {
            Bubble,
            RemoveDialog,
            DescriptionDialog,
            FontDialog,
            TagDialog,
            GraphDrawing,
            MainMenus
        },
        data: function () {
            return {
                graph: null,
                loaded: false,
                centerServerFormat: null,
                redrawKey: null,
                backgroundColorStyle: ""
            }
        },
        mounted: function () {
            let centerUri = MindMapInfo.getCenterBubbleUri();
            let centerVertex = Vertex.withUri(centerUri);
            SelectionHandler.removeAll();
            centerVertex.makeCenter();
            SubGraphController.withVertex(
                centerVertex
            ).load().then((graph) => {
                this.graph = graph;
                let center = this.graph.center;
                this.centerServerFormat = center.getServerFormat();
                center.makeCenter();
                SubGraph.graph = this.graph;
                this.loaded = true;
                Vue.nextTick(() => {
                    SelectionHandler.setToSingle(this.graph.center);
                    Scroll.centerBubbleIfApplicable(
                        this.graph.center
                    );
                })
            });
        },
        methods: {
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
        computed: {
            centerFont: function () {
                if (!this.loaded) {
                    return;
                }
                return this.graph.center.graphElementServerFormat.font;
            },
            backgroundColor: function () {
                if (!this.loaded) {
                    return;
                }
                return this.graph.center.graphElementServerFormat.colors.background;
            },
            redraws: function () {
                return this.$store.state.redraws;
            },
            zoomScale: function () {
                return "transform: scale(" +
                    this.$store.state.zoom + "," +
                    this.$store.state.zoom + ")";
            }
        },
        watch: {
            "centerServerFormat.label": function () {
                document.title = this.graph.center.getTextOrDefault() + " | MindRespect";
            },
            redraws: function () {
                this.$nextTick(function () {
                    this.redrawKey = Math.random();
                }.bind(this));
            },
            centerFont: function () {
                if (!this.loaded) {
                    return;
                }
                let link = document.createElement("link");
                link.setAttribute("rel", "stylesheet")
                link.setAttribute("type", "text/css")
                let font = this.graph.center.getFont();
                link.setAttribute("href", "http://fonts.googleapis.com/css?family=" + font.family.replace(/ /g, '+'))
                document.getElementsByTagName("head")[0].appendChild(link);
                setTimeout(() => {
                    this.$nextTick(() => {
                        Store.dispatch("redraw");
                    });
                }, 750);
            },
            backgroundColor: function () {
                if (!this.loaded) {
                    return "";
                }
                let backgroundColor = this.graph.center.getBackgroundColor();
                this.backgroundColorStyle = "background:radial-gradient(rgba(0, 0, 0, 0) -10%, " + backgroundColor + " 100%";
                let hsl = Color.hex2Hsl(backgroundColor);
                Color.bubbleBackground = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + 96 + '%)';
            }
        }
    }
</script>

<style>
    #drawn_graph {
        position: absolute;
        padding: 50%;
        top: 0;
        left: 0;
        min-width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1;
    }

    [draggable=true] {
        cursor: move;
        -khtml-user-drag: element;
    }

    .root-vertex-super-container {
        z-index: 3;
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

    .svg-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

</style>
