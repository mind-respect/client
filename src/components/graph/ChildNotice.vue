<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="hidden-properties-container" @click="click">
        <div class="hidden-properties-content bubble-size"
             :class="{
                'reverse' : bubble.orientation === 'left'
             }"
             v-if="!bubble.loading"
             title=""
             data-original-title="Expand (ctrl+E)"
        >
            <span>...</span>
            <span>{{bubble.getNumberOfChild()}}</span>
        </div>
        <v-progress-circular indeterminate color="red" v-if="bubble.loading"></v-progress-circular>
    </div>
</template>

<script>
    import Vue from 'vue'
    import Scroll from '@/Scroll'

    export default {
        name: "ChildNotice",
        props: ['bubble'],
        methods: {
            click: function () {
                this.bubble.loading = true;
                this.bubble.getController().expand().then(function () {
                    this.bubble.loading = false;
                    Scroll.centerBubbleIfApplicable(
                        this.bubble
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

</style>
