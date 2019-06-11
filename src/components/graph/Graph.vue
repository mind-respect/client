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
                    'blur-overlay': isEditFlow
                }">
                    <v-layout row v-for="leftBubble in leftBubbles" :key="leftBubble.uiId">
                        <v-flex grow :class="{
                                            'mt-3' : leftBubbles.length === 2 && leftBubbles[0].type.isEdge(),
                                            'mb-3' : leftBubbles.length === 2 && leftBubbles[1].type.isEdge()
                                            }">
                            <Bubble :bubbleIds="leftBubble" :parentBubble="centerIds" :parentVertex="centerIds"
                                    direction="left"></Bubble>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex grow class="vh-center">
                    <Bubble :bubbleIds="centerIds" direction="center" :parentBubble="centerIds"
                            :parentVertex="centerIds"></Bubble>
                </v-flex>
                <v-flex grow class="vertices-children-container right-oriented" style="width:7000px;" :class="{
                    'blur-overlay': isEditFlow
                }">
                    <v-layout v-for="rightBubble in rightBubbles" :key="rightBubble.uiId">
                        <v-flex grow :class="{
                                                'mt-3' : rightBubbles.length === 2 && rightBubbles[0].type.isEdge(),
                                                'mb-3' : rightBubbles.length === 2 && rightBubbles[1].type.isEdge()
                                            }">
                            <Bubble :bubbleIds="rightBubble" :parentBubble="centerIds" :parentVertex="centerIds"
                                    direction="right"></Bubble>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <div style="width:8000px;"></div>
            <div class="svg-container" style="z-index:-1">
                <!--                <transition name="fade">-->
                <GraphDrawing :centerIds="centerIds" :key="redrawKey" v-if="redrawKey"></GraphDrawing>
                <!--                </transition>-->
            </div>
        </div>
        <RemoveDialog></RemoveDialog>
        <DescriptionDialog></DescriptionDialog>
        <FontDialog></FontDialog>
        <ListView></ListView>
    </div>
    <!--<div :style="'width:' + rightWidth() + 'px'"></div>-->
</template>

<script>
    import MindMapInfo from '@/MindMapInfo'
    import IdUri from '@/IdUri'
    import Bubble from '@/components/graph/Bubble'
    import GraphDrawing from '@/components/graph/GraphDrawing'
    import MainMenus from '@/components/graph/MainMenus'
    import ListView from '@/components/ListView'
    import SelectionHandler from '@/SelectionHandler'
    import SubGraphController from '@/graph/SubGraphController'
    import Vertex from '@/vertex/Vertex'
    import Meta from '@/identifier/Meta'
    import RemoveDialog from '@/components/RemoveDialog'
    import DescriptionDialog from '@/components/DescriptionDialog'
    import FontDialog from '@/components/FontDialog'
    import SubGraph from '@/graph/SubGraph'
    import Store from '@/store'
    import Color from '@/Color'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'

    let graph = null;

    export default {
        name: "Graph",
        components: {
            Bubble,
            RemoveDialog,
            DescriptionDialog,
            FontDialog,
            GraphDrawing,
            MainMenus,
            ListView
        },
        data: function () {
            return {
                loaded: false,
                center: null,
                centerIds: null,
                redrawKey: null,
                backgroundColorStyle: ""
            }
        },
        mounted: function () {
            CurrentSubGraph.set(SubGraph.empty());
            SelectionHandler.removeAll();
            let centerUri = MindMapInfo.getCenterBubbleUri();
            let center = IdUri.isMetaUri(centerUri) ? Meta.withUri(centerUri) : Vertex.withUri(centerUri);
            center.makeCenter();
            let promise = center.isMeta() ?
                center.getController().loadGraph(center) :
                SubGraphController.withVertex(
                    center
                ).load();
            promise.then((_graph) => {
                graph = _graph;
                let center = graph.center;
                center.makeCenter();
                CurrentSubGraph.set(graph);
                this.center = center;
                this.centerIds = CurrentSubGraph.graphElementAsId(this.center);
                this.loaded = true;
                this.$nextTick(() => {
                    SelectionHandler.setToSingle(graph.center);
                })
            }).catch((error) => {
                console.error(error);
                this.$router.push("/")
            })
        },
        methods: {
            setupForMeta: function () {

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
                graph.center.leftBubbles.forEach(function (leftBubble) {
                    nbBubbles += leftBubble.getNumberOfChildDeep();
                });
                return nbBubbles;
            },
            nbBubblesRight: function () {
                let nbBubbles = 0;
                graph.center.rightBubbles.forEach(function (leftBubble) {
                    nbBubbles += leftBubble.getNumberOfChildDeep();
                });
                return nbBubbles;
            }
        },
        computed: {
            leftBubbles: function () {
                return this.center.leftBubbles;
            },
            rightBubbles: function () {
                return this.center.rightBubbles;
            },
            isEditFlow: function () {
                return this.center.isEditFlow;
            },
            centerFont: function () {
                if (!this.loaded) {
                    return;
                }
                return graph.center.graphElementServerFormat.font;
            },
            backgroundColor: function () {
                if (!this.loaded) {
                    return;
                }
                return graph.center.graphElementServerFormat.colors.background;
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
            // "centerServerFormat.label": function () {
            //     document.title = graph.center.getTextOrDefault() + " | MindRespect";
            // },
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
                link.setAttribute("rel", "stylesheet");
                link.setAttribute("type", "text/css");
                let font = graph.center.getFont();
                link.setAttribute("href", "https://fonts.googleapis.com/css?family=" + font.family.replace(/ /g, '+'))
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
                let backgroundColor = graph.center.getBackgroundColor();
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
