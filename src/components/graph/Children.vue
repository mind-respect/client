<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="loaded" @dragover="dragOver" @dragleave="dragLeave" @drop="childrenDrop">
        <div class="vertices-children-container" v-if="!isCenter && bubble.isVertexType()">
            <div v-for="child in bubble.rightBubbles" :class="{
                        'mt-6 mb-6' : bubble.rightBubbles.length === 2,
                        'mt-2 mb-2' : bubble.rightBubbles.length > 2
                        }"
                 :key="child.uiId"
            >
                <Bubble :bubble="child"
                        :direction="direction"
                ></Bubble>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isEdge()">
            <div :class="{
                    'mt-6 mb-6' : bubble.children.length === 2,
                    'mt-2 mb-2' : bubble.children.length > 2
                 }">
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
            <div v-for="child in bubble.children" :key="child.uiId" v-if="bubble.isRelation()"
                 :class="{
                    'mt-6 mb-6' : bubble.children.length === 2,
                    'mt-2 mb-2' : bubble.children.length > 2
                 }"
            >
                <Bubble :bubble="child"
                        :direction="direction"
                ></Bubble>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isGroupRelation()">
            <div v-for="child in bubble.children" :key="child.uiId"
                 :class="{
                    'mt-6 mb-6' : bubble.children.length === 2,
                    'mt-2 mb-2' : bubble.children.length > 2
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

    import Dragged from '@/Dragged'

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
        methods: {
            childrenDrop: function (event) {
                Dragged.handleDrop(event, this.bubble.getParentFork(), this.bubble.isToTheLeft());
            },
            dragOver: function (event) {
                event.preventDefault();
                // console.log("over " + this.bubble.getLabel())
            },
            dragLeave: function (event) {
                event.preventDefault();
            }
        },
        computed: {
            isInverse: function () {
                return this.bubble.isEdge() && this.bubble.isInverse();
            }
        },
        // updated: function () {
        //     console.log(this.bubble.getLabel())
        // }
    }
</script>

<style scoped>

</style>
