<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded" class="unselectable room-to-drop-when-dragging">
        <v-layout
                :class="{
        'vertex-tree-container': !isCenter,
        'bubble-container': isCenter
    }" :id="containerId">
            <v-flex grow class="v-center drop-relative-container" :style="containerBoxShadow">
                <v-spacer v-if="isLeft"></v-spacer>
                <div :key="childrenKey" v-if="isLeft && !isCenter">
                    <div :key="bubble.childrenKey">
                        <transition :name="expandTransitionName"
                                    @before-enter="beforeExpandAnimation" @after-leave="afterExpandAnimation"
                        >
                            <Children
                                    :bubble="bubble"
                                    direction="left"
                                    v-if="!bubble.isCollapsed && canShowChildren()"
                                    ref="leftChildren"
                            >
                            </Children>
                        </transition>
                        <ChildNotice :bubble="bubble"
                                     v-if="canExpand() && !canShowChildren()"></ChildNotice>
                    </div>
                </div>
                <div class='bubble-container v-center'
                     :class="{
                    'vh-center':isCenter,
                    'left':!isLeft && !isCenter,
                    'pl-12': !canExpand() && (!isCenter && bubble.isVertexType() && isLeft && bubble.rightBubbles.length === 0) || (isCenter && bubble.leftBubbles.length === 0),
                    'pr-12': !canExpand() && (bubble.isVertexType() && (!isLeft || isCenter) && bubble.rightBubbles.length === 0),
                    'edit-flow' : isEditFlow && !preventAbsoluteOnFocus,
                    'edit-flow-non-center' : isEditFlow && !isCenter && !preventAbsoluteOnFocus
                    }"
                     :id="bubble.uiId"
                >
                    <div class="vertex-left-right-drop"
                         v-if="(isCenter && bubble.leftBubbles.length === 0 ) || (!isCenter && isLeaf && isLeft)"
                         @dragover="leftRightDragEnter"
                         @dragleave="leftRightDragLeave"
                         @drop="leftDrop"
                         style="left:0;">
                    </div>
                    <v-spacer v-if="isLeft && isLeaf"></v-spacer>
                    <div class="image_container">
                        <v-img :src="imageUrl" max-height="90" v-if="imageUrl" @load="imageLoaded"
                               @error="errorImageLoaded"
                               min-width="60"></v-img>
                    </div>
                    <v-skeleton-loader type="chip" v-if="bubble.isVertexType() && bubble.isSkeleton()"
                                       class="bubble-label"></v-skeleton-loader>
                    <div
                            v-if="bubble.isVertexType() && !bubble.isSkeleton()"
                            class="bubble vertex graph-element relative vh-center"
                            :key="contentKey"
                            :class="{
                                'selected' : bubble.isSelected || isLabelDragOver,
                                'reverse': isLeft && !isCenter
                            }"
                    >
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
                                            'mobile': $vuetify.breakpoint.mdAndDown
                                    }"
                                            @click="click"
                                            @mouseup="mouseup"
                                            @dblclick="dblclick"
                                            @mousedown="mouseDown"
                                            @dragstart="dragStart"
                                            @dragend="dragEnd"
                                            @dragover="labelDragEnter"
                                            @dragleave="labelDragLeave"
                                            @drop="labelDrop"
                                            @contextmenu="rightClick"
                                            :draggable="!isCenter && !isEditFlow"
                                            :style="contentBoxShadow()"
                                    >
                                        <InLabelButtons :bubble="bubble" :isLeft="isLeft"
                                                        :isCenter="isCenter" :key="inLabelMenuKey"></InLabelButtons>

                                        <v-badge color="third" :left="isLeft"
                                                 :value="bubble.isMeta() || (isCenter && $store.state.isPatternFlow)">
                                            <template v-slot:badge>
                                                <v-icon dark v-if="bubble.isMeta()">label</v-icon>
                                                <v-icon dark v-if="isCenter && $store.state.isPatternFlow">stars
                                                </v-icon>
                                            </template>
                                            <div
                                                    class="bubble-label ui-autocomplete-input bubble-size font-weight-regular mb-1"
                                                    @blur="leaveEditFlow"
                                                    :data-placeholder="$t('vertex:default')"
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
                                <div :style="'background-color:' + backgroundColor" class="pt-2">
                                    <BubbleButtons v-show="menuFlow === 'buttons'"
                                                   @refresh="refreshButtons"></BubbleButtons>
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
                    <div class="vertex-left-right-drop"
                         v-if="(isCenter && bubble.rightBubbles.length === 0 ) || (!isCenter && isLeaf && !isLeft)"
                         @dragover="leftRightDragEnter"
                         @dragleave="leftRightDragLeave"
                         @drop="rightDrop"
                         style="right:0;">
                    </div>
                    <v-layout
                            v-if="(bubble.isEdge() || bubble.isGroupRelation())"
                            class="bubble relation graph-element relative pt-0 pb-0 mt-0 mb-0 "
                            :key="contentKey"
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
                                'pr-6': (bubble.isGroupRelation() && isLeft)
                             }"
                        >
                            <!--                            <v-skeleton-loader type="button"-->
                            <!--                                               v-if="bubble.isEdge() && bubble.isSkeleton()"-->
                            <!--                                               width="20"-->
                            <!--                                               height="20"-->
                            <!--                                               class="bubble-label"-->
                            <!--                            ></v-skeleton-loader>-->
                            <v-menu
                                    v-model="showMenu"
                                    :value="bubble.isSelected && $store.state.selected.length === 1"
                                    max-width="250"
                                    :nudge-width="250"
                                    auto
                                    right
                                    color="white"
                                    offset-y
                                    nudge-bottom="15"
                                    class="pa-0 ma-0"
                                    :open-on-click="false"
                                    allow-overflow
                            >
                                <template v-slot:activator="{ on }">
                                    <div class="label-container" :style="contentBoxShadow()">
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
                                                    'elevation-5': bubble.isSelected,
                                                     'is-inverse' : isInverse,
                                                     'is-shrinked' : isShrinked,
                                                     'empty-edge' : bubble.isEdge() && !isEditFlow && bubble.isLabelEmpty()
                                                }"
                                        >
                                            <InLabelButtons :bubble="bubble" :isLeft="isLeft" :isCenter="isCenter"
                                                            class="vh-center"
                                                            v-if="!isShrinked && !bubble.isLabelEmpty()"
                                                            :key="inLabelMenuKey"></InLabelButtons>
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
                                            <v-icon v-if="bubble.isMetaRelation()" color="white" small
                                                    class="bubble-label unselectable meta-relation-icon"
                                                    v-show="!isShrinked">label
                                            </v-icon>
                                        </v-chip>
                                    </div>
                                </template>
                                <div :style="'background-color:' + backgroundColor">
                                    <BubbleButtons v-show="menuFlow === 'buttons'"
                                                   @refresh="refreshButtons"></BubbleButtons>
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
                        <transition :name="expandTransitionName"
                                    @before-enter="beforeExpandAnimation"
                                    @after-leave="afterExpandAnimation"
                        >
                            <Children :bubble="bubble"
                                      v-if="!bubble.isCollapsed && canShowChildren()"
                                      direction="right">
                            </Children>
                        </transition>

                        <ChildNotice :bubble="bubble"
                                     v-if="canExpand() && !canShowChildren()"></ChildNotice>
                    </div>
                </div>
            </v-flex>
        </v-layout>
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
    import Dragged from '@/Dragged'

    let bubbleContainer;
    let bubbleContainerClone;
    let descendantsAnimateInfo;
    let textLengthBeforeEdit = 0;

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
                showMenu: false,
                menuFlow: null,
                linkMenuHref: null,
                chipColor: null,
                isMetaRelated: null,
                dragOverArrow: null,
                backgroundColor: Color.bubbleBackground,
                contentKey: IdUri.uuid(),
                childrenKey: IdUri.uuid(),
                inLabelMenuKey: IdUri.uuid(),
                imageRefresh: IdUri.uuid(),
                isEditFlow: false,
                imageUrl: false,
                preventAbsoluteOnFocus: false
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
            if (this.bubble.isLabelSameAsParentGroupRelation()) {
                this.bubble.setLabel("");
            }
            this.refreshImages();
            if (this.bubble.isSkeleton()) {
                this.chipColor = Color.SkeletonColor;
            } else {
                this.chipColor = this.bubble.isMetaRelation() ? "third" : "secondary";
            }
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
            expandTransitionName: function () {
                if ((this.bubble.isVertexType() || this.bubble.isGroupRelation()) && this.bubble.hasChildren()) {
                    return this.bubble.isToTheLeft() ? "expand-child-left" : "expand-child"
                }
                return "";
            },
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
            labelFont: function () {
                let center = CurrentSubGraph.get().center;
                if (!center) {
                    return "";
                }
                let font = center.getFont();
                return "font-family:" + font.family;
            },
            isShrinked: function () {
                if (this.isLabelDragOver) {
                    return false;
                }
                return this.bubble.isShrinked();
            },
            containerBoxShadow: function () {
                let nbChild = this.bubble.getNextChildren().length;
                if (nbChild > 0) {
                    return this.boxShadow(nbChild > 1);
                }
                return "";
            },
        },
        methods: {
            beforeExpandAnimation: async function () {
                if (UiUtils.isInAnimation || this.expandTransitionName.indexOf("expand-child") === -1) {
                    return;
                }
                // console.log("bubble children");
                this.bubble.getNextChildren().forEach((child) => {
                    child.draw = false;
                    if (child.isEdge()) {
                        child.getNextBubble().draw = false;
                    }
                });
                await this.$store.dispatch("redraw");
                /*
                this timeout should be in a @after-leave handler but these handlers
                are never triggered
                */
                setTimeout(() => {
                    this.bubble.getNextChildren().forEach((child) => {
                        child.draw = true;
                        if (child.isEdge()) {
                            child.getNextBubble().draw = true;
                        }
                    });
                    this.bubble.refreshChildren();
                }, 275);
            },
            afterExpandAnimation: function () {
                /*
                I dont know why but this is only called on collapse
                */
                this.bubble.refreshChildren();
                return;
            },
            contentBoxShadow: function () {
                if (this.bubble.getNextChildren().length === 0) {
                    return this.boxShadow(false);
                }
                return "";
            },
            boxShadow: function (isInset) {
                let backgroundColor = this.bubble.resolveBackgroundColor();
                if (this.bubble.isCenter) {
                    Color.refreshBackgroundColor(
                        backgroundColor
                    );
                    return;
                }
                if (backgroundColor === Color.DEFAULT_BACKGROUND_COLOR) {
                    return;
                }
                let xOffset = this.isLeft ? 1 : -1;
                return "box-shadow:" + (isInset ? "inset " : "") + backgroundColor + " " + xOffset + "px 0px 8px 2px;border-radius:20px;"
            },
            canExpand: function () {
                return this.bubble.canExpand();
            },
            refreshImages: function () {
                let tagsWithImages = [];
                if (this.bubble.isMeta()) {
                    if (this.bubble.getOriginalMeta().hasImages()) {
                        tagsWithImages = [this.bubble.getOriginalMeta()];
                    }
                } else {
                    tagsWithImages = this.bubble.getIdentifiers().filter((tag) => {
                        let parentBubble = this.bubble.getParentBubble();
                        let parentVertex = this.bubble.getParentVertex();
                        if (parentBubble.isGroupRelation() && parentBubble.getGroupRelationInSequenceWithTag(tag)) {
                            return false;
                        } else if (parentVertex.isMeta() && parentVertex.getOriginalMeta().getUri() === tag.getUri()) {
                            return false;
                        } else {
                            return tag.hasImages() && tag.getImage().urlForSmall && tag.getUri() !== CurrentSubGraph.get().center.getUri();
                        }
                    }).sort((x, y) => {
                        return y.getCreationDate() - x.getCreationDate();
                    })
                }
                this.imageUrl = tagsWithImages.length ? tagsWithImages[0].getImage().urlForSmall : false;
                // this.imageRefresh = IdUri.uuid();
            },
            refreshButtons: function () {
                this.inLabelMenuKey = IdUri.uuid();
            },
            menuWidth: function () {
                return this.menuFlow === 'buttons' ? 250 : "auto";
            },
            label: function () {
                let text = UiUtils.removeHtmlFromString(this.bubble.getFriendlyJson().label);
                //setting draggable: "false" because otherwise you can't drag the bubble when pressing on link
                return this.isEditFlow ? UiUtils.escapeHtml(text) : linkifyStr(text, {
                    attributes: {
                        draggable: "false"
                    }
                });
            },
            relationPlaceholder: function () {
                return this.bubble.isGroupRelation() || this.bubble.isSelected || this.isLabelDragOver ? this.$t('edge:default') : "";
            },
            refreshContent: function () {
                /*
                    this.showMenu = false; is a hack to fix that the menu shows
                    when it's visible and then changing bubble selection.
                    Try to remove when vuetify updates.
                */
                this.showMenu = false;
                this.contentKey = IdUri.uuid();
            },
            refreshChildren: function () {
                if (this.isCenter && CurrentSubGraph.get().component) {
                    CurrentSubGraph.get().component.refreshChildren();
                    return;
                }
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
                event.stopPropagation();
                if (this.isEditFlow) {
                    return;
                }
                Selection.setToSingle(this.bubble).then(() => {
                    this.menuFlow = 'buttons';
                    this.showMenu = true;
                });
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
                    }, 0)
                } else if (event.target.tagName === "A") {
                    event.preventDefault();
                    this.linkMenuHref = event.target.href;
                    this.menuFlow = 'link';
                    /*
                    *   setting to single here to make sure that scroll is over before
                    *   showing the menu
                    */
                    Selection.setToSingle(
                        this.bubble
                    ).then(() => {
                        this.showMenu = true;
                    });
                } else {
                    this.showMenu = false;
                }
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
            },
            dblclick: function (event) {
                event.stopPropagation();
                this.showMenu = false;
                if (MindMapInfo.isViewOnly() || this.bubble.isEditFlow || this.bubble.isMetaRelation()) {
                    this.$store.dispatch("failedToEdit");
                    return;
                }
                this.bubble.isEditFlow = true;
                this.bubble.focus(event).then(() => {
                    this.setupFocus();
                    GraphUi.disableDragScroll();
                });
            },
            focus: function () {
                this.bubble.preventLeaveEditFlow = false;
                this.showMenu = false;
                if (this.isEditFlow || this.bubble.isEditFlow) {
                    return;
                }
                this.setupFocus();
            },
            setupFocus: function () {
                textLengthBeforeEdit = this.bubble.getLabel().length;
                descendantsAnimateInfo = UiUtils.buildElementsAnimationData(
                    this.bubble.getDescendants()
                );
                if (this.isCenter && this.bubble.getNumberOfChild() === 0) {
                    this.preventAbsoluteOnFocus = true;
                } else {
                    this.preventAbsoluteOnFocus = false;
                    bubbleContainer = this.bubble.getHtml().closest(
                        this.isCenter ? ".center-component" : ".bubble-container"
                    );
                    bubbleContainerClone = bubbleContainer.cloneNode(true);
                    bubbleContainer.parentNode.insertBefore(bubbleContainerClone, bubbleContainer);
                    if (this.isCenter) {
                        bubbleContainer.style.position = "absolute";
                    }
                    bubbleContainerClone.style.visibility = 'hidden';
                    if (this.isLeft) {
                        bubbleContainer.style.right = '0';
                    }
                    if (this.bubble.isLeaf()) {
                        bubbleContainer.style.width = '600px';
                    }
                }
                this.isEditFlow = true;
                this.bubble.isEditFlow = true;
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.bubble.refocus();
                        GraphUi.disableDragScroll();
                    }, 50);
                });
            },
            keydown: function (event) {
                if (this.isEditFlow && [KeyCode.KEY_RETURN, KeyCode.KEY_ESCAPE].indexOf(event.keyCode) > -1) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.bubble.getLabelHtml().blur();
                    this.leaveEditFlow();
                }
            },
            leaveEditFlow: async function () {
                if (this.isLeavingEditFlow || this.bubble.preventLeaveEditFlow) {
                    this.bubble.preventLeaveEditFlow = false;
                    return;
                }
                this.isLeavingEditFlow = true;
                if (bubbleContainerClone) {
                    if (bubbleContainerClone.parentNode) {
                        bubbleContainerClone.parentNode.removeChild(bubbleContainerClone);
                    }
                    if (this.isLeft) {
                        bubbleContainer.style['right'] = '0';
                    }
                    bubbleContainer.style.width = 'auto';
                    if (this.isCenter) {
                        bubbleContainer.style.position = 'inherit';
                    }
                }
                this.isEditFlow = false;
                this.bubble.isEditFlow = false;
                let labelHtml = this.bubble.getLabelHtml();
                labelHtml.contentEditable = "false";
                /*
                * Not removingHtml from labelHtml.innerHTML because sometimes user,
                * may want to write html or something in his/her bubble.
                */
                let text = labelHtml.innerHTML;
                /*
                * await this.$nextTick(); to prevent unwanted scrolling after leaving edit flow
                */
                await this.$nextTick();
                this.bubble.setLabel(text);
                if (labelHtml.innerHTML !== this.bubble.getLabel()) {
                    labelHtml.innerHTML = this.bubble.getLabel();
                }
                this.bubble.controller().setLabel(
                    text
                );
                if (this.isCenter) {
                    document.title = this.bubble.getTextOrDefault() + " | MindRespect";
                }
                GraphUi.enableDragScroll();
                this.$store.dispatch("similarBubblesRefresh");
                this.$store.dispatch("redraw");
                if (this.bubble.getLabel().length === textLengthBeforeEdit) {
                    this.isLeavingEditFlow = false;
                } else {
                    this.$nextTick(async () => {
                        await UiUtils.animateGraphElementsWithAnimationData(
                            this.bubble.getDescendants(),
                            descendantsAnimateInfo,
                            {
                                duration: 250
                            }
                        );
                        setTimeout(() => {
                            this.bubble.getDescendants().forEach((descendant) => {
                                descendant.draw = true;
                            });
                            this.$store.dispatch("redraw");
                            this.isLeavingEditFlow = false;
                        }, 250)
                    });
                }
            },
            mouseDown: function (event) {
                if (this.isEditFlow) {
                    return;
                }
                event.stopPropagation();
                GraphUi.disableDragScroll();
            },
            dragStart: function (event) {
                if (MindMapInfo.isViewOnly()) {
                    event.preventDefault();
                    return;
                }
                event.target.style.opacity = .5;
                event.dataTransfer.setData('Text', "dummy data for dragging to work in Firefox");
                Dragged.dragged = this.bubble;
                GraphUi.disableDragScroll();
            },
            dragEnd: function (event) {
                event.preventDefault();
                event.target.style.opacity = 1;
                GraphUi.enableDragScroll();
            },
            labelDragEnter: function (event) {
                // console.log("dragover " + this.bubble.getLabel());
                /*
                method name is drag enter but actually
                called on drag over to enable drop handler to trigger
                I don't know why !
                 */
                event.preventDefault();
                event.stopPropagation();
                if (this.isLabelDragOver === true) {
                    return;
                }
                this.bubble.isDragOver = true;
                let dragged = Dragged.dragged;
                let shouldSetToDragOver = dragged !== undefined &&
                    dragged.getUri() !== this.bubble.getUri();
                if (!shouldSetToDragOver) {
                    // console.log("not " + this.bubble.getLabel())
                    this.isLabelDragOver = false;
                    return;
                }
                this.isLabelDragOver = true;
                // console.log("yes " + this.bubble.getLabel())
            }
            ,
            labelDragLeave: function (event) {
                this.bubble.isDragOver = false;
                this.isLabelDragOver = false;
                // console.log("label drag leave");
            }
            ,
            labelDrop: function (event, forceLeft) {
                // console.log("label drop");
                // debugger;
                event.preventDefault();
                event.stopPropagation();
                GraphUi.enableDragScroll();
                this.isLabelDragOver = false;
                let dragged = Dragged.dragged;
                // this.$store.dispatch('setDragged', null);
                if (dragged === null) {
                    return;
                }
                dragged.controller().moveUnderParent(
                    this.bubble,
                    forceLeft
                );
            }
            ,
            leftRightDragEnter: function (event) {
                event.preventDefault();
                this.isLabelDragOver = true;
            }
            ,
            leftRightDragLeave: function (event) {
                event.preventDefault();
                this.isLabelDragOver = false;
            }
            ,
            leftDrop: function (event) {
                this.isLabelDragOver = false;
                this.labelDrop(event, true);
            }
            ,
            rightDrop: function (event) {
                this.isLabelDragOver = false;
                this.labelDrop(event, false);
            },
            imageLoaded: async function () {
                await this.$nextTick();
                setTimeout(() => {
                    return this.$store.dispatch('redraw');
                }, 250);
            },
            errorImageLoaded: function () {
                this.imageUrl = false;
            }
        },
        watch: {
            // showMenu: function () {
            //     GraphUi.enableDragScroll();
            // }
        }
    }
</script>

<style scoped lang="scss">
    $edgeSize: calc(1px + 0.1em);
    $metaColor: purple;
    $selectBubbleColor: transparent;

    .bubble {
        z-index: 5;

        .in-bubble-content {
            z-index: 3;
        }

        &.edit {
            user-select: text;
            cursor: text;

            .bubble-label {
                &:after {
                    content: "";
                }
            }
        }

        min-width: 0;
        margin: 0 0 0 0;

        &.selected {
            z-index: 11;

            .in-bubble-content {
                z-index: 5;
            }

        }

        .image_container {
            z-index: 3;
            position: relative;
            min-width: 60px;
            text-align: right;

            &:empty {
                min-width: 0;
            }
        }

        .bubble-label {
            text-align: center;
            color: black;
            max-width: 100%;
            text-align: left;

            &:empty {
                color: grey;

                &:after {
                    content: attr(data-placeholder);
                    font-style: italic;
                    font-size: calc(1em);
                }
            }

            &[contenteditable='true']:before {
                content: "\feff "; //to prevent small height when edit in firefox http://stackoverflow.com/a/23530317
            }
        }
    }

    .vertex {
        /*white-space: nowrap; because sometimes when hovering the relation menu and there is a vertex image it messes up */
        white-space: nowrap;

        &.meta {
            .in-bubble-content {
                border-radius: 5px;
                border: $edgeSize solid $metaColor;
                color: black;
                text-shadow: none;
            }
        }

        &.selected {
            z-index: 12;
            $selectedBoxShadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);

            .in-bubble-content {
                background-color: $selectBubbleColor;
                box-shadow: $selectedBoxShadow;
            }
        }

        .in-bubble-content {
            border-radius: 50px;
            white-space: normal;
        }
    }

    .relation.bubble {
        &.selected {
            .bubble-label {
                &:empty:after {
                    color: white;
                }
            }
        }
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
        top: calc(50% - 5px);
    }

    .empty-edge {
        position: absolute;
        top: calc(50% - 15px);
    }

    .empty-edge .bubble-label {
        width: 32px;
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

    .drop-relative-container {
        position: relative;
    }

    .vertex-left-right-drop {
        position: absolute !important;
        width: 60px !important;
        height: 100% !important;
        /*border: 1px solid red;*/
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
        flex-shrink: 0;
        width: auto;

        &.edit-flow-non-center {
            position: absolute;
        }

        &.edit-flow {
            z-index: 6;
        }
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
        /*outline: 1px solid transparent to show cursor on empty label*/
        outline: 1px solid transparent;
        border: none;
        width: auto;
    }

    .image-container-min-height {
        min-height: 60px;
    }

    .meta-relation-icon {
        width: auto !important;
    }

    .room-to-drop-when-dragging {
        /*
        margin-top and bottom need to be balanced so that margins dont accumulate and
        graph when a serie of single children it looks straight
        */
        margin-top: 2px;
        margin-bottom: 2px;
    }
</style>
