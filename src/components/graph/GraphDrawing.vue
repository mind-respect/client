<!--
  - Copyrigh1t Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        <EdgeDrawing :bubble="center" :isLeft="true" v-if="center.isToTheLeft() || center.isCenter"></EdgeDrawing>
        <EdgeDrawing :bubble="center" :isLeft="false" v-if="!center.isToTheLeft() || center.isCenter"></EdgeDrawing>
        <GraphDrawing v-for="child in center.getImmediateChild()" :center="child"></GraphDrawing>
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
        }
    }
</script>

<style scoped>

</style>
