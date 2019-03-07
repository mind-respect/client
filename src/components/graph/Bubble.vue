<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout row :class="{
        'vertex-tree-container': !bubble.isCenter,
        'vertex-container': bubble.isCenter
    }" :id="containerId">
        <v-flex xs12 class="v-center">
            <v-spacer v-if="bubble.orientation === 'left'"></v-spacer>
            <Children :bubble="bubble"
                      v-if="bubble.orientation === 'left'"
            >
            </Children>
            <div class='vertex-container draggable' :class="{
                'vh-center':bubble.orientation === 'center',
                'left':bubble.orientation === 'right'
            }" @click="click" @dblclick="dblclick"
                 :id="bubble.uiId"
            >
                <div class="bubble vertex graph-element relative" v-if="bubble.isVertex()" :class="{
                    'selected' : isSelected,
                    'center-vertex': bubble.isCenter,
                    'reverse': bubble.orientation === 'left'
                }">
                    <div class="image_container"></div>
                    <div class="in-bubble-content-wrapper">
                        <div class="in-bubble-content">
                            <div class="bubble-label ui-autocomplete-input "
                                 @blur="leaveEditFlow"
                                 data-placeholder="relate"
                                 autocomplete="off" v-text="bubble.getServerFormat().label"
                                 @keydown="keydown"></div>
                            <div class="in-label-buttons"></div>
                            <!--<v-text-field v-model="vertex.getServerFormat().label"></v-text-field>-->
                        </div>
                    </div>
                    <ChildNotice :bubble="bubble"
                                 v-if="!bubble.isCenter && !bubble.isExpanded && bubble.getNumberOfChild() > 0"></ChildNotice>
                    <!--<span class="connector"></span>-->
                </div>
                <div class="bubble relation graph-element relative"
                     v-if="bubble.isEdge() || (bubble.isGroupRelation() && bubble.isTrulyAGroupRelation())" :class="{
                    'selected' : isSelected
                }">
                    <div class="hidden-properties-container hidden-sm-and-up">
                        <div class="hidden-properties-content hidden" title="" data-original-title="Expand (ctrl+E)">0
                            ...
                        </div>
                        <i class="loading hidden fa fa-refresh fa-spin fa-4x fa-fw"></i></div>
                    <div class="image_container"></div>
                    <div class="in-bubble-content">
                        <div class="label-container">
                            <div class="label label-info label-and-buttons">
                                <div class="bubble-label ui-autocomplete-input"
                                     @blur="leaveEditFlow"
                                     data-placeholder="relate"
                                     autocomplete="off" v-text="bubble.getServerFormat().label"
                                     @keydown="keydown"></div>
                            </div>
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
                SelectionHandler: SelectionHandler
            }
        },
        mounted: function () {
            if (this.bubble.isCenter) {
                this.containerId = "center";
            }
            if (this.bubble.isEdge()) {
                this.bubble.setSourceVertex(this.bubble.parentVertex);
                this.bubble.setDestinationVertex(this.bubble.destinationVertex);
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

    .hidden-properties-container {
        z-index: 3;
        min-width: 25px;
        cursor: pointer;
        font-size: 22px;
        font-weight: bold;
        color: red;
    }
</style>
