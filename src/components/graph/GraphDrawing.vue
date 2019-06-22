<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="areChildrenLoaded && !center.isEditFlow" :key="center.uiId">
        <EdgeDrawing :bubble="center" :isLeft="true" v-if="isLeft || isCenter"></EdgeDrawing>
        <EdgeDrawing :bubble="center" :isLeft="false" v-if="!isLeft || isCenter"></EdgeDrawing>
        <GraphDrawing
                v-for="child in children"
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
                areChildrenLoaded: false,
                children: null
            }
        },
        mounted: function () {
            this.isLeft = this.center.isToTheLeft();
            this.isCenter = this.center.isCenter;
            if (!this.center.getNextChildren) {
                return;
            }
            this.children = this.center.getNextChildren();
            this.showWhenChildrenLoaded(this.center);
        },
        methods: {
            showWhenChildrenLoaded: function (center) {
                if (!this.children) {
                    console.warn("no immediate child ? el id " + center.getId());
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
