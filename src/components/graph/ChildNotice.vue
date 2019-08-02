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
                        open-delay="0"
                        :content-class="tooltipContentClass"
                >
                    <div slot="activator" class="vh-center" style="height:100%;">
                        <v-icon large color="secondary" class="ma-0 pa-0">{{icon}}</v-icon>
                    </div>
                    <div :class="{
                        'reverse': isLeft
                    }">
                        <v-avatar color="secondary" size="18" :left="isLeft" style="height:100%;" :class="{
                            'mr-2' : !isLeft,
                            'ml-2' : isLeft
                        }">
                            <span class="white--text body-2">{{nbChild}}</span>
                        </v-avatar>
                        <span>{{$t('childNotice:' + tooltipKey)}}</span>
                    </div>
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
                nbChild: null,
                icon: null
            }
        },
        mounted: function () {
            this.isLeft = this.bubble.isToTheLeft();
            this.tooltipContentClass = this.isLeft ? "mr-3" : "ml-2";
            this.icon = this.isLeft ? "arrow_left" : "arrow_right";
            this.nbChild = this.$store.state.isViewOnly && this.bubble.isVertex() ? this.bubble.getNbPublicNeighbors() - 1 : this.bubble.getNumberOfChild();
            if (this.nbChild > 9) {
                this.nbChild = "9+";
            }
            this.loaded = true;
        },
        methods: {
            click: function () {
                let expandedDuplicate = this.bubble.getExpandedDuplicates();
                if (expandedDuplicate.length) {
                    Selection.setToSingle(expandedDuplicate[0]);
                    Scroll.goToGraphElement(expandedDuplicate[0]);
                    return;
                }
                this.loading = this.bubble.loading = true;
                this.bubble.controller().expand().then(() => {
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
    }

</style>
