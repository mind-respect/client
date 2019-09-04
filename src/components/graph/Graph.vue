<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout v-if="loaded">
        <v-divider></v-divider>
        <div id="drawn_graph" data-zoom="9" class="vh-center" :style="backgroundColorStyle">
            <!--            <v-overlay-->
            <!--                    :value="showLoading"-->
            <!--                    absolute-->
            <!--                    z-index="100"-->
            <!--            >-->
            <!--            </v-overlay>-->
            <v-layout class='root-vertex-super-container vh-center' :style="zoomScale"
                      @dragstart="preventUndesirableDragging">
                <v-overlay
                        :value="showLoading"
                        absolute
                        z-index="50"
                        opacity="0"
                >
                    <v-progress-circular indeterminate color="third" size="64"></v-progress-circular>
                </v-overlay>
                <v-flex grow class="vertices-children-container left-oriented" :class="{
                    'before-loaded': showLoading
                }">
                    <v-layout v-for="leftBubble in center._leftBubbles" :key="leftBubble.uiId">
                        <v-flex grow :class="{
                        'mt-3' : center._leftBubbles.length === 2 && center._leftBubbles[0].isEdge(),
                        'mb-3' : center._leftBubbles.length === 2 && center._leftBubbles[1].isEdge()
                        }">
                            <Bubble
                                    :bubble="leftBubble"
                                    direction="left"
                            ></Bubble>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <div class="vh-center" :class="{
                    'before-loaded': showLoading
                }">
                    <Bubble
                            :bubble="center"
                            direction="center"
                    ></Bubble>
                </div>
                <v-flex grow class="vertices-children-container right-oriented" :class="{
                    'before-loaded': showLoading
                }">
                    <v-layout v-for="rightBubble in center._rightBubbles" :key="rightBubble.uiId">
                        <v-flex grow :class="{
                            'mt-3' : center._rightBubbles.length === 2 && center._rightBubbles[0].isEdge(),
                            'mb-3' : center._rightBubbles.length === 2 && center._rightBubbles[1].isEdge()
                        }">
                            <Bubble
                                    :bubble="rightBubble"
                                    direction="right"
                            ></Bubble>
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
            <div class="svg-container" v-if="redrawKey" :key="redrawKey"
                 v-show="!$store.state.isEditFlow && center.draw && !$store.state.isLoading && !center.isEditFlow">
                <svg
                        style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%;z-index:-1;"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg">
                    <path
                            :d="svg()"
                            fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
                    />
                </svg>
            </div>
        </div>
        <RemoveDialog></RemoveDialog>
        <RemoveTagDialog></RemoveTagDialog>
        <DescriptionDialog></DescriptionDialog>
        <FontDialog></FontDialog>
        <ListView></ListView>
        <CohesionSnackbar v-if="isOwner"></CohesionSnackbar>
    </v-layout>
</template>

<script>
    import MindMapInfo from '@/MindMapInfo'
    import IdUri from '@/IdUri'
    import Bubble from '@/components/graph/Bubble'
    import Selection from '@/Selection'
    import SubGraphController from '@/graph/SubGraphController'
    import Meta from '@/identifier/Meta'
    import Color from '@/Color'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import SubGraph from '@/graph/SubGraph'
    import Scroll from '@/Scroll'
    import AppController from '@/AppController'
    import Breakpoint from '@/Breakpoint'
    import MetaController from '@/identifier/MetaController'
    import GraphElement from "@/graph-element/GraphElement";
    import GraphDraw from '@/draw/GraphDraw'

    export default {
        name: "Graph",
        components: {
            Bubble,
            RemoveDialog: () => import('@/components/RemoveDialog'),
            RemoveTagDialog: () => import('@/components/RemoveTagDialog'),
            DescriptionDialog: () => import('@/components/DescriptionDialog'),
            FontDialog: () => import('@/components/FontDialog'),
            ListView: () => import('@/components/ListView'),
            CohesionSnackbar: () => import('@/components/CohesionSnackbar')
        },
        data: function () {
            return {
                loaded: false,
                centerServerFormat: null,
                redrawKey: null,
                backgroundColorStyle: "",
                showLoading: true,
                strokeColor: "#1a237e",
                strokeWidth: this.$vuetify.breakpoint.mdAndDown ? 1 : 2
            }
        },
        mounted: function () {
            this.showLoading = true;
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
                Selection.setToSingle(this.center);
                AppController.refreshFont();
                await this.$nextTick();
                if (center.getNumberOfChild() === 0 && center.isLabelEmpty()) {
                    center.focus();
                }
                Scroll.goToGraphElement(this.center, true).then(async () => {
                    await this.$nextTick();
                    this.showLoading = false;
                    await this.$nextTick();
                    this.redrawKey = Math.random();
                })
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
            },
            svg: function () {
                return new GraphDraw(CurrentSubGraph.get().center).build();
            }
        },
        beforeDestroy: function () {
            window.removeEventListener('resize', this.handleResize)
        },
        computed: {
            isOwner: function () {
                if (!this.$store.state.user) {
                    return false;
                }
                return this.$route.params.username === this.$store.state.user.username
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
                if (this.showLoading) {
                    return;
                }
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
        z-index: -1;
    }

    #app.mind-map {
        background: none !important;
    }

    .before-loaded {
        opacity: 0;
    }

    .after-loaded {
        opacity: 1;
    }
</style>
