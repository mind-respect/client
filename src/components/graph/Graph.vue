<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout v-if="loaded">
        <v-divider></v-divider>
        <MainMenus></MainMenus>
        <div row id="drawn_graph" data-zoom="9" class="vh-center" :style="backgroundColorStyle">
            <v-layout row class='root-vertex-super-container vh-center' :style="zoomScale"
                      @dragstart="preventUndesirableDragging">
                <v-flex grow class="vertices-children-container left-oriented" :class="{
                    'blur-overlay': center.isEditFlow
                }">
                    <v-layout row v-for="leftBubble in center.leftBubbles" :key="leftBubble.uiId">
                        <v-flex grow :class="{
                        'mt-3' : center.leftBubbles.length === 2 && center.leftBubbles[0].isEdge(),
                        'mb-3' : center.leftBubbles.length === 2 && center.leftBubbles[1].isEdge()
                        }">
                            <Bubble
                                    :bubble="leftBubble"
                                    direction="left"
                            ></Bubble>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <div class="vh-center">
                    <Bubble
                            :bubble="center"
                            direction="center"
                    ></Bubble>
                </div>
                <v-flex grow class="vertices-children-container right-oriented" :class="{
                    'blur-overlay': center.isEditFlow
                }">
                    <v-layout v-for="rightBubble in center.rightBubbles" :key="rightBubble.uiId">
                        <v-flex grow :class="{
                            'mt-3' : center.rightBubbles.length === 2 && center.rightBubbles[0].isEdge(),
                            'mb-3' : center.rightBubbles.length === 2 && center.rightBubbles[1].isEdge()
                        }">
                            <Bubble
                                    :bubble="rightBubble"
                                    direction="right"
                            ></Bubble>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <div class="svg-container" style="z-index:-1">
                <transition name="fade">
                    <GraphDrawing :center="center" :key="redrawKey" v-if="redrawKey"></GraphDrawing>
                </transition>
            </div>
        </div>
        <RemoveDialog></RemoveDialog>
        <DescriptionDialog></DescriptionDialog>
        <FontDialog></FontDialog>
        <ListView></ListView>
    </v-layout>
</template>

<script>
    import MindMapInfo from '@/MindMapInfo'
    import IdUri from '@/IdUri'
    import Bubble from '@/components/graph/Bubble'
    import GraphDrawing from '@/components/graph/GraphDrawing'
    import MainMenus from '@/components/graph/MainMenus'
    import ListView from '@/components/ListView'
    import Selection from '@/Selection'
    import SubGraphController from '@/graph/SubGraphController'
    import Vertex from '@/vertex/Vertex'
    import Meta from '@/identifier/Meta'
    import RemoveDialog from '@/components/RemoveDialog'
    import DescriptionDialog from '@/components/DescriptionDialog'
    import FontDialog from '@/components/FontDialog'
    import Store from '@/store'
    import Color from '@/Color'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import SubGraph from '@/graph/SubGraph'
    import Scroll from '@/Scroll'


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
                centerServerFormat: null,
                redrawKey: null,
                backgroundColorStyle: ""
            }
        },
        mounted: function () {
            CurrentSubGraph.set(SubGraph.empty());
            Selection.removeAll();
            let centerUri = MindMapInfo.getCenterBubbleUri();
            let center = IdUri.isMetaUri(centerUri) ? Meta.withUri(centerUri) : Vertex.withUri(centerUri);
            center.makeCenter();
            let promise = center.isMeta() ?
                center.getController().loadGraph(center) :
                SubGraphController.withVertex(
                    center
                ).load();
            promise.then(async (graph) => {
                let center = graph.center;
                center.makeCenter();
                document.title = center.getTextOrDefault() + " | MindRespect";
                CurrentSubGraph.set(graph);
                this.center = center;
                this.loaded = true;
                let app = document.getElementById("app");
                if (app) {
                    app.classList.add("mind-map");
                }
                await this.$nextTick();
                Selection.setToSingle(this.center);
                await this.$nextTick();
                Scroll.goToGraphElement(this.center);
            }).catch((error) => {
                console.error(error);
                this.$router.push("/")
            })
        },
        methods: {
            preventUndesirableDragging: function (event) {
                if (!event.target.classList.contains("in-bubble-content")) {
                    event.preventDefault();
                }
            }
        },
        computed: {
            centerFont: function () {
                if (!this.loaded) {
                    return;
                }
                return this.center.graphElementServerFormat.font;
            },
            backgroundColor: function () {
                if (!this.loaded) {
                    return;
                }
                return this.center.graphElementServerFormat.colors.background;
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
            redraws: async function () {
                await this.$nextTick();
                this.redrawKey = Math.random();
            },
            centerFont: function () {
                if (!this.loaded) {
                    return;
                }
                let link = document.createElement("link");
                link.setAttribute("rel", "stylesheet")
                link.setAttribute("type", "text/css")
                let font = this.center.getFont();
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
                let backgroundColor = this.center.getBackgroundColor();
                this.backgroundColorStyle = "background:radial-gradient(rgba(0, 0, 0, 0) 15%, " + backgroundColor + " 100%";
                let hsl = Color.hex2Hsl(backgroundColor);
                Color.bubbleBackground = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + 96 + '%)';
            }
        }
    }
</script>

<style>
    #drawn_graph {
        /*position: absolute;*/
        /*padding: 25%;*/
        /*top: 0;*/
        /*left: 0;*/
        /*min-width: 100%;*/
        /*min-height:100%;*/
        /*display: flex;*/
        /*justify-content: center;*/
        /*align-items: center;*/
        /*overflow-x: scroll;*/
        padding: 0;
        min-height: 100%;
        min-width: 100%;
        z-index: 1;
        position: relative;
        /*padding: 100%;*/
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        padding-top: 10%;
        padding-bottom: 10%;
    }

    [draggable=true] {
        cursor: move;
        -khtml-user-drag: element;
    }

    .root-vertex-super-container {
        z-index: 3;
        width: 100%;
        height: 100%;
        margin-left: 600px !important;
        margin-right: 900px !important;
        margin-top: 150px;
        margin-bottom: 150px;
        /*padding:25% !important;*/
    }

    .root-vertex-super-container > .vertices-children-container {
        /*max-width:inherit;*/

    }

    .root-vertex-super-container > .vertices-children-container.left-oriented {
        /*display: flex;*/
        /*max-width: inherit;*/
    }

    .root-vertex-super-container > .vertices-children-container.right-oriented {
        /*display: flex;*/
        /*max-width: inherit;*/
        /*padding-right:100%;*/
    }

    .svg-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    #app.mind-map {
        background: none !important;
    }
</style>
