<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="mind_map">
        <Graph></Graph>
    </div>
</template>

<script>
    import GraphDisplayer from '@/graph/GraphDisplayer'
    import GraphDisplayerFactory from '@/graph/GraphDisplayerFactory'
    import Graph from '@/components/graph/Graph'
    import GraphUi from '@/graph/GraphUi'
    import KeyboardActionsHandler from '@/KeyboardActionsHandler'

    export default {
        name: "Center",
        components: {
            Graph
        },
        mounted: function () {
            GraphDisplayer.setImplementation(
                GraphDisplayerFactory.getByName(
                    "relative_tree"
                )
            );
            GraphUi.initDragScroll();
            GraphUi.enableDragScroll();
            KeyboardActionsHandler.enable();
        }
    }
</script>

<style scoped>
    #mind_map {
        width: 100%;
        height: 100%;
    }
</style>
