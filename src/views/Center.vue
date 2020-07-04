<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="mind_map" v-if="graphCenterUri">
        <Graph :key="graphCenterUri + $store.state.centerRefresh"></Graph>
    </div>
</template>

<script>
    import GraphDisplayer from '@/graph/GraphDisplayer'
    import GraphDisplayerFactory from '@/graph/GraphDisplayerFactory'
    import Graph from '@/components/graph/Graph'
    import GraphUi from '@/graph/GraphUi'
    import KeyboardActions from '@/KeyboardActions'
    import GraphElement from '@/graph-element/GraphElement'

    export default {
        name: "Center",
        components: {
            Graph
        },
        data: function () {
            GraphDisplayer.setImplementation(
                GraphDisplayerFactory.getByName(
                    "relative_tree"
                )
            );
            GraphElement.initMenuHandlerGetters();
            //forceUpdate is used in tests
            return {
                forceUpdate: ""
            }
        },
        mounted: function () {
            GraphUi.initDragScroll(
                document.scrollingElement
            );
            GraphUi.enableDragScroll();
            KeyboardActions.init();
            KeyboardActions.enable();
            if (this.$vuetify.breakpoint.mdAndDown) {
                this.$store.dispatch("setSideMenuFlow", false);
            }
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
