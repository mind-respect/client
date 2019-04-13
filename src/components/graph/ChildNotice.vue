<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="hidden-properties-container vh-center" @click="click">
        <div class="hidden-properties-content bubble-size vh-center"
             :class="{
                'reverse' : bubble.orientation === 'left'
             }"
             v-if="!loading"
             title=""
             data-original-title="Expand (ctrl+E)"
        >
            <span>
                <v-badge :left="bubble.isToTheLeft()" color="secondary">
                    <span slot="badge">
                        {{bubble.getNumberOfChild()}}
                    </span>
                    <v-icon large color="third">bubble_chart</v-icon>
                </v-badge>
            </span>
        </div>
        <v-progress-circular indeterminate color="third" v-if="loading"></v-progress-circular>
    </div>
</template>

<script>
    import Scroll from '@/Scroll'
    import Vue from 'vue'

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
                    Scroll.centerBubbleForTreeIfApplicable(
                        this.bubble,
                        true
                    );
                }.bind(this));
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
