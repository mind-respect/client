<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded" class="unselectable" :class="{
            'mt-1 mb-1' : $vuetify.breakpoint.mdAndDown
        }">
        <v-flex xs12>
            <v-flex xs12 class="pt-1 dotted-border-top"
                    @dragover="topDragEnter"
                    @dragleave="resetTopBottomDragOver"
                    @drop="topDrop"
                    @click="click"
                    @mouseup="mouseup"
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
                :class="{
        'vertex-tree-container': !isCenter,
        'bubble-container': isCenter
    }" :id="containerId">
            <v-flex grow class="v-center drop-relative-container">
                <v-spacer v-if="isLeft"></v-spacer>
                <div :key="childrenKey" v-if="isLeft && !isCenter">
                    <div :key="bubble.childrenKey">
                        <Children
                                :bubble="bubble"
                                direction="left"
                                v-if="!bubble.isCollapsed && canShowChildren()"
                        >
                        </Children>
                        <ChildNotice :bubble="bubble"
                                     @expanded="refreshChildren()"
                                     :class="{
                                        'blur-overlay': !isEditFlow && $store.state.isEditFlow
                                     }"
                                     v-if="canExpand && !canShowChildren()"></ChildNotice>
                    </div>
                </div>
                <div class='bubble-container v-center'
                     :class="{
                    'vh-center':isCenter,
                    'left':!isLeft && !isCenter,
                    'pl-12': !canExpand && (!isCenter && bubble.isVertexType() && isLeft && bubble.rightBubbles.length === 0) || (isCenter && bubble.leftBubbles.length === 0),
                    'pr-12': !canExpand && (bubble.isVertexType() && (!isLeft || isCenter) && bubble.rightBubbles.length === 0)
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
                        <v-icon v-for="i in 5" :key="i" small
                                style="overflow-x: hidden"
                                class="unselectable"
                                :class="{
                                    'red--text': isTopDragOver,
                                    'transparent--text': !isTopDragOver,
                                    'ml-6': isLeft,
                                    'mr-6': !isLeft
                                }">
                            {{dragOverArrow}}
                        </v-icon>
                    </div>

                    <div
                            v-if="!isCenter"
                            class="vertex-drop-arrow-top-bottom-drop top-vertex-arrow-drop"
                            @dragover="topDragEnter"
                            @dragleave="resetTopBottomDragOver"
                            @drop="topDrop"
                            @click="click"
                            @mouseup="mouseup"
                            @dblclick="dblclick"
                            @contextmenu="rightClick"
                    ></div>
                    <div class="vertex-left-right-drop"
                         v-if="(isCenter && bubble.leftBubbles.length === 0 ) || (!isCenter && isLeaf && !isLeft)"
                         @dragover="leftRightDragEnter"
                         @dragleave="leftRightDragLeave"
                         @drop="leftDrop"
                         style="left:0;">
                    </div>
                    <v-spacer v-if="isLeft && isLeaf"></v-spacer>
                    <div
                            v-if="bubble.isVertexType()"
                            class="bubble vertex graph-element relative vh-center"
                            :key="contentKey"
                            :class="{
                                'selected' : bubble.isSelected,
                                'reverse': isLeft && !isCenter
                            }"
                    >
                        <div class="image_container">
                            <v-img :src="imageUrl" max-height="90" v-if="imageUrl" @load="imageLoaded"></v-img>
                        </div>
                        <div class="in-bubble-content-wrapper unselectable vh-center">
                            <v-menu
                                    v-model="showMenu"
                                    :value="bubble.isSelected && $store.state.selected.length === 1"
                                    :max-width="menuWidth()"
                                    :nudge-width="250"
                                    auto
                                    right
                                    color="white"
                                    offset-y
                                    :disabled="isEditFlow"
                            >
                                <template v-slot:activator="{ on }">
                                    <div
                                            class="in-bubble-content vh-center"
                                            :class="{
                                            'reverse': isLeft,
                                            'desktop': $vuetify.breakpoint.lgAndUp,
                                            'mobile': $vuetify.breakpoint.mdAndDown,
                                            'blur-overlay': !isEditFlow && $store.state.isEditFlow
                                    }"
                                            @click="click"
                                            @mouseup="mouseup"
                                            @dblclick="dblclick"
                                            @mousedown="mouseDown"
                                            @dragstart="dragStart"
                                            @dragend="dragEnd"
                                            @contextmenu="rightClick"
                                            :draggable="!isCenter && !isEditFlow"
                                    >
                                        <InLabelButtons :bubble="bubble" :isLeft="isLeft"
                                                        :isCenter="isCenter"></InLabelButtons>


                                        <v-badge color="third" :left="isLeft">
                                            <template v-slot:badge v-if="bubble.isMeta()">
                                                <v-icon dark>label</v-icon>
                                            </template>
                                            <div
                                                    class="bubble-label ui-autocomplete-input bubble-size font-weight-regular mb-1"
                                                    @blur="leaveEditFlow"
                                                    @dragover="labelDragEnter"
                                                    @dragleave="labelDragLeave"
                                                    @drop="labelDrop"
                                                    :data-placeholder="isEditFlow ? '' : $t('vertex:default')"
                                                    v-html="label()"
                                                    @focus="focus"
                                                    @keydown="keydown"
                                                    @paste="paste"
                                                    :style="labelFont"
                                                    ref="vertexLabel"
                                                    :class="{
                                                        'unselectable' : !isEditFlow
                                                    }"
                                            ></div>
                                        </v-badge>
                                    </div>
                                </template>
                                <div :style="'background-color:' + backgroundColor">
                                    <BubbleButtons v-show="menuFlow === 'buttons'"></BubbleButtons>
                                    <v-card :href="linkMenuHref" target="_blank" v-show="menuFlow === 'link'">
                                        <v-card-title class="body-1 link-menu">
                                            <v-icon class="mr-2">share</v-icon>
                                            {{$t('vertex:openLink')}}
                                        </v-card-title>
                                    </v-card>
                                </div>
                            </v-menu>
                        </div>
                    </div>
                    <div
                            class="vertex-drop-arrow-top-bottom-drop bottom-vertex-drop-arrow-drop"
                            @click="click"
                            @mouseup="mouseup"
                            @dblclick="dblclick"
                            @contextmenu="rightClick"
                            @dragover="bottomDragEnter" @dragleave="resetTopBottomDragOver" @drop="bottomDrop"
                    ></div>
                    <div @dragover="bottomDragEnter"
                         @drop="bottomDrop"
                         @click="click"
                         @mouseup="mouseup"
                         @dblclick="dblclick"
                         @contextmenu="rightClick"
                         class="arrowTopBottomContainer"
                         :class="{
                            'top-bottom-left-side text-xs-right': isLeft && !isCenter,
                            'top-bottom-right-side': !isLeft && !isCenter,
                            'vertex-drop-arrow-bottom':bubble.isVertexType(),
                            'edge-drop-arrow-bottom':!bubble.isVertexType()
                        }">
                        <v-icon v-for="i in 5" :key="i" small
                                class="unselectable"
                                :class="{
                        'red--text' : isBottomDragOver,
                        'transparent--text': !isBottomDragOver,
                        'ml-6': isLeft,
                        'mr-6': !isLeft
                    }">
                            {{dragOverArrow}}
                        </v-icon>
                    </div>
                    <div class="vertex-left-right-drop"
                         v-if="(isCenter && bubble.rightBubbles.length === 0 ) || (!isCenter && isLeaf && !isLeft)"
                         @dragover="leftRightDragEnter"
                         @dragleave="leftRightDragLeave"
                         @drop="rightDrop"
                         style="right:0;">
                    </div>
                    <v-layout
                            v-if="bubble.isEdge() || bubble.isGroupRelation()"
                            class="bubble relation graph-element relative pt-0 pb-0 mt-0 mb-0 "
                            :class="{
                            'selected' : bubble.isSelected,
                            'reverse': isLeft && !isCenter
                            }">
                        <div class="image_container"></div>
                        <div class="in-bubble-content vh-center"
                             @click="click"
                             @mouseup="mouseup"
                             @dblclick="dblclick"
                             @mousedown="mouseDown"
                             @dragstart="dragStart"
                             @dragend="dragEnd"
                             @contextmenu="rightClick"
                             :draggable="!isEditFlow"
                             :class="{
                                'pl-12 pr-1': bubble.isEdge() && ( (isLeft && !isInverse) || (!isLeft && isInverse)),
                                'pl-1 pr-12': bubble.isEdge() && ( (isLeft && isInverse) || (!isLeft && !isInverse)),
                                'pl-6': (bubble.isGroupRelation() && !isLeft),
                                'pr-6': (bubble.isGroupRelation() && isLeft),
                                'blur-overlay': !isEditFlow && $store.state.isEditFlow
                             }"
                        >
                            <v-menu
                                    v-model="showMenu"
                                    :value="bubble.isSelected && $store.state.selected.length === 1"
                                    max-width="250"
                                    :nudge-width="250"
                                    auto
                                    right
                                    color="white"
                                    offset-y
                                    class="pa-0 ma-0"
                                    :open-on-click="false"
                            >
                                <template v-slot:activator="{ on }">
                                    <div class="label-container">
                                        <v-chip :color="chipColor"
                                                small
                                                @dragover="labelDragEnter"
                                                @dragleave="labelDragLeave"
                                                @drop="labelDrop"
                                                :input-value="bubble.isSelected || isLabelDragOver"
                                                class="pt-0 pb-0 mt-0 mb-0 ma-0 pl-2 pr-2 label-chip vh-center"
                                                transition="none"
                                                :class="{
                                            'reverse': isLeft,
                                        'elevation-4': bubble.isSelected,
                                        'is-inverse' : isInverse,
                                        'is-shrinked' : isShrinked,
                                        'empty-edge' : bubble.isEdge() && !isEditFlow && bubble.isLabelEmpty()
                                    }"
                                        >
                                            <InLabelButtons :bubble="bubble" :isLeft="isLeft" :isCenter="isCenter"
                                                            class="vh-center"
                                                            v-if="!isShrinked"></InLabelButtons>
                                            <div class="bubble-label white--text"
                                                 @blur="leaveEditFlow"
                                                 :data-placeholder="relationPlaceholder()"
                                                 @focus="focus"
                                                 @paste="paste"
                                                 v-show="!isShrinked"
                                                 v-if="!bubble.isMetaRelation()"
                                                 v-text="label()"
                                                 @keydown="keydown"
                                                 :style="labelFont"
                                                 :class="{
                                                        'unselectable' : !isEditFlow
                                                    }"
                                            ></div>
                                            <v-icon v-if="bubble.isMetaRelation()" small
                                                    class="bubble-label unselectable"
                                                    v-show="!isShrinked">label
                                            </v-icon>
                                        </v-chip>
                                    </div>
                                </template>
                                <div :style="'background-color:' + backgroundColor">
                                    <BubbleButtons v-show="menuFlow === 'link'"></BubbleButtons>
                                    <v-card :href="linkMenuHref" target="_blank" v-show="menuFlow === 'link'">
                                        <v-card-title class="body-1 link-menu">
                                            <v-icon class="mr-2">share</v-icon>
                                            {{$t('vertex:openLink')}}
                                        </v-card-title>
                                    </v-card>
                                </div>
                            </v-menu>
                        </div>
                    </v-layout>
                </div>
                <div :key="childrenKey" v-if="!isLeft && !isCenter">
                    <div :key="bubble.childrenKey">
                        <Children :bubble="bubble"
                                  v-if="!bubble.isCollapsed && canShowChildren()"
                                  direction="right">
                        </Children>
                        <ChildNotice :bubble="bubble"
                                     @expanded="refreshChildren()"
                                     class=""
                                     :class="{
                                        'blur-overlay': !isEditFlow && $store.state.isEditFlow
                                     }"
                                     v-if="canExpand && !canShowChildren()"></ChildNotice>
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
    import Selection from '@/Selection'
    import UiUtils from '@/UiUtils'
    import KeyCode from 'keycode-js';
    import Children from '@/components/graph/Children'
    import ChildNotice from '@/components/graph/ChildNotice'
    import BubbleButtons from '@/components/graph/BubbleButtons'
    import GraphUi from '@/graph/GraphUi'
    import IdUri from '@/IdUri'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import Color from '@/Color'
    import MindMapInfo from '@/MindMapInfo'
    import linkifyStr from 'linkifyjs/string'
    import InLabelButtons from "@/components/graph/bubble/InLabelButtons";

    export default {
        name: "Bubble",
        props: [
            'bubble',
            'direction'
        ],
        components: {
            InLabelButtons,
            Children,
            ChildNotice,
            BubbleButtons
        },
        data: function () {
            return {
                containerId: "",
                loaded: false,
                isLabelDragOver: false,
                dragOverLabelTimeout: undefined,
                isContainerDragOver: false,
                dragOverTopBottomTimeout: undefined,
                isTopDragOver: null,
                isBottomDragOver: null,
                isLeftRightDragOver: null,
                showMenu: false,
                menuFlow: null,
                linkMenuHref: null,
                chipColor: null,
                isMetaRelated: null,
                dragOverArrow: null,
                backgroundColor: Color.bubbleBackground,
                contentKey: null,
                childrenKey: null,
                isEditFlow: false
            }
        },
        // updated: function () {
        //     console.log(this.bubble.getLabel())
        // },
        mounted: async function () {
            this.bubble.loading = false;
            this.bubble.isEditFlow = false;
            this.bubble.direction = this.direction;
            this.bubble.component = this;
            this.contentKey = IdUri.uuid();
            this.chipColor = this.bubble.isMetaRelation() ? "third" : "secondary";
            let parentBubble = this.bubble.getParentBubble();
            this.isMetaRelated = this.bubble.isMetaRelation() || this.bubble.isMetaGroupVertex() || (parentBubble && parentBubble.isMetaRelation());
            this.isCenter = this.bubble.isCenter !== undefined && this.bubble.isCenter;
            this.isLeft = this.direction === "left";
            this.dragOverArrow = this.isLeft ? "arrow_back" : "arrow_forward";
            if (this.isCenter) {
                this.containerId = "center";
            } else {
                this.containerId = IdUri.uuid();
            }
            this.loaded = true;
        },
        computed: {
            isNextBubbleExpanded: function () {
                return this.bubble.getNextBubble().isExpanded;
            },
            isInverse: function () {
                return this.bubble.isEdge() && this.bubble.isInverse();
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
            isLeaf: function () {
                return this.bubble.isLeaf();
            },
            canExpand: function () {
                return this.bubble.canExpand();
            },
            labelFont: function () {
                let font = CurrentSubGraph.get().center.getFont();
                return "font-family:" + font.family;
            },
            isShrinked: function () {
                if (this.isLabelDragOver) {
                    return false;
                }
                return this.bubble.isShrinked();
            },
            imageUrl: function () {
                let tagsWithImages = this.bubble.getIdentifiers().filter((tag) => {
                    return tag.hasImages() && tag.getImage().urlForSmall;
                });
                return tagsWithImages.length ? tagsWithImages[0].getImage().urlForSmall : false;
            }
        },
        methods: {
            menuWidth: function () {
                return this.menuFlow === 'buttons' ? 250 : "auto";
            },
            label: function () {
                let doc = new DOMParser().parseFromString(this.bubble.getFriendlyJson().label, 'text/html');
                let text = doc.body.textContent || "";
                return this.isEditFlow ? text : linkifyStr(text);
            },
            relationPlaceholder: function () {
                return this.bubble.isGroupRelation() || this.bubble.isSelected || this.isLabelDragOver ? this.$t('edge:default') : "";
            },
            refreshChildren: function () {
                this.childrenKey = IdUri.uuid();
            },
            canShowChildren: function () {
                return (this.bubble.isVertexType() && this.bubble.rightBubbles.length > 0) ||
                    (this.bubble.isGroupRelation() && this.bubble.children && this.bubble.children.length > 0) ||
                    this.bubble.isEdge();
            },
            beforeChildrenAnimation: async function () {
                await this.$nextTick();
                this.$store.dispatch("redraw");
            },
            afterChildrenAnimation: async function () {
                await this.$nextTick();
                this.$store.dispatch("redraw");
            },
            paste: function (event) {
                event.preventDefault();
                //to prevent html to be pasted
                let text = event.clipboardData.getData('Text');
                window.document.execCommand('insertText', false, text);
            },
            mouseup: function () {

            },
            rightClick: function (event) {
                event.preventDefault();
                if (this.isEditFlow) {
                    return;
                }
                this.menuFlow = 'buttons';
                this.showMenu = true;
                Selection.setToSingle(this.bubble)
            },
            click: function (event) {
                event.stopPropagation();
                if (this.isEditFlow) {
                    this.showMenu = false;
                    return;
                }
                if (Selection.isSingle() && this.bubble.isSelected && (event.target.tagName !== "A" || this.menuFlow === 'link')) {
                    event.preventDefault();
                    this.menuFlow = 'buttons';
                    setTimeout(() => {
                        if (!this.isEditFlow && this.menuFlow !== 'link') {
                            this.showMenu = true;
                        }
                    }, 150)
                } else if (event.target.tagName === "A") {
                    event.preventDefault();
                    this.linkMenuHref = event.target.href;
                    this.menuFlow = 'link';
                    setTimeout(() => {
                        this.showMenu = true;
                    }, 150);
                } else {
                    this.showMenu = false;
                }
                setTimeout(() => {
                    this.$nextTick(() => {
                        this.$set(this.bubble, "isSelected", true);
                        this.contentKey = IdUri.uuid();
                        this.$nextTick(() => {
                            GraphUi.enableDragScroll();
                            if (UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey) {
                                if (this.bubble.isSelected) {
                                    Selection.remove(this.bubble);
                                } else {
                                    Selection.add(this.bubble);
                                }
                            } else {
                                Selection.setToSingle(
                                    this.bubble
                                );
                            }
                        });
                    });
                })
            },
            dblclick: function (event) {
                event.stopPropagation();
                this.showMenu = false;
                if (MindMapInfo.isViewOnly() || this.bubble.isEditFlow || this.bubble.isMetaRelation()) {
                    return;
                }
                this.bubble.isEditFlow = true;
                this.isEditFlow = true;
                this.$store.dispatch("setIsEditFlow", true);
                GraphUi.disableDragScroll();
                this.bubble.focus(event);
            },
            leaveEditFlow: function () {
                this.bubble.isEditFlow = false;
                this.isEditFlow = false;
                let labelHtml = this.bubble.getLabelHtml();
                labelHtml.contentEditable = "false";
                this.bubble.controller().setLabel(labelHtml.innerHTML);
                if (this.isCenter) {
                    document.title = this.bubble.getTextOrDefault() + " | MindRespect";
                }
                GraphUi.enableDragScroll();
                this.$store.dispatch("setIsEditFlow", false);
                this.$store.dispatch("redraw");
            },
            focus: function () {
                this.showMenu = false;
                if (this.isEditFlow) {
                    return;
                }
                this.isEditFlow = true;
                this.bubble.isEditFlow = true;
                this.$nextTick(() => {
                    GraphUi.disableDragScroll();
                    this.$store.dispatch("setIsEditFlow", true);
                });
            },
            keydown: function (event) {
                if ([KeyCode.KEY_RETURN, KeyCode.KEY_ESCAPE].indexOf(event.keyCode) > -1) {
                    event.preventDefault();
                    return this.bubble.getLabelHtml().blur();
                }
            },
            mouseDown: function () {
                if (this.isEditFlow) {
                    return;
                }
                GraphUi.disableDragScroll();
            },
            dragStart: function (event) {
                // event.preventDefault();
                if (MindMapInfo.isViewOnly() || this.isMetaRelated) {
                    event.preventDefault();
                    return;
                }
                // Selection.removeAll();
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
                if (this.isLabelDragOver === true) {
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
                dragged.controller().moveUnderParent(
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
                return dragged.controller()[method](edge);
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
            },
            imageLoaded: async function () {
                await this.$nextTick();
                return this.$store.dispatch('redraw');
            }
        },
        watch: {
            showMenu: function () {
                GraphUi.enableDragScroll();
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
        padding: 0 !important;
    }

    .left-oriented .empty-edge {
        right: 2px;
    }

    .left-oriented .empty-edge.is-inverse {
        left: 2px;
    }

    .right-oriented .empty-edge.is-inverse {
        right: 2px;
    }

    .is-shrinked.empty-edge {
        top: -5px;
    }

    .empty-edge {
        position: absolute;
        top: -15px;
    }

    .empty-edge .bubble-label {
        width: 30px;
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
        height: 100%;
        position: relative;
        padding-top: 6px !important;
        padding-bottom: 6px !important;
    }

    .vertex .in-bubble-content.desktop {
        max-width: 500px !important;
    }

    .vertex .in-bubble-content.mobile {
        max-width: 300px !important;
    }

    .in-bubble-content-wrapper {
        position: relative;
    }

    .hidden {
        visibility: hidden;
    }

    .relation .v-chip.v-size--small {
        font-size: 15px;
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
        outline: 0 solid transparent;
        border: none;
        width: auto;
    }

    .image-container-min-height {
        min-height: 60px;
    }

</style>
