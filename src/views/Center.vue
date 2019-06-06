<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="mind_map" v-if="graphCenterUri">
        <Graph :key="graphCenterUri"></Graph>
    </div>
</template>

<script>
    import GraphDisplayer from '@/graph/GraphDisplayer'
    import GraphDisplayerFactory from '@/graph/GraphDisplayerFactory'
    import Graph from '@/components/graph/Graph'
    import GraphUi from '@/graph/GraphUi'
    import KeyboardActionsHandler from '@/KeyboardActionsHandler'
    import GraphElement from '@/graph-element/GraphElement'

    export default {
        name: "Center",
        components: {
            Graph
        },
        data: function () {
            return {
                forceUpdate: ""
            }
        },
        mounted: function () {
            GraphDisplayer.setImplementation(
                GraphDisplayerFactory.getByName(
                    "relative_tree"
                )
            );
            GraphElement.initMenuHandlerGetters();
            GraphUi.initDragScroll();
            GraphUi.enableDragScroll();
            KeyboardActionsHandler.init();
            KeyboardActionsHandler.enable();
        },
        computed: {
            graphCenterUri: function () {
                if (this.$route.name !== 'Center') {
                    return;
                }
                return this.$route.params.centerUri + this.forceUpdate
            }
        }
    }
</script>

<style scoped>
    #mind_map {
        width: 100%;
        height: 100%;
    }
</style>
