<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="mind_map">
        <div id="drawn_graph">

        </div>
    </div>
</template>

<script>
    import CenterFlow from '@/flow/CenterFlow'
    import GraphDisplayer from '@/graph/GraphDisplayer'
    import GraphDisplayerFactory from '@/graph/GraphDisplayerFactory'
    import JqueryUniqueId from '@/jquery/jquery.unique-id'

    export default {
        name: "Center",
        mounted: function () {
            GraphDisplayer.setImplementation(
                GraphDisplayerFactory.getByName(
                    "relative_tree"
                )
            );
            CenterFlow.enterMindMapForAuthenticatedUser();
        }
    }
</script>

<style scoped>

</style>
