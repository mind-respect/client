<!--
  - Copyrigh1t Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="center.getImmediateChild">
        <EdgeDrawing :bubble="center" :isLeft="true" v-if="center.isToTheLeft() || center.isCenter"></EdgeDrawing>
        <EdgeDrawing :bubble="center" :isLeft="false" v-if="!center.isToTheLeft() || center.isCenter"></EdgeDrawing>
        <GraphDrawing
                v-for="child in center.getImmediateChild()"
                :center="child"
                :key="child.uiId"
        ></GraphDrawing>
    </div>
</template>

<script>
    import EdgeDrawing from '@/components/graph/EdgeDrawing'

    export default {
        name: "GraphDrawing",
        components: {EdgeDrawing},
        props: ['center'],
        data: function () {
            return {}
        },
        mounted: function () {
            if (!this.center.getImmediateChild) {
                console.warn("no immediate child ? el id " + this.center.getId())
            }
        }
    }
</script>

<style scoped>

</style>
