<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded"
    >
        <v-flex xs12>
            <v-flex xs12 class="pt-2"
                    @dragover="topDragEnter"
                    @dragleave="resetDragOver"
                    @drop="topDrop"
                    v-if="bubble.isEdge() && !bubble.getNextBubble().isExpanded"
                    style="position:relative;"
                    :class="{
                        'dotted-border-top': isTopDragOver
                    }"
            ></v-flex>
            <v-flex xs12
                    v-if="bubble.isVertex()"
                    :class="{
                        'dotted-border-top': isTopDragOver
                    }"
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
                <div class='vertex-container v-center' :class="{
                'vh-center':bubble.orientation === 'center',
                'left':bubble.orientation === 'right'
            }"
                     @click="click" @dblclick="dblclick"
                     :id="bubble.uiId"
                     @mousedown="mouseDown"
                     @dragstart="dragStart"
                     @dragover="dragMove"
                     @dragend="dragEnd"
                     draggable="true"
                >
                    <div class="vertex-drag-over"
                         @dragover="topDragEnter"
                         @dragleave="resetDragOver"
                         @drop="topDrop"
                         style="top:0;"
                    ></div>
                    <div
                            v-if="bubble.isVertex()"
                            class="bubble vertex graph-element relative" :class="{
                        'selected' : isSelected || isLabelDragOver,
                        'center-vertex': bubble.isCenter,
                        'reverse': bubble.orientation === 'left'
                }">
                        <div class="image_container"></div>
                        <div class="in-bubble-content-wrapper">
                            <div class="in-bubble-content pl-1 pr-1 pt-1 pb-1"
                                 style="max-width:500px!important;"
                            >
                                <div class="bubble-label ui-autocomplete-input bubble-size font-weight-regular mb-1"
                                     @blur="leaveEditFlow"
                                     @dragstart="labelDragStart"
                                     @dragover="labelDragEnter"
                                     @dragleave="labelDragLeave"
                                     @drop="labelDrop"
                                     :data-placeholder="$t('vertex:default')"
                                     autocomplete="off" v-text="bubble.getFriendlyJson().label"
                                     @keydown="keydown"></div>
                                <div class="in-label-buttons"></div>
                            </div>
                        </div>
                        <ChildNotice :bubble="bubble"
                                     v-if="bubble.canExpand()"></ChildNotice>
                    </div>
                    <div
                            class="vertex-drag-over"
                            @dragover="bottomDragEnter" @dragleave="resetDragOver" @drop="bottomDrop"
                            style="bottom:0;"
                    ></div>
                    <div
                            v-if="bubble.isEdge() || bubble.isGroupRelation()"
                            class="bubble relation graph-element relative pt-0 pb-0 mt-0 mb-0"
                            :class="{
                            'selected' : isSelected
                 }">
                        <div class="image_container"></div>
                        <div class="in-bubble-content">
                            <div class="label-container">
                                <v-chip color="edgeColor"
                                        small
                                        :selected="isSelected"
                                        class="pt-0 pb-0 mt-0 mb-0"
                                        dark
                                        :class="{
                                        'is-shrinked' : bubble.isShrinked()
                                    }"
                                >
                                    <div class="bubble-label white--text"
                                         @blur="leaveEditFlow"
                                         @dragstart="labelDragStart"
                                         @dragover="labelDragEnter"
                                         @dragleave="labelDragLeave"
                                         @drop="labelDrop"
                                         :data-placeholder="relationPlaceholder"
                                         autocomplete="off"
                                         v-show="!bubble.isShrinked()"
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
        <v-flex xs12 class="pb-2"
                :class="{
                    'dotted-border-bottom': isBottomDragOver
                }"
                @dragover="bottomDragEnter" @dragleave="resetDragOver" @drop="bottomDrop"
                v-if="bubble.isEdge() && !bubble.getNextBubble().isExpanded">
        </v-flex>
        <v-flex xs12
                v-if="bubble.isVertex()"
                :class="{
                        'dotted-border-bottom': isBottomDragOver
                    }"
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
                isContainerDragOver: false,
                dragOverTimeout: undefined,
                isTopDragOver: null,
                isBottomDragOver: null,
                isDragging: false
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
                SelectionHandler.setToSingle(this.bubble);
                event.target.style.opacity = .5;
                event.dataTransfer.setData('Text', "dummy data for dragging to work in Firefox");
                this.$store.dispatch('setDragged', this.bubble);
                this.isContainerDragOver = false;
                this.isDragging = true;
                GraphUi.disableDragScroll();
            },
            dragMove: function (event) {
                return;
                if (this.$store.state.dragged.getId() !== this.bubble.getId()) {
                    console.log(this.bubble.getLabel());
                    // debugger;
                    return;
                }
            },
            dragEnd: function (event) {
                event.preventDefault();
                event.target.style.opacity = 1;
                GraphUi.enableDragScroll();
                this.isDragging = false;
                this.$store.dispatch('setDragged', null);
            },
            labelDragStart: function () {
                clearTimeout(this.dragOverTimeout);
            },
            labelDragEnter: function (event) {
                /*
                method name is drag enter but actually
                called on drag over to enable drop handler to trigger
                I don't know why !
                 */
                event.preventDefault();
                event.stopPropagation();
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
            foo: function () {

            },
            labelDragLeave: function (event) {
                event.preventDefault();
                // console.log("label drag leave");
                this.isLabelDragOver = false;
            },
            labelDrop: function (event) {
                // console.log("label drop");
                // debugger;
                event.preventDefault();
                event.stopPropagation();
                GraphUi.enableDragScroll();
                let parent = this.bubble;
                this.isLabelDragOver = false;
                let dragged = this.$store.state.dragged;
                this.$store.dispatch('setDragged', null);
                if (dragged === null) {
                    return;
                }
                dragged.getController().moveUnderParent(
                    parent
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
                if (dragged.getId() === edge.destinationVertex.getId()) {
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
            resetDragOver: function (event) {
                event.preventDefault();
                this.dragOverTimeout = setTimeout(function () {
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
                clearTimeout(this.dragOverTimeout);
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
                clearTimeout(this.dragOverTimeout);
                let bubble = this.bubble.isEdge() ? this.bubble.getNextBubble() : this.bubble;
                if (this.$store.state.dragged.getId() === bubble.getId()) {
                    return;
                }
                this.isContainerDragOver = true;
                this.isBottomDragOver = true;
            },
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
        border-top: 1px dashed red
    }

    .dotted-border-bottom {
        border-bottom: 1px dashed red
    }

    .vertex-drag-over {
        position: absolute !important;
        height: 40% !important;
        width: 100% !important;
        max-width: 500px !important;
    }
</style>
