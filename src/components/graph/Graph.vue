<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="drawn_graph" v-if="loaded">
        {{center.getLabel()}}
        <div>
        </div>
        <div v-for="groupRelationRoot in center.groupRelationRoots">
            <Bubble :bubble="groupRelationRoot"></Bubble>
            <div v-for="vertex in groupRelationRoot.getVerticesAsArray()">
                <Bubble :bubble="vertex"></Bubble>
            </div>
        </div>

    </div>
</template>

<script>
    import GraphService from '@/graph/GraphService'
    import MindMapInfo from '@/MindMapInfo'
    import TreeDisplayerCommon from '@/graph/TreeDisplayerCommon'
    import SubGraph from '@/graph/SubGraph'
    import Bubble from '@/components/graph/Bubble'

    export default {
        name: "Graph",
        components: {
            Bubble
        },
        data: function () {
            return {
                graph: null,
                center: null,
                loaded: false
            }
        },
        mounted: function () {
            let centerUri = MindMapInfo.getCenterBubbleUri();
            GraphService.getForCentralBubbleUri(
                centerUri
            ).then(function (response) {
                let serverGraph = response.data;
                TreeDisplayerCommon.setUiTreeInfoToVertices(
                    serverGraph,
                    centerUri
                );
                this.graph = new SubGraph.SubGraph(
                    serverGraph,
                    centerUri
                );
                this.center = this.graph.getCenter();
                this.loaded = true;
            }.bind(this));
        },
        methods: {
            go: function (mu) {
                console.log(mu);
            }
        }
    }
</script>

<style scoped>

</style>
