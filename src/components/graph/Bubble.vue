<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="vertex-tree-container">
        <div class='vertex-container draggable' @click="click" @dblclick="dblclick" :id="bubble.uiId">
            <div class="bubble graph-element" :class="{
                'selected' : bubble.isSelected,
                'vertex': bubble.isVertex(),
                'relation': bubble.isEdge()
            }">
                <div class="hidden-properties-container"></div>
                <div class="image_container"></div>
                <div class="in-bubble-content ">
                    <div class="label-container">
                        <div class="label label-info label-and-buttons">
                            <div class="bubble-label ui-autocomplete-input" :contenteditable="bubble.editFlow"
                                 @blur="leaveEditFlow"
                                 data-placeholder="relate"
                                 autocomplete="off" v-text="bubble.getServerFormat().label"></div>
                            <div class="in-label-buttons" v-if="false"></div>
                        </div>
                    </div>
                    <!--<v-text-field v-model="vertex.getServerFormat().label"></v-text-field>-->
                </div>
                <!--<span class="connector"></span>-->
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.getVerticesAsArray">
            <div v-for="vertex in bubble.getVerticesAsArray()">
                <Bubble :bubble="vertex"></Bubble>
            </div>
        </div>
        <div class="vertical-border vertical-border-first small">
            <div class="vertical-border-filling"></div>
        </div>
        <div class="vertical-border vertical-border-second small">
            <div class="vertical-border-filling"></div>
        </div>
        <div class="vertical-border vertical-border-third small">
            <div class="vertical-border-filling"></div>
        </div>
        <span class="clear-fix"></span>
    </div>
</template>

<script>
    import SelectionHandler from '@/SelectionHandler'
    import UiUtils from '@/UiUtils'
    import Vue from 'vue'
    import Focus from '@/Focus'

    export default {
        name: "Bubble",
        props: ['bubble'],
        mounted: function () {
            this.bubble.editFlow = false;
            // console.log(this.bubble);
            // debugger;
            // this.bubble =
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
                console.log("aaaaaa")
                this.bubble.editFlow = true;
                Vue.nextTick(function () {
                    let labelHtml = this.bubble.getLabelHtml();
                    labelHtml.contentEditable = "true";
                    Focus.focusAtPosition(event, labelHtml);
                }.bind(this));
            },
            leaveEditFlow: function () {
                console.log("bbbbb")
                this.bubble.editFlow = false;
            }
        }
    }
</script>

<style scoped>

</style>
