<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="areChildrenLoaded && !center.isEditFlow" :key="center.uiId">
        <EdgeDrawing :bubbleIds="centerIds" :isLeft="true" v-if="isLeft || isCenter"></EdgeDrawing>
        <EdgeDrawing :bubbleIds="centerIds" :isLeft="false" v-if="!isLeft || isCenter"></EdgeDrawing>
        <GraphDrawing
                v-for="child in children"
                :centerIds="child"
                :key="child.uiId"
        ></GraphDrawing>
    </div>
</template>

<script>
    import EdgeDrawing from '@/components/graph/EdgeDrawing'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'

    export default {
        name: "GraphDrawing",
        components: {EdgeDrawing},
        props: ['centerIds'],
        data: function () {
            return {
                areChildrenLoaded: false,
                isLeft: null,
                isCenter: null,
                children: null,
                center: null
            }
        },
        mounted: function () {
            let center = CurrentSubGraph.idToInstance(this.centerIds);
            this.center = center;
            this.isLeft = center.isToTheLeft();
            this.isCenter = center.isCenter;
            if (!center.getImmediateChild) {
                debugger;
                return;
            }
            this.children = CurrentSubGraph.graphElementsAsIds(
                center.getImmediateChild()
            );
            this.showWhenChildrenLoaded(center);
        },
        methods: {
            showWhenChildrenLoaded: function (center) {
                if (!this.children) {
                    console.warn("no immediate child ? el id " + center.getId())
                    return false
                }
                if (this.children.length === 0) {
                    return;
                }
                this.areChildrenLoaded = true;
            }
        },
        computed: {}
    }
</script>

<style scoped>

</style>
