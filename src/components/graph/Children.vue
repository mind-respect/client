<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
        <div class="vertices-children-container" v-if="!isCenter && bubbleIds.type.isVertex()">
            <div v-for="child in rightBubbles" :class="{
                        'mt-4 mb-4' : rightBubbles.length === 2,
                        'mt-0 mb-0' : rightBubbles.length > 2
                        }">
                <Bubble v-if="child.isGroupRelation"
                        :bubbleIds="child"
                        :parentBubble="bubbleIds"
                        :parentVertex="bubbleIds"
                        :direction="direction"
                ></Bubble>
                <Bubble v-else
                        :bubbleIds="child"
                        :parentBubble="bubbleIds"
                        :parentVertex="bubbleIds"
                        :direction="direction"
                ></Bubble>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubbleIds.type.isEdge()" transition="fade-transition">
            <Bubble v-if="isInverse"
                    :bubbleIds="sourceVertex"
                    :parentBubble="bubbleIds"
                    :parentVertex="destinationVertex"
            ></Bubble>
            <Bubble v-else
                    :bubbleIds="destinationVertex"
                    :parentBubble="bubbleIds"
                    :parentVertex="sourceVertex"
            ></Bubble>
        </div>
        <div class="vertices-children-container" v-if="bubbleIds.type.isGroupRelation()" transition="fade-transition">
            <div v-for="child in _sortedImmediateChild"
                 :class="{
                    'mt-4 mb-4' : _sortedImmediateChild.length === 2,
                    'mt-2 mb-2' : _sortedImmediateChild.length > 2
                 }"
            >
                <Bubble v-if="child.isGroupRelation"
                        :bubbleIds="child"
                        :parentBubble="bubbleIds"
                        :parentVertex="parentVertex"
                ></Bubble>
                <div v-else v-for="(triple, uiId) in child">
                    <Bubble :bubbleIds="triple.edge"
                            :parentBubble="bubbleIds"
                            :parentVertex="parentVertex"
                    ></Bubble>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import CurrentSubGraph from '@/graph/CurrentSubGraph'

    let bubble;
    export default {
        name: "Children",
        props: [
            'bubbleIds',
            'parentBubble',
            'parentVertex',
            'direction'
        ],
        components: {
            Bubble: () => import('@/components/graph/Bubble')
        },
        data: function () {
            return {
                isCenter: false,
                isLeft: null,
                loaded: false
            }
        },
        mounted: function () {
            this.bubble = CurrentSubGraph.idToInstance(this.bubbleIds);
            this.isCenter = this.bubble.isCenter !== undefined && this.bubble.isCenter;
            this.isLeft = this.direction === "left";
            this.loaded = true;
        },
        methods: {
            addEdgeContext: function (edge, childVertex, parentVertex) {
                edge.parentVertex = parentVertex;
                return this.addCommonContext(edge);
            },
            addCommonContext: function (bubble) {
                this.bubble.parentBubble = this.bubble;
                this.bubble.orientation = this.this.bubble.orientation;
                return bubble;
            }
        },
        computed: {
            rightBubbles: function () {
                return this.bubble.rightBubbles ?
                    this.bubble.rightBubbles :
                    [];
            },
            sourceVertex: function () {
                return this.bubble.sourceVertex;
            },
            destinationVertex: function () {
                return this.bubble.destinationVertex;
            },
            _sortedImmediateChild: function () {
                return this.bubble._sortedImmediateChild ?
                    this.bubble._sortedImmediateChild :
                    [];
            },
            isInverse: function () {
                return this.bubble.isEdge() && this.bubble.isInverse();
            }
        }
    }
</script>

<style scoped>

</style>
