<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout @contextmenu="showContextMenu" style="height:100%;width:100%;" id="graph-container">
        <v-divider></v-divider>
        <div id="drawn_graph" data-zoom="9" class="vh-center">
            <v-layout class='root-vertex-super-container vh-center'
                      @dragstart="preventUndesirableDragging" :key="childrenKey" @mousedown="mousedown"
                      :style="zoomScale"
            >
                <v-flex grow class="vertices-children-container left-oriented pt-12 pb-12"
                        @dragover="dragOver"
                        @dragleave="dragLeave" @drop="childrenDropLeft" @contextmenu="contextMenuLeft"
                        v-if="center !== null"
                >
                    <v-layout v-for="leftBubble in center.leftBubbles" :key="leftBubble.uiId">
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
                <div class="vh-center center-component-container">
                    <Bubble
                            :bubble="center"
                            direction="center"
                            v-if="center !== null"
                            class="center-component"
                    ></Bubble>
                    <div id="temp-center" v-if="center === null">
                        <v-progress-circular indeterminate color="third" size="75"
                                             style="" v-show="showLoading"></v-progress-circular>
                    </div>
                </div>
                <v-flex grow class="vertices-children-container right-oriented pt-12 pb-12"
                        @dragover="dragOver"
                        @dragleave="dragLeave" @drop="childrenDropRight" @contextmenu="contextMenuRight"
                        v-if="center !== null"
                >
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
            <div
                    class="svg-container"
                    id="graph-svg-container"
                    v-if="redrawKey"
                    :key="redrawKey"
                    v-show="!$store.state.isLoading"
                    style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%;z-index:-1;"
            >
                <svg
                        style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%;z-index:-1;"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        id="edgesSvg"
                >
                    <path
                            :d="svg"
                            fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
                    />
                </svg>
            </div>
        </div>
        <input
                id="background-color-picker"
                v-show="false"
                type="color"
                v-model="backgroundColor"
                @change="changeBackgroundColor"
        >
        <v-menu
                v-model="contextMenu"
                :position-x="xContextMenu"
                :position-y="yContextMenu"
                absolute
                offset-y
        >
            <v-list>
                <v-list-item
                        @click="$refs.addExistingBubbleDialog.enter(xContextMenu, yContextMenu, isContextMenuLeft)"
                        :disabled="!isOwner"
                >
                    <v-list-item-action>
                        <v-icon>scatter_plot</v-icon>
                    </v-list-item-action>
                    <v-list-item-title>{{$t('graph:addExistingBubble')}}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="expandAll" :disabled="!canExpandAll">
                    <v-list-item-action>
                        <v-icon class="">unfold_more</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{$t('button:expandAll')}}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="selectAllBubbles">
                    <v-list-item-action>
                        <v-icon class="">select_all</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{$t('button:selectAllBubbles')}}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="fontPicker" :disabled="!isOwner">
                    <v-list-item-action>
                        <v-icon class="">font_download</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{$t('button:fontPicker')}}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="changeBackgroundColorMenu"
                             :disabled="!changeBackgroundColorCanDo()">
                    <v-list-item-action>
                        <v-icon class="">format_paint</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{$t('button:changeBackgroundColor')}}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-menu>
        <RemoveDialog></RemoveDialog>
        <RemoveTagDialog></RemoveTagDialog>
        <DescriptionDialog></DescriptionDialog>
        <FontDialog></FontDialog>
        <ListView></ListView>
        <CohesionSnackbar v-if="isOwner"></CohesionSnackbar>
        <AddExistingBubbleDialog ref="addExistingBubbleDialog"></AddExistingBubbleDialog>
        <v-bottom-sheet v-model="usePatternSheet" hide-overlay persistent attach="#drawn_graph" no-click-animation
                        :inset="$vuetify.breakpoint.mdAndUp"
                        :content-class="usePatternContentClass">
            <v-sheet class="text-center">
                <v-layout wrap>
                    <v-flex xs12 class="h-center pb-4 pt-4" :class="{
                        'v-center':  !usePatternConfirmFlow
                    }">
                        <v-btn
                                color="secondary"
                                text
                                large
                                @click="usePatternConfirmFlow = true"
                                v-show="!usePatternConfirmFlow"
                                :disabled="usePatternLoading"
                        >
                            <v-icon class="mr-2">
                                stars
                            </v-icon>
                            {{$t('graph:usePattern')}}
                        </v-btn>
                        <v-btn
                                color="primary"
                                text
                                @click="usePatternConfirmFlow = false"
                                v-show="usePatternConfirmFlow"
                                :disabled="usePatternLoading"
                        >
                            {{$t('cancel')}}
                        </v-btn>
                    </v-flex>
                    <v-flex xs12 class="text-center" v-show="usePatternConfirmFlow">
                        <v-card flat>
                            <v-card-text class="subtitle-1 pl-4 pr-4 text-center pb-0 pt-0">
                                <p>
                                    {{$t('graph:usePatternInfo1')}}
                                </p>
                                <p>
                                    {{$t('graph:usePatternInfo2')}}
                                </p>
                            </v-card-text>
                            <v-card-actions class="text-center pt-0">
                                <v-spacer></v-spacer>
                                <v-btn
                                        class="mt-5 mb-5"
                                        color="secondary"
                                        @click="usePattern"
                                        :disabled="usePatternLoading"
                                        :loading="usePatternLoading"
                                >
                                    <v-icon class="mr-2">
                                        stars
                                    </v-icon>
                                    {{$t('confirm')}}
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>

                    </v-flex>
                </v-layout>
            </v-sheet>
        </v-bottom-sheet>
        <!--        <v-btn @click="usePattern"-->
        <!--               fixed-->
        <!--               bottom-->
        <!--               right-->
        <!--               color="secondary"-->
        <!--               style="z-index:2;" class="mr-12 mb-12"-->
        <!--               :disabled="usePatternLoading"-->
        <!--               :loading="usePatternLoading"-->
        <!--               v-if="$store.state.isPatternFlow"-->
        <!--        >-->
        <!--            {{$t('graph:usePattern')}}-->
        <!--        </v-btn>-->
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
    import Dragged from '@/Dragged'
    import I18n from '@/I18n'
    import PatternService from "@/pattern/PatternService";
    import GraphController from '@/graph/GraphController'
    import VertexService from '@/vertex/VertexService'
    import GraphUi from '@/graph/GraphUi'
    import VertexSkeleton from '@/vertex/VertexSkeleton'
    import RelationSkeleton from '@/edge/RelationSkeleton'

    let insideSvgOpacityTransition = false;

    export default {
        name: "Graph",
        components: {
            Bubble,
            RemoveDialog: () => import('@/components/RemoveDialog'),
            RemoveTagDialog: () => import('@/components/RemoveTagDialog'),
            DescriptionDialog: () => import('@/components/DescriptionDialog'),
            FontDialog: () => import('@/components/FontDialog'),
            ListView: () => import('@/components/ListView'),
            CohesionSnackbar: () => import('@/components/CohesionSnackbar'),
            AddExistingBubbleDialog: () => import('@/components/AddExistingBubbleDialog')
        },
        data: function () {
            I18n.i18next.addResources("en", "graph", {
                usePattern: "Use pattern",
                usePatternInfo1: "This entire map will be copied to your centers and its bubbles will be made private.",
                usePatternInfo2: "You can use a pattern many times.",
                addExistingBubble: "Add an existing bubble"
            });
            I18n.i18next.addResources("fr", "graph", {
                usePattern: "Utiliser le pattern",
                usePatternInfo1: "Toute cette carte sera copiée dans vos centres et ses bulles seront rendues privées.",
                usePatternInfo2: "Vous pouvez utiliser un pattern à plusieurs reprises.",
                addExistingBubble: "Ajouter une bulle existante"
            });
            return {
                loaded: false,
                center: null,
                centerServerFormat: null,
                redrawKey: null,
                showLoading: true,
                strokeColor: Color.EdgeColor,
                strokeWidth: this.$vuetify.breakpoint.mdAndDown ? 1 : 2,
                svg: null,
                usePatternLoading: false,
                contextMenu: false,
                xContextMenu: 0,
                yContextMenu: 0,
                isContextMenuLeft: false,
                backgroundColor: null,
                childrenKey: IdUri.uuid(),
                usePatternSheet: null,
                usePatternConfirmFlow: null
            }
        },
        mounted: function () {
            this.showLoading = true;
            this.usePatternConfirmFlow = false;
            CurrentSubGraph.set(SubGraph.empty());
            Selection.reset();
            let centerUri = MindMapInfo.getCenterBubbleUri();
            MindMapInfo.defineIsViewOnly(true);
            let app = document.getElementById("app");
            if (app) {
                app.classList.add("mind-map");
            }
            Color.refreshBackgroundColor(
                this.$route.params.colors && this.$route.params.colors.background ?
                    this.$route.params.colors.background : Color.DEFAULT_BACKGROUND_COLOR
            );
            Scroll.centerElement(
                document.getElementById('temp-center')
            );
            let center = IdUri.isMetaUri(centerUri) ? Meta.withUri(centerUri) : GraphElement.withUri(centerUri);
            if (this.$route.params.nbChild !== undefined) {
                this.center = new VertexSkeleton();
                this.center.makeCenter();
                for (let i = 0; i < this.$route.params.nbChild; i++) {
                    this.center.addChild(
                        new RelationSkeleton(
                            this.center,
                            new VertexSkeleton()
                        )
                    );
                }
                this.$nextTick(async () => {
                    await this.$nextTick();
                    await this.$nextTick();
                    this.strokeColor = Color.SkeletonColor;
                    requestAnimationFrame(() => {
                        this.$store.dispatch("redraw");
                        Breakpoint.set(this.$vuetify.breakpoint);
                        Scroll.goToGraphElement(this.center, true);
                    });
                });
            }
            let promise = center.isMeta() ?
                MetaController.withMeta(center).loadGraph() :
                SubGraphController.withVertex(
                    center
                ).load();
            promise.then(async (_center) => {
                    let center = _center;
                    document.title = center.getTextOrDefault() + " | MindRespect";
                    this.center = center;
                    this.$store.dispatch("redraw", {fadeOut: true});
                    this.handleResize();
                    this.loaded = true;
                    await this.$nextTick();
                    Color.refreshBackgroundColor();
                    Selection.setToSingle(this.center, true);
                    this.$store.dispatch("setIsPatternFlow", this.center.isPattern());
                    this.usePatternSheet = this.center.isPattern();
                    await AppController.refreshFont();
                    await this.$nextTick();
                    if (center.getNumberOfChild() === 0 && center.isLabelEmpty()) {
                        center.focus();
                    }
                    // Scroll.centerElement(this.center.getHtml());
                    Scroll.goToGraphElement(this.center, true).then(async () => {
                        await this.$nextTick();
                        this.showLoading = false;
                        await this.$nextTick();
                        await this.$nextTick();
                        this.strokeColor = Color.EdgeColor;
                        setTimeout(() => {
                            this.$store.dispatch("redraw", {fadeIn: true})
                        }, 10);
                    });
                    CurrentSubGraph.get().component = this;
                }
            ).catch((error) => {
                console.error(error);
                this.$router.push("/")
            });
        },
        created: function () {
            window.addEventListener('resize', this.handleResize);
        },
        beforeDestroy: function () {
            window.removeEventListener('resize', this.handleResize);
        },
        methods: {
            mousedown: function () {
                GraphUi.enableDragScroll();
            },
            refreshChildren: function () {
                this.childrenKey = IdUri.uuid();
            },
            expandAll: function () {
                GraphController.expandAll();
            },
            changeBackgroundColorCanDo: function () {
                return AppController.changeBackgroundColorCanDo();
            },
            changeBackgroundColor: function () {
                CurrentSubGraph.get().center.setBackgroundColor(this.backgroundColor);
                VertexService.saveColors({
                    background: this.backgroundColor
                });
                Color.refreshBackgroundColor(this.backgroundColor);
            },
            selectAllBubbles: function () {
                GraphController.selectAllBubbles();
            },
            fontPicker: function () {
                AppController.fontPicker();
            },
            changeBackgroundColorMenu: function () {
                this.backgroundColor = CurrentSubGraph.get().center.getBackgroundColor();
                this.$nextTick(() => {
                    document.getElementById(
                        "background-color-picker"
                    ).click();
                });
            },
            contextMenuLeft: function (event) {
                this.showContextMenu(event, true);
            },
            contextMenuRight: function (event) {
                this.showContextMenu(event, false);
            },
            showContextMenu: function (event, isLeft) {
                event.preventDefault();
                event.stopPropagation();
                this.contextMenu = false;
                this.xContextMenu = event.clientX;
                this.yContextMenu = event.clientY;
                this.isContextMenuLeft = isLeft;
                this.$nextTick(() => {
                    this.contextMenu = true;
                })
            },
            usePattern: function () {
                this.usePatternLoading = true;
                PatternService.use(
                    this.center.getUri()
                ).then((response) => {
                    this.$router.push(
                        IdUri.htmlUrlForBubbleUri(response.data.uri)
                    );
                    this.usePatternLoading = false;
                })
            },
            dragLeave: function () {
                // console.log("over center leave")
            },
            dragOver: function (event) {
                //must prevent default in drag over in order for drop to work
                event.preventDefault();
                // console.log("over center")
            },
            childrenDropLeft: function (event) {
                Dragged.handleDrop(event, this.center, true);
            },
            childrenDropRight: function (event) {
                Dragged.handleDrop(event, this.center, false);
            },
            preventUndesirableDragging: function (event) {
                if (!event.target.classList.contains("in-bubble-content")) {
                    console.warn("unwanted dragged occurred on " + event.target);
                    event.preventDefault();
                }
            },
            handleResize: function () {
                Breakpoint.set(this.$vuetify.breakpoint);
                this.$store.dispatch("redraw");
                /*
                    cannot scroll center on resize on mobile
                    because it keeps on getting resized because of
                    the constant address bar showing and hiding
                 */
                // if (Selection.isSingle()) {
                //     Scroll.goToGraphElement(Selection.getSingle(), true);
                // }
            }
        },
        computed: {
            canExpandAll: function () {
                return GraphController.expandAllCanDo();
            },
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
            },
            isPatternFlow: function () {
                return this.$store.state.isPatternFlow;
            },
            usePatternContentClass: function () {
                if (this.$vuetify.breakpoint.smAndDown) {
                    return "";
                }
                return this.$store.state.sideMenuFlow === false ?
                    "use-pattern-bottom-sheet-collapsed" :
                    "use-pattern-bottom-sheet-expanded";
            }
        },
        watch: {
            redraws: async function () {
                if (this.showLoading) {
                    return;
                }
                if (this.$store.state.redraws.hide === true) {
                    this.redrawKey = null;
                    return;
                }
                await this.$nextTick();
                requestAnimationFrame(async() => {
                    await this.$nextTick();
                    this.svg = new GraphDraw(this.center).build();
                    this.redrawKey = Math.random();
                    await this.$nextTick();
                    if (this.$store.state.redraws.fadeIn && !insideSvgOpacityTransition) {
                        insideSvgOpacityTransition = true;
                        const graphSvgContainer = document.getElementById("graph-svg-container");
                        graphSvgContainer.style.opacity = '0';
                        graphSvgContainer.style.transition = 'opacity 0s';
                        requestAnimationFrame(() => {
                            graphSvgContainer.style.opacity = '1';
                            graphSvgContainer.style.transition = 'opacity 500ms';
                            setTimeout(() => {
                                insideSvgOpacityTransition = false;
                            }, 500)
                        });
                    }
                    if (this.$store.state.redraws.fadeOut) {
                        const graphSvgContainer = document.getElementById("graph-svg-container");
                        graphSvgContainer.style.opacity = '1';
                        graphSvgContainer.style.transition = 'opacity 0s';
                        requestAnimationFrame(() => {
                            graphSvgContainer.style.opacity = '0';
                            graphSvgContainer.style.transition = 'opacity 250ms';
                        });
                    }
                });
            },
            isPatternFlow: function () {
                this.usePatternSheet = this.$store.state.isPatternFlow;
            }
        }
    }
</script>

<style lang="scss">

    $horizontalPaddingHighest: 3.5;

    @mixin zoom {
        @for $i from 0 through 10 {
            $horizontalPadding: max(1, $horizontalPaddingHighest - ($i * 1.1));
            [data-zoom="#{$i}"] {
                .vertex {
                    .in-bubble-content {
                        max-width: 500px;

                        .bubble-label {
                            white-space: pre-wrap;
                        }
                    }

                    .in-bubble-content {
                        padding: 1em;
                        padding-bottom: 0.5em;
                        padding-top: 0.5em;
                        $buttonExtraSize: max(0, 1.5 - $i * 0.3);
                        $buttonSize: calc(30px + #{$buttonExtraSize}vw);
                        $fontSizeExtra: max(0, 0.5 - $i * 0.1);
                        //button {
                        //  width: $buttonSize;
                        //  height: $buttonSize;
                        //  font-size: calc(1em + #{$fontSizeExtra}vw);
                        //  i {
                        //    $top: 0.25 + max(0, 0.25 - ($i * 0.02));
                        //    top: percentage($top);
                        //  }
                        //}
                        //.menu {
                        //  $menuWidthExtra: $buttonExtraSize * 5;
                        //  width: calc(260px + #{$menuWidthExtra}vw);
                        //}
                    }
                }

                .in-bubble-note-button {
                    $fontSizeExtra: max(0, 8 - $i) / 1.5;
                    //font-size: calc(1.5em + #{$fontSizeExtra}vw);
                    &:before {
                        font-family: FontAwesome;
                        content: "\f02d";
                    }
                }

                .bubble-label {
                    $fontSizeExtra: max(0, 8 - $i / 1.20);
                    //font-size: calc(1em + #{$fontSizeExtra}vw);
                }
            }
        }
    }

    @include zoom;

    .zoom-scale {
        .menu {
            zoom: 30%;
            -moz-transform: scale(0.3);
        }
    }

    .zoom-scale-1 {
        .in-bubble-content {
            zoom: 500%;
            -moz-transform: scale(5);

            .bubble-label {
                //zoom:2000%;
            }
        }

        .bubble-content {
            //zoom:500%;
        }
    }

    [draggable] {
        cursor: move;
        -khtml-user-drag: element; //for safari http://stackoverflow.com/a/3977637
    }

    .not-editable .bubble.single-selected .bubble-label {
        &:after {
            content: "";
            color: grey;
            font-style: italic;
        }
    }

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
        min-width: 200%;
        z-index: 1;
        position: relative;
        /*padding: 100%;*/
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        padding: 0;
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
        /*
        padding-top:150px and padding-bottom:150px
        to try to prevent height jump in Firefox when adding text to a bubble
        */
        padding-top: 150px;
        padding-bottom: 150px;
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

    .after-loaded {
        opacity: 1;
    }

    .use-pattern-bottom-sheet-collapsed {
        margin-left: 95px;
    }

    .use-pattern-bottom-sheet-expanded {
        margin-left: 385px !important;
    }

</style>
