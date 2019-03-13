<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout
            v-if="loaded"
            draggable="true"
            row :class="{
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
                 draggable="true"
            >
                <div
                        v-if="bubble.isVertex()"
                        class="bubble vertex graph-element relative" :class="{
                        'selected' : isSelected,
                        'center-vertex': bubble.isCenter,
                        'reverse': bubble.orientation === 'left'
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
    import I18n from '@/I18n'

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
                loaded: false
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
            document.addEventListener("dragstart", function (event) {
                // Stocke une référence sur l'objet glissable
                // dragged = event.target;
                // transparence 50%
                event.target.style.opacity = .5;
            }, false);
            this.loaded = true;
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

</style>
