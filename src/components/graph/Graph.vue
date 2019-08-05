<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout v-if="loaded">
        <v-divider></v-divider>
        <div row id="drawn_graph" data-zoom="9" class="vh-center" :style="backgroundColorStyle">
            <v-layout row class='root-vertex-super-container vh-center' :style="zoomScale"
                      @dragstart="preventUndesirableDragging">
                <v-flex grow class="vertices-children-container left-oriented">
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
                <v-flex grow class="vertices-children-container right-oriented">
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
            <div class="svg-container" v-if="!$store.state.isEditFlow">
                <!--                <transition name="fade">-->
                <GraphDrawing :center="center" :key="redrawKey" v-if="redrawKey"></GraphDrawing>
                <!--                </transition>-->
            </div>
        </div>
        <RemoveDialog></RemoveDialog>
        <RemoveTagDialog></RemoveTagDialog>
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
    import ListView from '@/components/ListView'
    import Selection from '@/Selection'
    import SubGraphController from '@/graph/SubGraphController'
    import Meta from '@/identifier/Meta'
    import RemoveDialog from '@/components/RemoveDialog'
    import RemoveTagDialog from '@/components/RemoveTagDialog'
    import DescriptionDialog from '@/components/DescriptionDialog'
    import FontDialog from '@/components/FontDialog'
    import Color from '@/Color'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import SubGraph from '@/graph/SubGraph'
    import Scroll from '@/Scroll'
    import AppController from '@/AppController'
    import Breakpoint from '@/Breakpoint'
    import MetaController from '@/identifier/MetaController'
    import GraphElement from "@/graph-element/GraphElement";


    export default {
        name: "Graph",
        components: {
            Bubble,
            RemoveDialog,
            RemoveTagDialog,
            DescriptionDialog,
            FontDialog,
            GraphDrawing,
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
            window.addEventListener('resize', this.handleResize);
            CurrentSubGraph.set(SubGraph.empty());
            Selection.reset();
            let centerUri = MindMapInfo.getCenterBubbleUri();
            let center = IdUri.isMetaUri(centerUri) ? Meta.withUri(centerUri) : GraphElement.withUri(centerUri);
            let promise = center.isMeta() ?
                MetaController.withMeta(center).loadGraph() :
                SubGraphController.withVertex(
                    center
                ).load();
            promise.then(async (_center) => {
                let center = _center;
                center.makeCenter();
                document.title = center.getTextOrDefault() + " | MindRespect";
                this.center = center;
                this.handleResize();
                this.loaded = true;
                let app = document.getElementById("app");
                if (app) {
                    app.classList.add("mind-map");
                }
                await this.$nextTick();
                Color.refreshBackgroundColor();
                AppController.refreshFont();
                Selection.setToSingle(this.center);
                await this.$nextTick();
                Scroll.goToGraphElement(this.center);
                if(center.getNumberOfChild() === 0 && center.isLabelEmpty()){
                    center.focus();
                }
            }).catch((error) => {
                console.error(error);
                this.$router.push("/")
            })
        },
        methods: {
            preventUndesirableDragging: function (event) {
                if (!event.target.classList.contains("in-bubble-content")) {
                    console.warn("unwanted dragged occurred on " + event.target);
                    event.preventDefault();
                }
            },
            handleResize: function () {
                this.redrawKey = Math.random();
                if (Selection.isSingle()) {
                    Scroll.centerBubbleIfApplicable(Selection.getSingle());
                }
                Breakpoint.set(this.$vuetify.breakpoint)
            }
        },
        beforeDestroy: function () {
            window.removeEventListener('resize', this.handleResize)
        },
        computed: {
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
        padding: 0;
        min-height: 200%;
        min-width: 200%;
        z-index: 1;
        position: relative;
        /*padding: 100%;*/
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        padding-top: 15%;
        padding-bottom: 15%;
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
        z-index:-1;
    }

    #app.mind-map {
        background: none !important;
    }
</style>
