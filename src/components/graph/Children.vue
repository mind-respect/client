<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        <div class="vertices-children-container" v-if="bubble.isGroupRelation()">
            <div v-for="child in bubble.sortedImmediateChild(bubble.parentVertex)" :key="child.uiId">
                <div v-for="(triple, uiId) in child">
                    <Bubble :bubble="addEdgeContext(triple.edge, triple.vertex, bubble.parentVertex)"></Bubble>
                </div>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isEdge()">
            <Bubble :bubble="addVertexContext(bubble.destinationVertex, bubble.parentVertex)"></Bubble>
        </div>
        <div class="vertices-children-container" v-if="!bubble.isCenter && bubble.isVertex()">
            <div v-for="triple in bubble.rightBubbles" :key="triple.edge.uiId">
                <Bubble :bubble="addEdgeContext(triple.edge, triple.destination, bubble)"></Bubble>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Children",
        components: {
            Bubble: () => import('@/components/graph/Bubble')
        },
        mounted: function () {
            // console.log(Bubble);
        },
        methods: {
            addVertexContext: function (vertex, parentVertex) {
                vertex.parentVertex = parentVertex;
                return this.addCommonContext(vertex);
            },
            addEdgeContext: function (edge, destinationVertex, parentVertex) {
                edge.destinationVertex = destinationVertex;
                edge.parentVertex = parentVertex;
                return this.addCommonContext(edge);
            },
            addCommonContext: function (bubble) {
                bubble.parentBubble = this.bubble;
                bubble.orientation = this.bubble.orientation;
                return bubble;
            }
        },
        props: ['bubble', 'childVertex', 'parentVertex', 'orientation']
    }
</script>

<style scoped>

</style>
