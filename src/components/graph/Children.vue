<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
        <div class="vertices-children-container" v-if="!isCenter && bubble.isVertexType()">
            <div v-for="child in bubble._rightBubbles" :class="{
                        'mt-6 mb-6' : bubble._rightBubbles.length === 2,
                        'mt-0 mb-0' : bubble._rightBubbles.length > 2
                        }"
                 :key="child.uiId"
            >
                <Bubble :bubble="child"
                        :direction="direction"
                ></Bubble>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isEdge()">
            <Bubble
                    v-if="isInverse"
                    :bubble="bubble._sourceVertex"
                    :direction="direction"
            ></Bubble>
            <Bubble v-else
                    :bubble="bubble._destinationVertex"
                    :direction="direction"
            ></Bubble>
        </div>
        <div class="vertices-children-container" v-if="bubble.isGroupRelation()">
            <div v-for="child in bubble._children" :key="child.uiId"
                 :class="{
                    'mt-6 mb-6' : bubble._children.length === 2,
                    'mt-2 mb-2' : bubble._children.length > 2
                 }"
            >
                <Bubble :bubble="child"
                        :direction="direction"
                ></Bubble>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: "Children",
        props: [
            'bubble',
            'direction'
        ],
        components: {
            Bubble: () => import('@/components/graph/Bubble')
        },
        data: function () {
            return {
                loaded: false
            }
        },
        mounted: function () {
            this.isCenter = this.bubble.isCenter !== undefined && this.bubble.isCenter;
            this.loaded = true;
        },
        methods: {},
        computed: {
            isInverse: function () {
                return this.bubble.isEdge() && this.bubble.isInverse();
            }
        }
    }
</script>

<style scoped>

</style>
