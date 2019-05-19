<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        <div class="vertices-children-container" v-if="!bubble.isCenter && bubble.isVertex()">
            <div v-for="child in bubble.rightBubbles" :class="{
                        'mt-3 mb-3' : bubble.rightBubbles.length === 2,
                        'mt-0 mb-0' : bubble.rightBubbles.length > 2
                        }">
                <Bubble v-if="child.isGroupRelation" :bubble="addGroupRelationContext(child, bubble)"></Bubble>
                <Bubble v-else :bubble="addEdgeContext(child, child.destination, bubble)"></Bubble>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isEdge()" transition="fade-transition">
            <Bubble :bubble="addVertexContext(bubble.sourceVertex, bubble.destinationVertex)"
                    v-if="bubble.isInverse()"></Bubble>
            <Bubble :bubble="addVertexContext(bubble.destinationVertex, bubble.sourceVertex)" v-else></Bubble>
        </div>
        <div class="vertices-children-container" v-if="bubble.isGroupRelation()" transition="fade-transition">
            <div v-for="child in bubble._sortedImmediateChild"
                 :class="{
                    'mt-3 mb-3' : bubble._sortedImmediateChild.length === 2,
                    'mt-2 mb-2' : bubble._sortedImmediateChild.length > 2
                 }"
            >
                <Bubble v-if="child.isGroupRelation && child.isGroupRelation()"
                        :bubble="addGroupRelationContext(child, bubble.parentVertex)"></Bubble>
                <div v-else v-for="(triple, uiId) in child">
                    <Bubble :bubble="addEdgeContext(triple.edge, triple.vertex, bubble.parentVertex)"></Bubble>
                </div>
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
        },
        methods: {
            addVertexContext: function (vertex, parentVertex) {
                vertex.parentVertex = parentVertex;
                return this.addCommonContext(vertex);
            },
            addEdgeContext: function (edge, childVertex, parentVertex) {
                edge.updateSourceOrDestination(parentVertex);
                edge.updateSourceOrDestination(childVertex);
                edge.parentVertex = parentVertex;
                return this.addCommonContext(edge);
            },
            addGroupRelationContext: function (groupRelation, parentVertex) {
                groupRelation.parentVertex = parentVertex;
                return this.addCommonContext(groupRelation);
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
