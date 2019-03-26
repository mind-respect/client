<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded"
    >
        <v-flex xs12>
            <v-flex xs12 class="pt-1 dotted-border-top"
                    @dragover="topDragEnter"
                    @dragleave="resetTopBottomDragOver"
                    @drop="topDrop"
                    v-if="(bubble.isEdge() || bubble.isGroupRelation()) && !bubble.getNextBubble().isExpanded"
            ></v-flex>
            <v-flex xs12 style="position:relative;" v-if="!bubble.isCenter">
                <div
                        style="top: -12px;"
                        class="arrowTopBottomContainer"
                        :class="{
                            'top-bottom-left-side text-xs-right': bubble.isToTheLeft(),
                            'top-bottom-right-side': !bubble.isToTheLeft()
                }">
                    <v-icon v-for="i in 5" small
                            style="overflow-x: hidden"
                            class="unselectable"
                            :class="{
                            'red--text': isTopDragOver,
                            'transparent--text': !isTopDragOver,
                        'ml-4 fa-flip-horizontal': bubble.isToTheLeft(),
                        'mr-4': !bubble.isToTheLeft()
                    }">
                        arrow_forward
                    </v-icon>
                </div>
            </v-flex>
            <v-flex xs12
                    style="position:relative;"
                    class="dotted-border-top"
                    v-if="bubble.isVertex() && !bubble.isCenter"
            ></v-flex>
        </v-flex>
        <v-layout
                row :class="{
        'vertex-tree-container': !bubble.isCenter,
        'vertex-container': bubble.isCenter
    }" :id="containerId">
            <v-flex class="v-center">
                <v-spacer v-if="bubble.orientation === 'left'"></v-spacer>
                <Children :bubble="bubble"
                          v-if="bubble.orientation === 'left'"
                >
                </Children>
                <div class='vertex-container v-center'
                     :class="{
                'vh-center':bubble.orientation === 'center',
                'left':bubble.orientation === 'right',
                'pl-5': (bubble.isLeaf() && bubble.isToTheLeft()) || (bubble.isCenter && bubble.leftBubbles.length === 0),
                'pr-5': (bubble.isLeaf() && !bubble.isToTheLeft()) || (bubble.isCenter && bubble.rightBubbles.length === 0),
                'w-500': (bubble.isLeaf() && bubble.isToTheLeft())
            }"
                     :id="bubble.uiId"
                >
                    <div class="vertex-top-bottom-drop"
                         @dragover="topDragEnter"
                         @dragleave="resetTopBottomDragOver"
                         @drop="topDrop"
                         style="top:0;"
                    ></div>
                    <div class="vertex-left-right-drop"
                         v-if="bubble.isCenter || bubble.isToTheLeft()"
                         @dragover="leftRightDragEnter"
                         @dragleave="leftRightDragLeave"
                         @drop="leftDrop"
                         style="left:0;">
                    </div>
                    <v-spacer v-if="bubble.isToTheLeft() && bubble.isLeaf()"></v-spacer>
                    <div
                            v-if="bubble.isVertex()"
                            class="bubble vertex graph-element relative" :class="{
                        'selected' : (isSelected || isLabelDragOver || isLeftRightDragOver),
                        'center-vertex': bubble.isCenter,
                        'reverse': bubble.orientation === 'left'
                }">
                        <div class="image_container"></div>
                        <div class="in-bubble-content-wrapper">
                            <div
                                    class="in-bubble-content pl-1 pr-1 pt-1 pb-1"
                                    :class="{
                                        'reverse': bubble.orientation === 'left'
                                    }"
                                    @click="click" @dblclick="dblclick"
                                    @mousedown="mouseDown"
                                    @dragstart="dragStart"
                                    @dragend="dragEnd"
                                    draggable="true"
                                    style="max-width:500px!important;height:100%;position:relative"
                            >
                                <div
                                        class="in-label-buttons text-xs-center"
                                        :class="{
                                            'in-label-buttons-right':bubble.isToTheLeft(),
                                            'in-label-buttons-left':bubble.isToTheLeft()
                                        }"
                                >
                                    <v-icon small color="secondary">lock</v-icon>
                                </div>
                                <div
                                        class="bubble-label ui-autocomplete-input bubble-size font-weight-regular mb-1"
                                        :class="{
                                            'pr-2': bubble.isToTheLeft(),
                                            'pl-3': !bubble.isToTheLeft() || bubble.isCenter
                                        }"
                                        @blur="leaveEditFlow"
                                        @dragover="labelDragEnter"
                                        @dragleave="labelDragLeave"
                                        @drop="labelDrop"
                                        :data-placeholder="$t('vertex:default')"
                                        autocomplete="off" v-text="bubble.getFriendlyJson().label"
                                        @keydown="keydown"></div>
                            </div>
                        </div>
                        <ChildNotice :bubble="bubble"
                                     v-if="bubble.canExpand()"></ChildNotice>
                    </div>
                    <div
                            class="vertex-top-bottom-drop"
                            @dragover="bottomDragEnter" @dragleave="resetTopBottomDragOver" @drop="bottomDrop"
                            style="bottom:0;"
                    ></div>
                    <div class="vertex-left-right-drop"
                         v-if="bubble.isCenter || !bubble.isToTheLeft()"
                         @dragover="leftRightDragEnter"
                         @dragleave="leftRightDragLeave"
                         @drop="rightDrop"
                         style="right:0;">
                    </div>
                    <div
                            v-if="bubble.isEdge() || bubble.isGroupRelation()"
                            class="bubble relation graph-element relative pt-0 pb-0 mt-0 mb-0"
                            :class="{
                            'selected' : isSelected
                 }">
                        <div class="image_container"></div>
                        <div class="in-bubble-content" @click="click" @dblclick="dblclick"
                             @mousedown="mouseDown"
                             @dragstart="dragStart"
                             @dragend="dragEnd"
                             draggable="true">
                            <div class="label-container">
                                <v-chip color="secondary"
                                        small
                                        @dragover="labelDragEnter"
                                        @dragleave="labelDragLeave"
                                        @drop="labelDrop"
                                        :selected="isSelected || isLabelDragOver"
                                        class="pt-0 pb-0 mt-0 mb-0"
                                        dark
                                        :class="{
                                        'is-shrinked' : isShrinked
                                    }"
                                >
                                    <div class="bubble-label white--text"
                                         @blur="leaveEditFlow"
                                         :data-placeholder="relationPlaceholder"
                                         autocomplete="off"
                                         v-show="!isShrinked"
                                         v-text="bubble.getFriendlyJson().label"
                                         @keydown="keydown"></div>
                                </v-chip>
                            </div>
                        </div>
                    </div>
                </div>
                <Children :bubble="bubble"
                          v-if="bubble.orientation === 'right'"
                >
                </Children>
            </v-flex>
        </v-layout>
        <v-flex xs12
                class="dotted-border-bottom"
                v-if="bubble.isVertex() && !bubble.isCenter"
        ></v-flex>
        <v-flex xs12 style="position:relative;" v-if="!bubble.isCenter">
            <div style="bottom:-12px"
                 @dragover="bottomDragEnter"
                 @drop="bottomDrop"
                 class="arrowTopBottomContainer"
                 :class="{
                    'top-bottom-left-side text-xs-right': bubble.isToTheLeft(),
                    'top-bottom-right-side': !bubble.isToTheLeft()
                }">
                <v-icon v-for="i in 4" small
                        class="unselectable"
                        :class="{
                        'red--text' : isBottomDragOver,
                        'transparent--text': !isBottomDragOver,
                        'ml-4 fa-flip-horizontal': bubble.isToTheLeft(),
                        'mr-4': !bubble.isToTheLeft()
                    }">
                    arrow_forward
                </v-icon>
            </div>
        </v-flex>
        <v-flex xs12 class="pb-1 dotted-border-bottom"
                @dragover="bottomDragEnter" @dragleave="resetTopBottomDragOver" @drop="bottomDrop"
                v-if="(bubble.isEdge() || bubble.isGroupRelation()) && !bubble.getNextBubble().isExpanded"
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
    import GraphUi from '@/graph/GraphUi'
    import IdUri from '@/IdUri'

    export default {
        name: "Bubble",
        props: ['bubble'],
        components: {
            Children,
            ChildNotice
        },
        data: function () {
            return {
                containerId: "",
                isSelected: false,
                SelectionHandler: SelectionHandler,
                loaded: false,
                isLabelDragOver: false,
                dragOverLabelTimeout: undefined,
                isContainerDragOver: false,
                dragOverTopBottomTimeout: undefined,
                isTopDragOver: null,
                isBottomDragOver: null,
                isLeftRightDragOver: null
            }
        },
        mounted: function () {
            if (this.bubble.isCenter) {
                this.containerId = "center";
            } else {
                this.containerId = IdUri.uuid();
            }
            if (this.bubble.isEdge()) {
                this.bubble.setSourceVertex(this.bubble.parentVertex);
                this.bubble.setDestinationVertex(this.bubble.destinationVertex);
            }
            this.loaded = true;
        },
        computed: {
            relationPlaceholder: function () {
                return this.isSelected ? this.$t('edge:default') : "";
            },
            isShrinked: function () {
                if (this.isSelected) {
                    return false;
                }
                if (this.bubble.isLabelEmpty()) {
                    return true;
                }
                let parentBubble = this.bubble.getParentBubble();
                if (!parentBubble.isGroupRelation()) {
                    return false;
                }
                if (parentBubble.getLabel().trim() !== this.bubble.getLabel().trim() && "" !== this.bubble.getLabel().trim()) {
                    return false;
                }
                return true;
            }
        },
        methods: {
            click: function (event) {
                event.stopPropagation();
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
                this.bubble.focus(event);
            },
            leaveEditFlow: function () {
                let labelHtml = this.bubble.getLabelHtml();
                labelHtml.contentEditable = "false";
                this.bubble.setLabel(labelHtml.innerHTML);
                FriendlyResourceService.updateLabel(this.bubble)
            },
            keydown: function (event) {
                if ([KeyCode.KEY_RETURN, KeyCode.KEY_ESCAPE].indexOf(event.keyCode) > -1) {
                    event.preventDefault();
                    return this.bubble.getLabelHtml().blur();
                }
            },
            checkIsSelected: function () {
                let found = false;
                this.SelectionHandler.getSelectedBubbles().forEach(function (selected) {
                    if (selected.getId() === this.bubble.getId()) {
                        found = true;
                    }
                }.bind(this));
                this.isSelected = found;
            },
            mouseDown: function () {
                GraphUi.disableDragScroll();
            },
            dragStart: function (event) {
                // event.preventDefault();
                SelectionHandler.reset();
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
                if (edge.isRelation() && dragged.getId() === edge.destinationVertex.getId()) {
                    return;
                }
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
                let bubble = this.bubble.isEdge() ? this.bubble.getNextBubble() : this.bubble;
                if (this.$store.state.dragged.getId() === bubble.getId()) {
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
            "SelectionHandler.selected": function () {
                this.checkIsSelected()
            }
        }
    }
</script>

<style scoped>

    .vertex-container {
        height: 100%;
        position: relative;
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

    .vertex-top-bottom-drop {
        position: absolute !important;
        height: 40% !important;
        width: 100% !important;
        max-width: 500px !important;
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
        position: absolute;
        top: 20%;
    }

    .w-500 {
        width: 500px;
    }

    .in-label-buttons-left {
        right: 4px;
    }
</style>
