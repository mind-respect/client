<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="hidden-properties-container vh-center" @click="click">
        <div class="hidden-properties-content bubble-size vh-center"
             :class="{
                'reverse' : bubble.orientation === 'left'
             }"
             v-if="!loading && !bubble.loading"
             title=""
             data-original-title="Expand (ctrl+E)"
        >
            <span>
                <v-tooltip
                        :right="!bubble.isToTheLeft()"
                        :left="bubble.isToTheLeft()"
                        min-width="125"
                        open-delay="1000"
                        :content-class="tooltipContentClass"
                >
                    <v-badge :left="bubble.isToTheLeft()" color="secondary" slot="activator">
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
    import SelectionHandler from '@/SelectionHandler'
    import Store from '@/store'
    import UiUtils from '@/UiUtils'

    export default {
        name: "ChildNotice",
        props: ['bubble'],
        data: function () {
            return {
                loading: false
            }
        },
        methods: {
            click: function () {
                this.loading = this.bubble.loading = true;
                this.bubble.getController().expand().then(function () {
                    Vue.nextTick(function () {
                        this.loading = this.bubble.loading = false;
                    }.bind(this))
                    SelectionHandler.setToSingle(this.bubble);
                    Store.dispatch("redraw");
                }.bind(this));
            }
        },
        computed: {
            tooltipKey: function () {
                return UiUtils.isMacintosh() ? "tooltipForMac" : "tooltip";
            },
            tooltipContentClass: function(){
                return this.bubble.isToTheLeft() ? "mr-5" : "ml-4"
            }
        },
        mounted: function () {

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
