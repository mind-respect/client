<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
        <v-flex xs12>
            <v-flex xs12 class="pt-1 dotted-border-top"
                    @dragover="topDragEnter"
                    @dragleave="resetTopBottomDragOver"
                    @drop="topDrop"
                    @click="click"
                    @dblclick="dblclick"
                    @contextmenu="rightClick"
                    v-if="(bubble.isEdge() || bubble.isGroupRelation()) && !isNextBubbleExpanded"
            ></v-flex>
            <v-flex xs12
                    style="position:relative;"
                    class="dotted-border-top"
                    v-if="bubble.isVertexType() && !bubble.isCenter"
            ></v-flex>
        </v-flex>
        <v-layout
                row :class="{
        'vertex-tree-container': !isCenter,
        'bubble-container': isCenter
    }" :id="containerId">
            <v-flex class="v-center drop-relative-container">
                <v-spacer v-if="isLeft"></v-spacer>
                <div v-if="!isCollapsed || isCenter">
                    <div :class="{
                   'blur-overlay':(isEditFlow || isBubbleLoading) && bubble.isVertexType()
                }"
                    >
                        <Children
                                :bubble="bubble"
                                direction="left"
                                  v-if="
                                        isLeft && !isCenter &&
                                          (
                                            (bubble.isVertexType() && bubble.rightBubbles.length > 0) ||
                                            (bubble.isGroupRelation() && bubble._sortedImmediateChild && bubble._sortedImmediateChild.length > 0) ||
                                            bubble.isEdge()
                                          )
                                      "
                        >
                        </Children>
                    </div>
                </div>
                <div class='bubble-container v-center'
                     :class="{
                'vh-center':isCenter,
                'left':!isLeft && !isCenter,
                'pl-5': (isLeaf && isLeft) || (isCenter && bubble.leftBubbles.length === 0),
                'pr-5': (isLeaf && !isLeft) || (isCenter && bubble.rightBubbles.length === 0),
                'w-500': (isLeaf && isLeft)
            }"
                     :id="bubble.uiId"
                >

                    <div
                            v-if="!isCenter"
                            class="arrowTopBottomContainer"
                            :class="{
                                'top-bottom-left-side text-xs-right': isLeft,
                                'top-bottom-right-side': !isLeft,
                                'vertex-drop-arrow-top':bubble.isVertexType(),
                                'edge-drop-arrow-top':!bubble.isVertexType()
                            }">
                        <v-icon v-for="i in 5" small
                                style="overflow-x: hidden"
                                class="unselectable"
                                :class="{
                                    'red--text': isTopDragOver,
                                    'transparent--text': !isTopDragOver,
                                    'ml-4 fa-flip-horizontal': isLeft,
                                    'mr-4': !isLeft
                                }">
                            arrow_forward
                        </v-icon>
                    </div>

                    <div
                            v-if="!isCenter"
                            class="vertex-drop-arrow-top-bottom-drop top-vertex-arrow-drop"
                            @dragover="topDragEnter"
                            @dragleave="resetTopBottomDragOver"
                            @drop="topDrop"
                            @click="click"
                            @dblclick="dblclick"
                            @contextmenu="rightClick"
                    ></div>
                    <div class="vertex-left-right-drop"
                         v-if="isCenter || isLeft"
                         @dragover="leftRightDragEnter"
                         @dragleave="leftRightDragLeave"
                         @drop="leftDrop"
                         style="left:0;">
                    </div>
                    <v-spacer v-if="isLeft && isLeaf"></v-spacer>
                    <div
                            v-if="bubble.isVertexType()"
                            class="bubble vertex graph-element relative vh-center" :class="{
                        'selected' : (isSelected || isLabelDragOver || isLeftRightDragOver),
                        'center-vertex': isCenter,
                        'reverse': isLeft && !isCenter
                }"
                    >
                        <div class="image_container"></div>
                        <div class="in-bubble-content-wrapper">
                            <v-menu
                                    lazy
                                    v-model="showMenu"
                                    :value="isSelected"
                                    max-width="250"
                                    :nudge-width="250"
                                    auto
                                    right
                                    color="white"
                                    offset-y
                            >
                                <div
                                        slot="activator"
                                        class="in-bubble-content vh-center"
                                        :class="{
                                            'reverse': isLeft
                                    }"
                                        @click="click"
                                        @dblclick="dblclick"
                                        @mousedown="mouseDown"
                                        @dragstart="dragStart"
                                        @dragend="dragEnd"
                                        @contextmenu="rightClick"
                                        :draggable="!isCenter"
                                        :style="background"
                                >
                                    <div
                                            class="in-label-buttons text-xs-center mt-0"
                                            style="height:100%;"
                                            :class="{
                                                     'in-label-icons-right': !isLeft && !isCenter,
                                                     'in-label-icons-left': isLeft && !isCenter
                                                    }"
                                    >
                                        <v-icon small color="secondary" v-if="isCenter">
                                            filter_center_focus
                                        </v-icon>
                                        <v-icon small color="secondary" v-if="hasComment">
                                            note
                                        </v-icon>
                                        <v-icon small color="secondary" v-if="hasIdentifications">
                                            label
                                        </v-icon>
                                        <v-icon small color="secondary" v-if="isPrivate">
                                            lock
                                        </v-icon>
                                        <v-icon small color="secondary" v-if="isPublic">
                                            public
                                        </v-icon>
                                        <v-icon small color="secondary" v-if="isFriendsOnly">
                                            people
                                        </v-icon>
                                    </div>
                                    <v-menu
                                            lazy
                                            v-model="linkMenu"
                                            auto
                                            offset-y
                                    >
                                        <v-badge color="third" slot="activator">
                                            <template v-slot:badge v-if="bubble.isMeta()">
                                                <v-icon dark>label</v-icon>
                                            </template>
                                            <div
                                                    class="bubble-label ui-autocomplete-input bubble-size font-weight-regular mb-1"
                                                    @blur="leaveEditFlow"
                                                    @dragover="labelDragEnter"
                                                    @dragleave="labelDragLeave"
                                                    @drop="labelDrop"
                                                    :data-placeholder="$t('vertex:default')"
                                                    v-html="label"
                                                    @focus="focus"
                                                    @keydown="keydown"
                                                    :style="labelFont"
                                                    ref="vertexLabel"
                                            ></div>
                                        </v-badge>
                                        <v-card :href="linkMenuHref" target="_blank">
                                            <v-card-title>
                                                <v-icon class="mr-2">share</v-icon>
                                                {{$t('vertex:openLink')}}
                                            </v-card-title>
                                        </v-card>
                                    </v-menu>
                                </div>
                                <div :style="background">
                                    <BubbleButtons></BubbleButtons>
                                </div>
                            </v-menu>
                        </div>
                        <ChildNotice :bubble="bubble"
                                     class=""
                                     v-if="canExpand"></ChildNotice>
                    </div>
                    <div
                            class="vertex-drop-arrow-top-bottom-drop bottom-vertex-drop-arrow-drop"
                            @click="click"
                            @dblclick="dblclick"
                            @contextmenu="rightClick"
                            @dragover="bottomDragEnter" @dragleave="resetTopBottomDragOver" @drop="bottomDrop"
                    ></div>
                    <div @dragover="bottomDragEnter"
                         @drop="bottomDrop"
                         @click="click"
                         @dblclick="dblclick"
                         @contextmenu="rightClick"
                         class="arrowTopBottomContainer"
                         :class="{
                            'top-bottom-left-side text-xs-right': isLeft && !isCenter,
                            'top-bottom-right-side': !isLeft && !isCenter,
                            'vertex-drop-arrow-bottom':bubble.isVertexType(),
                            'edge-drop-arrow-bottom':!bubble.isVertexType()
                        }">
                        <v-icon v-for="i in 5" small
                                class="unselectable"
                                :class="{
                        'red--text' : isBottomDragOver,
                        'transparent--text': !isBottomDragOver,
                        'ml-4 fa-flip-horizontal': isLeft,
                        'mr-4': !isLeft
                    }">
                            arrow_forward
                        </v-icon>
                    </div>
                    <div class="vertex-left-right-drop"
                         v-if="isCenter || !isLeft"
                         @dragover="leftRightDragEnter"
                         @dragleave="leftRightDragLeave"
                         @drop="rightDrop"
                         style="right:0;">
                    </div>
                    <div
                            v-if="bubble.isEdge() || bubble.isGroupRelation()"
                            class="bubble relation graph-element relative pt-0 pb-0 mt-0 mb-0"
                            :class="{
                            'selected' : isSelected,
                            'reverse': isLeft && !isCenter
                    }">
                        <div class="image_container"></div>
                        <div class="in-bubble-content"
                             @click="click"
                             @dblclick="dblclick"
                             @mousedown="mouseDown"
                             @dragstart="dragStart"
                             @dragend="dragEnd"
                             draggable="true"
                             :class="{
                                'pl-5 pr-1': !bubble.isGroupRelation() && ( (isLeft && !isInverse) || (!isLeft && isInverse)),
                                'pl-1 pr-5': !bubble.isGroupRelation() && ( (isLeft && isInverse) || (!isLeft && !isInverse)),
                                'pl-4': (bubble.isGroupRelation() && !isLeft),
                                'pr-4': (bubble.isGroupRelation() && isLeft)
                             }"
                        >
                            <div class="label-container">
                                <v-chip color="secondary"
                                        small
                                        @dragover="labelDragEnter"
                                        @dragleave="labelDragLeave"
                                        @drop="labelDrop"
                                        :selected="isSelected || isLabelDragOver"
                                        class="pt-0 pb-0 mt-0 mb-0 ma-0 pa-0 label-chip"
                                        dark
                                        transition="none"
                                        :class="{
                                        'is-shrinked' : isShrinked
                                    }"
                                >
                                    <div class="bubble-label white--text"
                                         @blur="leaveEditFlow"
                                         :data-placeholder="relationPlaceholder"
                                         @focus="focus"
                                         v-show="!isShrinked"
                                         v-text="label"
                                         @keydown="keydown"
                                         :style="labelFont"
                                    ></div>
                                </v-chip>
                            </div>
                        </div>
                        <ChildNotice :bubble="bubble"
                                     class=""
                                     v-if="canExpand"></ChildNotice>
                    </div>
                </div>
                <div v-if="!isCollapsed || isCenter">
                    <div :class="{
                   'blur-overlay':(isEditFlow || isBubbleLoading) && bubble.isVertexType()
                }"
                    >
                        <Children :bubble="bubble"
                                  direction="right"
                                  v-if="
                                      !isLeft && !isCenter &&
                                      (
                                        (bubble.isVertexType() && bubble.rightBubbles.length > 0) ||
                                        (bubble.isGroupRelation() && bubble._sortedImmediateChild && bubble._sortedImmediateChild.length > 0) ||
                                        bubble.isEdge()
                                      )
                                      "
                        >
                        </Children>
                    </div>
                </div>
            </v-flex>
        </v-layout>
        <v-flex xs12
                class="dotted-border-bottom"
                v-if="bubble.isVertexType() && !isCenter"
        ></v-flex>
        <v-flex xs12 class="pb-1 dotted-border-bottom"
                @dragover="bottomDragEnter" @dragleave="resetTopBottomDragOver" @drop="bottomDrop"
                v-if="(bubble.isEdge() || bubble.isGroupRelation()) && !isNextBubbleExpanded"
        ></v-flex>
    </div>
</template>

<script>
    import SelectionHandler from '@/SelectionHandler'
    import UiUtils from '@/UiUtils'
    import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
    import KeyCode from 'keycode-js';
    import Children from '@/components/graph/Children'
    import ChildNotice from '@/components/graph/ChildNotice'
    import BubbleButtons from '@/components/graph/BubbleButtons'
    import GraphUi from '@/graph/GraphUi'
    import IdUri from '@/IdUri'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import Color from '@/Color'
    import MindMapInfo from '@/MindMapInfo'
    import linkifyHtml from 'linkifyjs/html'

    export default {
        name: "Bubble",
        props: [
            'bubble',
            'direction'
        ],
        components: {
            Children,
            ChildNotice,
            BubbleButtons
        },
        data: function () {
            return {
                containerId: "",
                isSelected: false,
                loaded: false,
                isLabelDragOver: false,
                dragOverLabelTimeout: undefined,
                isContainerDragOver: false,
                dragOverTopBottomTimeout: undefined,
                isTopDragOver: null,
                isBottomDragOver: null,
                isLeftRightDragOver: null,
                showMenu: false,
                linkMenu: false,
                linkMenuHref: null
            }
        },
        mounted: async function () {
            this.bubble.loading = false;
            this.bubble.isEditFlow = false;
            this.bubble.direction = this.direction;
            this.isCenter = this.bubble.isCenter !== undefined && this.bubble.isCenter;
            this.isLeft = this.direction === "left";
            if (this.isCenter) {
                this.containerId = "center";
            } else {
                this.containerId = IdUri.uuid();
            }
            this.loaded = true;
        },
        computed: {
            _sortedImmediateChild: function () {
                return this.bubble._sortedImmediateChild;
            },
            isNextBubbleExpanded: function () {
                return this.bubble.getNextBubble().isExpanded;
            },
            label: function () {
                return this.bubble.getFriendlyJson().label;
            },
            isInverse: function () {
                return this.bubble.isInverse();
            },
            hasIdentifications: function () {
                return this.bubble.hasIdentifications();
            },
            hasComment: function () {
                return this.bubble.hasComment();
            },
            leftBubbles: function () {
                return this.bubble.leftBubbles ?
                    this.bubble.leftBubbles :
                    [];
            },
            rightBubbles: function () {
                return this.bubble.rightBubbles ?
                    this.bubble.rightBubbles :
                    [];
            },
            isCollapsed: function () {
                return this.bubble.isCollapsed;
            },
            isBubbleLoading: function () {
                return this.bubble.loading;
            },
            isEditFlow: function () {
                return this.bubble.isEditFlow;
            },
            isPublic: function () {
                return this.bubble.isPublic();
            },
            isPrivate: function () {
                return this.bubble.isPrivate();
            },
            isFriendsOnly: function () {
                return this.bubble.isFriendsOnly();
            },
            isLeaf: function () {
                return this.bubble.isLeaf();
            },
            canExpand: function () {
                return this.bubble.canExpand();
            },
            label: function () {
                let doc = new DOMParser().parseFromString(this.bubble.getFriendlyJson().label, 'text/html');
                let text = doc.body.textContent || "";
                return this.isEditFlow ? text : linkifyHtml(text);

            },
            background: function () {
                return this.isSelected && Color.bubbleBackground ?
                    "background-color:" + Color.bubbleBackground :
                    "";
            },
            labelFont: function () {
                let font = CurrentSubGraph.get().center.getFont();
                return "font-family:" + font.family;
            },
            selected: () => SelectionHandler.selected,
            relationPlaceholder: function () {
                return this.bubble.isGroupRelation() || this.isSelected || this.isLabelDragOver ? this.$t('edge:default') : "";
            },
            isShrinked: function () {
                if (this.isSelected || this.isLabelDragOver) {
                    return false;
                }
                return this.bubble.isShrinked();
            }
        },
        methods: {
            rightClick: function (event) {
                event.preventDefault();
                this.showMenu = true;
                SelectionHandler.setToSingle(this.bubble)
            },
            click: function (event) {
                event.stopPropagation();
                if (this.isEditFlow) {
                    return;
                }
                if (event.target.tagName === "A") {
                    event.preventDefault();
                    this.linkMenuHref = event.target.href;
                    this.linkMenu = true;
                } else {
                    this.linkMenu = false;
                }
                GraphUi.enableDragScroll();
                if (UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey) {
                    if (this.bubble.isSelected) {
                        SelectionHandler.remove(this.bubble);
                    } else {
                        SelectionHandler.add(this.bubble);
                    }
                } else {
                    SelectionHandler.setToSingle(
                        this.bubble
                    );
                }
            },
            dblclick: function (event) {
                if (MindMapInfo.isViewOnly()) {
                    return;
                }
                if (this.isEditFlow) {
                    return;
                }
                this.bubble.focus(event);
            },
            leaveEditFlow: function () {
                this.bubble.isEditFlow = false;
                this.bubble.isEditFlow = false;
                let labelHtml = this.bubble.getLabelHtml();
                labelHtml.contentEditable = "false";
                this.bubble.setLabel(labelHtml.innerHTML);
                FriendlyResourceService.updateLabel(this.bubble);
                if(this.isCenter){
                    document.title = this.bubble.getTextOrDefault() + " | MindRespect";
                }
                this.$store.dispatch("redraw");
            },
            focus: function () {
                this.bubble.isEditFlow = true;
                this.bubble.isEditFlow = true;
                this.$store.dispatch("redraw");
            },
            keydown: function (event) {
                if ([KeyCode.KEY_RETURN, KeyCode.KEY_ESCAPE].indexOf(event.keyCode) > -1) {
                    event.preventDefault();
                    return this.bubble.getLabelHtml().blur();
                }
            },
            checkIsSelected: function () {
                let found = false;
                SelectionHandler.getSelectedBubbles().forEach((selected) => {
                    if (selected.getUri() === this.bubble.getUri()) {
                        found = true;
                    }
                });
                this.isSelected = found;
            },
            mouseDown: function () {
                if (this.isEditFlow) {
                    return;
                }
                GraphUi.disableDragScroll();
            },
            dragStart: function (event) {
                // event.preventDefault();
                SelectionHandler.removeAll();
                // debugger;
                event.target.style.opacity = .5;
                event.dataTransfer.setData('Text', "dummy data for dragging to work in Firefox");
                this.$store.dispatch('setDragged', this.bubble);
                this.isContainerDragOver = false;
                GraphUi.disableDragScroll();
            },
            dragEnd: function (event) {
                event.preventDefault();
                event.target.style.opacity = 1;
                GraphUi.enableDragScroll();
                this.$store.dispatch('setDragged', null);
            },
            labelDragEnter: function (event) {
                /*
                method name is drag enter but actually
                called on drag over to enable drop handler to trigger
                I don't know why !
                 */
                event.preventDefault();
                event.stopPropagation();
                clearTimeout(this.dragOverLabelTimeout);
                if (this.isLabelDragOver = true) {
                    return;
                }
                let dragged = this.$store.state.dragged;
                let shouldSetToDragOver = dragged !== undefined &&
                    dragged.getUri() !== this.bubble.getUri();
                if (!shouldSetToDragOver) {
                    // console.log("not " + this.bubble.getLabel())
                    this.isLabelDragOver = false;
                    return;
                }
                this.isLabelDragOver = true;
                // console.log("yes " + this.bubble.getLabel())
            },
            labelDragLeave: function (event) {
                event.preventDefault();
                // console.log("label drag leave");
                this.dragOverLabelTimeout = setTimeout(function () {
                    this.isLabelDragOver = false;
                }.bind(this), 50)
            },
            labelDrop: function (event, forceLeft) {
                // console.log("label drop");
                // debugger;
                event.preventDefault();
                event.stopPropagation();
                GraphUi.enableDragScroll();
                this.isLabelDragOver = false;
                let dragged = this.$store.state.dragged;
                this.$store.dispatch('setDragged', null);
                if (dragged === null) {
                    return;
                }
                dragged.getController().moveUnderParent(
                    this.bubble,
                    forceLeft
                );
            },
            topBottomDrop: function (method) {
                this.isContainerDragOver = false;
                this.isBottomDragOver = false;
                this.isTopDragOver = false;
                let edge = this.bubble;
                if (edge.isVertex()) {
                    edge = edge.getParentBubble();
                }
                let dragged = this.$store.state.dragged;
                this.$store.dispatch('setDragged', null);
                // if (edge.isRelation() && dragged.getId() === edge.destinationVertex.getId()) {
                //     console.log("drop denied")
                //     return;
                // }")
                return dragged.getController()[method](edge);
            },
            topDrop: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.topBottomDrop("moveAbove");
            },
            bottomDrop: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.topBottomDrop("moveBelow");
            },
            resetTopBottomDragOver: function (event) {
                event.preventDefault();
                this.dragOverTopBottomTimeout = setTimeout(function () {
                    this.isContainerDragOver = false;
                    this.isBottomDragOver = false;
                    this.isTopDragOver = false;
                }.bind(this), 50);
            },
            topDragEnter: function (event) {
                /*
                method name is drag enter but actually
                called on drag over to enable drop handler to trigger
                I don't know why !
                 */
                event.preventDefault();
                clearTimeout(this.dragOverTopBottomTimeout);
                if (this.isTopDragOver) {
                    return;
                }
                let dragged = this.$store.state.dragged;
                if (!dragged) {
                    return;
                }
                let bubble = this.bubble.isEdge() ? this.bubble.getNextBubble() : this.bubble;
                if (dragged.getId() === bubble.getId()) {
                    return;
                }
                this.isContainerDragOver = true;
                this.isTopDragOver = true;
            },
            bottomDragEnter: function (event) {
                /*
                method name is drag enter but actually
                called on drag over to enable drop handler to trigger
                I don't know why !
                 */
                event.preventDefault();
                clearTimeout(this.dragOverTopBottomTimeout);
                if (this.isBottomDragOver) {
                    return;
                }
                let bubble = this.bubble.isEdge() ? this.bubble.getNextBubble() : this.bubble;
                if (this.$store.state.dragged.getId() === bubble.getId()) {
                    return;
                }
                this.isContainerDragOver = true;
                this.isBottomDragOver = true;
            },
            leftRightDragEnter: function (event) {
                event.preventDefault();
                this.isLeftRightDragOver = true;
            },
            leftRightDragLeave: function (event) {
                event.preventDefault();
                this.isLeftRightDragOver = false;
            },
            leftDrop: function (event) {
                this.isLeftRightDragOver = false;
                this.labelDrop(event, true);
            },
            rightDrop: function (event) {
                this.isLeftRightDragOver = false;
                this.labelDrop(event, false);
            }
        },
        watch: {
            selected: function () {
                this.checkIsSelected();
            },
            showMenu: function () {
                GraphUi.enableDragScroll();
            },
            isSelected: function () {
                if (!this.isSelected) {
                    this.showMenu = false;
                }
            }

        }
    }
</script>

<style scoped>
    .vertex-drop-arrow-top {
        top: -12px !important;
    }

    .edge-drop-arrow-top {
        top: -20px !important;
    }

    .vertex-drop-arrow-bottom {
        bottom: -12px !important;
    }

    .edge-drop-arrow-bottom {
        bottom: -20px !important;
    }

    .bubble-size {
        font-size: 18px !important;
    }

    .is-shrinked {
        height: 10px !important;
        width: 10px !important;
    }

    .label-drag-over {
        border: 1px dashed red;
        border-radius: 50px;
    }

    .vertex-tree-container.drag-over {
        border-top: dashed red 1px;
        border-bottom: dashed red 1px;
        border-radius: 0;
    }

    .dotted-border-top {
        border-top: 1px dashed transparent;
    }

    .dotted-border-bottom {
        border-bottom: 1px dashed transparent;
    }

    .border-visible {
        border-color: red;
    }

    .drop-relative-container {
        position: relative;
    }

    .vertex-drop-arrow-top-bottom-drop {
        position: absolute !important;
        width: 100% !important;
        max-width: 500px !important;
        z-index: 10;
    }

    .top-vertex-arrow-drop {
        height: 50% !important;
        top: 0;
        margin-top: -10px
    }

    .bottom-vertex-drop-arrow-drop {
        bottom: 0;
        height: 30% !important;
        margin-bottom: -10px;
    }

    .vertex-left-right-drop {
        position: absolute !important;
        width: 60px !important;
        height: 100% !important;
        /*border: 1px solid red;*/
    }

    .top-bottom-left-side {
        right: 0px;
    }

    .top-bottom-right-side {
        left: 5px;
    }

    .arrowTopBottomContainer {
        position: absolute;
        max-width: inherit;
        width: 100%;
        overflow-x: hidden;
        white-space: nowrap;
        z-index: -1;
    }

    .in-label-buttons {
        top: 20%
    }

    .w-500 {
        width: 500px;
    }

    .in-label-buttons-left {
        right: 4px;
    }

    .fade-enter-active {
        transition: all 0.2s ease;
    }

    .fade-leave-active {
        /*transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);*/
        /*max-height: 100%;*/
        /*transition: max-height 5.25s ease-in;*/
    }

    .fade-enter, .fade-leave-to {
        /*opacity: 0;*/
        transform-origin: left;
        transform: scale(0);
        /*max-height: 0;*/
        /*transition: max-height 3.15s ease-out;*/
    }

    .left-oriented .fade-enter, .left-oriented .fade-leave-to {
        transform-origin: right;
    }

    .right-oriented .fade-enter, .right-oriented .fade-leave-to {
        transform-origin: left;
    }

    .bubble-container {
        /*position relative for absolute vertex-drop-arrow-top-bottom-drop*/
        position: relative;
    }

    .edit-flow {
        position: absolute !important;
        /*width: 500px;*/
        max-width: 500px;
        z-index: 99999;
    }

    .vertex .in-bubble-content {
        max-width: 500px !important;
        height: 100%;
        position: relative;
        padding-top: 2px !important;
        padding-bottom: 2px !important;
    }

    .in-bubble-content-wrapper {
        position: relative;
    }

    .hidden {
        visibility: hidden;
    }

    .label-chip, .bubble-label, .label-chip .v-chip__content {
        transition: none !important;
    }

    .v-chip__content {
        transition: none !important;
    }

    .bubble-label {
        display: inline-block;
        word-break: break-word;
    }

    .in-label-icons-left i {
        margin-left: 5px;
    }

    .in-label-icons-right i {
        margin-right: 5px;
    }
</style>
