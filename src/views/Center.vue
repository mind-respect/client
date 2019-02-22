<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="mind_map">
        <Graph></Graph>
    </div>
</template>

<script>
    import CenterFlow from '@/flow/CenterFlow'
    import GraphDisplayer from '@/graph/GraphDisplayer'
    import GraphDisplayerFactory from '@/graph/GraphDisplayerFactory'
    import JqueryUniqueId from '@/jquery/jquery.unique-id'
    import Graph from '@/components/graph/Graph'

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
        }
    }
</script>

<style scoped>

</style>
