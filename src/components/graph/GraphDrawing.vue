<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="areChildrenLoaded && !center.isEditFlow" :key="center.uiId">
        <svg
                v-if="center.draw && !$store.state.isLoading"
                style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%;z-index:-1;"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg">
            <path
                    :d="svg"
                    fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
            />
        </svg>
    </div>
</template>

<script>
    import GraphDraw from '@/draw/GraphDraw'

    export default {
        name: "GraphDrawing",
        props: ['center'],
        data: function () {
            return {
                strokeColor: "#1a237e",
                strokeWidth: "2",
                areChildrenLoaded: false,
                children: null,
                svg: null
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
                this.svg = new GraphDraw(this.center).build();
                this.areChildrenLoaded = true;
            }
        },
        computed: {}
    }
</script>

<style scoped>

</style>
