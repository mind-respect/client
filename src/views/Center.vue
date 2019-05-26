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

    import Vue from 'vue';
    import VueClipboard from 'vue-clipboard2'

    Vue.use(VueClipboard);

    export default {
        name: "Center",
        components: {
            Graph
        },
        data: function () {
            return {
                graphCenterUri: null
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
            this.graphCenterUri = this.$route.params.centerUri;
        },
        watch: {
            '$route.path'(to, from) {
                if (this.$route.name !== 'Center') {
                    return;
                }
                this.graphCenterUri = this.$route.params.centerUri;
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
