<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded">
        <div class="vertices-children-container" v-if="!isCenter && bubble.isVertex()">
            <div v-for="child in bubble.rightBubbles" :class="{
                        'mt-4 mb-4' : bubble.rightBubbles.length === 2,
                        'mt-0 mb-0' : bubble.rightBubbles.length > 2
                        }">
                <Bubble :bubble="child"
                        :direction="direction"
                ></Bubble>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isEdge()">
            <Bubble
                    v-if="isInverse"
                    :bubble="bubble.sourceVertex"
                    :direction="direction"
            ></Bubble>
            <Bubble v-else
                    :bubble="bubble.destinationVertex"
                    :direction="direction"
            ></Bubble>
        </div>
        <div class="vertices-children-container" v-if="bubble.isGroupRelation()">
            <div v-for="child in bubble._sortedImmediateChild"
                 :class="{
                    'mt-4 mb-4' : bubble._sortedImmediateChild.length === 2,
                    'mt-2 mb-2' : bubble._sortedImmediateChild.length > 2
                 }"
            >
                <Bubble v-if="child.isGroupRelation"
                        :bubble="child"
                        :direction="direction"
                ></Bubble>
                <div v-else v-for="(triple, uiId) in child">
                    <Bubble
                            :bubble="triple.edge"
                            :direction="direction"
                    ></Bubble>
                </div>
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
            this.isLeft = this.direction === "left";
            this.loaded = true;
        },
        methods: {},
        computed:{
            isInverse: function () {
                return this.bubble.isEdge() && this.bubble.isInverse();
            }
        }
    }
</script>

<style scoped>

</style>
