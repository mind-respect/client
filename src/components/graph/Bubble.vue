<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout
            v-if="loaded"
            row :class="{
        'vertex-tree-container': !bubble.isCenter,
        'vertex-container': bubble.isCenter,
        'drag-over' : isContainerDragOver
    }" :id="containerId">
        <v-flex class="v-center">
            <v-spacer v-if="bubble.orientation === 'left'"></v-spacer>
            <Children :bubble="bubble"
                      v-if="bubble.orientation === 'left'"
            >
            </Children>
            <div class='vertex-container' :class="{
                'vh-center':bubble.orientation === 'center',
                'left':bubble.orientation === 'right'
            }" @click="click" @dblclick="dblclick"
                 :id="bubble.uiId"
                 draggable="true"
            >
                <div
                        v-if="bubble.isVertex()"
                        class="bubble vertex graph-element relative" :class="{
                        'selected' : isSelected,
                        'center-vertex': bubble.isCenter,
                        'reverse': bubble.orientation === 'left',
                        'drag-over': isDragOver
                }">
                    <div class="image_container"></div>
                    <div class="in-bubble-content-wrapper">
                        <div class="in-bubble-content">
                            <div class="bubble-label ui-autocomplete-input bubble-size font-weight-regular"
                                 @blur="leaveEditFlow"
                                 :data-placeholder="$t('vertex:default')"
                                 autocomplete="off" v-text="bubble.getServerFormat().label"
                                 @keydown="keydown"></div>
                            <div class="in-label-buttons"></div>
                            <!--<v-text-field v-model="vertex.getServerFormat().label"></v-text-field>-->
                        </div>
                    </div>
                    <ChildNotice :bubble="bubble"
                                 v-if="bubble.canExpand()"></ChildNotice>
                    <!--<span class="connector"></span>-->
                </div>
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
                                     :data-placeholder="relationPlaceholder"
                                     autocomplete="off"
                                     v-show="!bubble.isShrinked()"
                                     v-text="bubble.getServerFormat().label"
                                     @keydown="keydown"></div>
                            </v-chip>
                        </div>
                        <!--<v-text-field v-model="vertex.getServerFormat().label"></v-text-field>-->
                    </div>
                    <!--<span class="connector"></span>-->
                </div>
            </div>
            <Children :bubble="bubble"
                      v-if="bubble.orientation === 'right'"
            >
            </Children>
            <!--<div class="vertical-border vertical-border-first small">-->
            <!--<div class="vertical-border-filling"></div>-->
            <!--</div>-->
            <!--<span class="arrow vertex"></span>-->
            <!--<div class="vertical-border vertical-border-second small">-->
            <!--<div class="vertical-border-filling"></div>-->
            <!--</div>-->
            <!--<div class="vertical-border vertical-border-third small">-->
            <!--<div class="vertical-border-filling"></div>-->
            <!--</div>-->
        </v-flex>
    </v-layout>
</template>

<script>
    import SelectionHandler from '@/SelectionHandler'
    import UiUtils from '@/UiUtils'
    import FriendlyResourceService from '@/friendly-resource/FriendlyResourceService'
    import KeyCode from 'keycode-js';
    import Children from '@/components/graph/Children'
    import ChildNotice from '@/components/graph/ChildNotice'
    import Vue from 'vue'
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
                isDragOver: false,
                isContainerDragOver: false
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
            Vue.nextTick(function () {
                this.setupDrag();
            }.bind(this));
        },
        computed: {
            relationPlaceholder: function () {
                return this.isSelected ? this.$t('edge:default') : "";
            }
        },
        methods: {
            click: function (event) {
                event.stopPropagation();
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
            setupDrag: function () {
                let html = this.bubble.getHtml();
                html.addEventListener("mousedown", function (event) {
                    GraphUi.disableDragScroll();
                });
                html.addEventListener("click", function (event) {
                    GraphUi.enableDragScroll();
                });
                html.addEventListener("dragstart", function (event) {
                    event.target.style.opacity = .5;
                    event.dataTransfer.setData('Text', "dummy data for dragging to work in Firefox");
                    this.dragged = true;
                    this.$store.dispatch('setDragged', this.bubble);
                    GraphUi.setIsDraggingBubble(true);
                    GraphUi.disableDragScroll();
                    // var ghostImage = graphElementUi.getLabel().get(0);
                    // $("#drag-bubble-text-for-chrome").text(
                    //     graphElementUi.getTextOrDefault()
                    // );
                    // if (event.originalEvent) {
                    //     event.originalEvent.dataTransfer.setDragImage(ghostImage, 0, 0);
                    // }
                }.bind(this), false);
                html.addEventListener("dragend", function (event) {
                    event.preventDefault();
                    event.target.style.opacity = 1;
                    GraphUi.setIsDraggingBubble(false);
                    GraphUi.enableDragScroll();
                    this.$store.dispatch('setDragged', null);
                }.bind(this));
                let labelHtml = this.bubble.getLabelHtml();

                labelHtml.addEventListener("dragover", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // this.bubble.getHtml().parents(".vertex-tree-container").removeClass("drag-over");
                    this.isDragOver = false;
                    let dragged = this.$store.state.dragged;
                    let shouldSetToDragOver = dragged !== undefined &&
                        dragged.getUri() !== this.bubble.getUri();
                    if (!shouldSetToDragOver) {
                        return;
                    }
                    this.isDragOver = true;
                }.bind(this));
                labelHtml.addEventListener("dragleave", function (event) {
                    event.preventDefault();
                    this.isDragOver = false;
                }.bind(this));
                labelHtml.addEventListener("drop", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    GraphUi.enableDragScroll();
                    GraphUi.setIsDraggingBubble(false);
                    let parent = this.bubble;
                    this.isDragOver = false;
                    let dragged = this.$store.state.dragged;
                    this.$store.dispatch('setDragged', null);
                    if (dragged === null) {
                        return;
                    }

                    dragged.getController().moveUnderParent(
                        parent
                    );
                }.bind(this));
                let container = document.getElementById(this.containerId);
                container.addEventListener("dragover", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.isContainerDragOver = false;
                    let bubble = this.bubble;
                    if (bubble.isVertex()) {
                        bubble = bubble.getParentBubble();
                    }
                    let bubbleChild = bubble.getNextBubble();
                    let dragged = this.$store.state.dragged;
                    if (dragged.getId() === bubble.getId() || dragged.getId() === bubbleChild.getId()) {
                        return;
                    }
                    this.isContainerDragOver = true;
                }.bind(this));
                container.addEventListener("dragleave", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.isContainerDragOver = false;
                }.bind(this));
                container.addEventListener("drop", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.isContainerDragOver = false;
                    let edge = this.bubble;
                    if (edge.isVertex()) {
                        edge = edge.getParentBubble();
                    }
                    let dragged = this.$store.state.dragged;
                    this.$store.dispatch('setDragged', null);
                    if (dragged.getId() === edge.getId()) {
                        return;
                    }
                    let mouseY = event.clientY;
                    let edgeLabelHtml = edge.getHtml().querySelectorAll('.label-container')[0];
                    let edgeYPosition = edgeLabelHtml.getBoundingClientRect().top + edgeLabelHtml.offsetHeight;
                    if (mouseY > edgeYPosition) {
                        dragged.getController().moveBelow(
                            edge
                        );
                    } else {
                        dragged.getController().moveAbove(
                            edge
                        );
                    }
                }.bind(this));
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

    .bubble-size {
        font-size: 18px !important;
    }

    .is-shrinked {
        height: 10px !important;
        width: 10px !important;
    }

    .left-oriented .leaf {
        padding-left: 500px;
    }

    .right-oriented .leaf {
        padding-right: 500px;
    }

    .bubble.drag-over .in-bubble-content {
        border: 3px dashed red;
        border-radius: 50px;
    }

    .vertex-tree-container.drag-over {
        border-top: dashed red 3px;
        border-bottom: dashed red 3px;
        border-radius: 0;
    }
</style>
