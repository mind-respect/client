<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="areChildrenLoaded && !center.isEditFlow">
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
            return {
                areChildrenLoaded: false
            }
        },
        mounted: function () {
            this.showWhenChildrenLoaded();
        },
        methods: {
            showWhenChildrenLoaded: function () {
                if (!this.center.getImmediateChild) {
                    console.warn("no immediate child ? el id " + this.center.getId())
                    return false
                }
                if (this.center.getImmediateChild().length === 0) {
                    return;
                }
                this.areChildrenLoaded = true;
            }
        }
    }
</script>

<style scoped>

</style>
