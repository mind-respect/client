<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="hidden-properties-container vh-center unselectable" @click="click" v-if="loaded">
        <div class="hidden-properties-content bubble-size vh-center"
             :class="{
                'reverse' : bubble.direction === 'left'
             }"
             v-if="!loading && !bubble.loading"
             title=""
             data-original-title="Expand (ctrl+E)"
        >
            <span>
                <v-tooltip
                        :right="!isLeft"
                        :left="isLeft"
                        min-width="125"
                        open-delay="1000"
                        :content-class="tooltipContentClass"
                >
                    <v-badge :left="isLeft" color="secondary" slot="activator">
                        <span slot="badge">
                            <span v-if="$store.state.isViewOnly && bubble.isVertex()">
                                {{bubble.getNbPublicNeighbors() - 1}}
                            </span>
                            <span v-else>
                                {{bubble.getNumberOfChild()}}
                            </span>
                        </span>
                        <v-icon large color="third">bubble_chart</v-icon>
                    </v-badge>
                    <span>{{$t('childNotice:' + tooltipKey)}}</span>
                </v-tooltip>
            </span>
        </div>
        <v-progress-circular indeterminate color="third" v-if="loading || bubble.loading"></v-progress-circular>
    </div>
</template>

<script>
    import Scroll from '@/Scroll'
    import Vue from 'vue'
    import Selection from '@/Selection'
    import Store from '@/store'
    import UiUtils from '@/UiUtils'

    export default {
        name: "ChildNotice",
        props: ['bubble'],
        data: function () {
            return {
                loaded: false,
                loading: false,
                tooltipKey: UiUtils.isMacintosh() ? "tooltipForMac" : "tooltip",
                isLeft: null,

            }
        },
        mounted: function () {
            this.isLeft = this.bubble.isToTheLeft();
            this.tooltipContentClass = this.isLeft ? "mr-5" : "ml-4";
            this.loaded = true;
        },
        methods: {
            click: function () {
                let expandedDuplicate = this.bubble.getDuplicates().filter((duplicate) => {
                    return duplicate.isExpanded;
                });
                if (expandedDuplicate.length) {
                    Selection.setToSingle(expandedDuplicate[0]);
                    Scroll.goToGraphElement(expandedDuplicate[0]);
                    return;
                }
                this.loading = this.bubble.loading = true;
                this.bubble.getController().expand().then(() => {
                    Vue.nextTick(() => {
                        this.loading = this.bubble.loading = false;
                    });
                    Selection.setToSingle(this.bubble);
                    Store.dispatch("redraw");
                });
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

    /*.right-oriented .hidden-properties-container{*/
    /*position:absolute;*/
    /*top:30%;*/
    /*}*/
</style>
