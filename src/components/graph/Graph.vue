<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="drawn_graph" v-if="loaded" v-dragscroll>
        <div class="vertices-children-container left-oriented"></div>
        <div class='root-vertex-super-container' data-zoom='1' id="center">
            {{center.getLabel()}}
        </div>
        <div class="vertices-children-container right-oriented">
            <div v-for="groupRelationRoot in center.groupRelationRoots">
                <Bubble :bubble="groupRelationRoot"></Bubble>
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
    import Scroll from '@/Scroll'
    import Vue from 'vue'

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
                Vue.nextTick(function () {
                    Scroll.goToGraphElement(
                        document.getElementById("center")
                    )
                })
            }.bind(this));
        },
        methods: {
            go: function (mu) {
                console.log(mu);
                // debugger;
            }
        }
    }
</script>

<style scoped>
    #drawn_graph {
        position: absolute;
        padding: 100%;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: scroll;
    }

    .root-vertex-super-container {
        width: 100%;
        height: 100%;
    / / padding-top: 50 %;
    / / padding-bottom: 50 %;
        table-layout: fixed
    }

    .vertices-children-container.left-oriented::before {
        margin-left: 2225px;
        content: " ";
        height: 100%;
        position: absolute;
    }
</style>
