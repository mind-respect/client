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
                <transition :name="transitionName"
                            @before-enter="beforeExpandAnimation(child)" @after-leave="afterExpandAnimation"
                >
                    <Bubble :bubble="child"
                            :direction="direction"
                    ></Bubble>
                </transition>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isEdge()">
            <div :class="{
                    'mt-6 mb-6' : bubble.children.length === 2,
                    'mt-2 mb-2' : bubble.children.length > 2
                 }">
                <transition
                        v-if="isInverse"
                        :name="transitionName"
                        @before-enter="beforeExpandAnimation(bubble._sourceVertex)"
                        @after-leave="afterExpandAnimation"
                >
                    <Bubble
                            :bubble="bubble._sourceVertex"
                            :direction="direction"
                    ></Bubble>
                </transition>
                <transition
                        v-else
                        :name="transitionName"
                        @before-enter="beforeExpandAnimation(bubble._destinationVertex)"
                        @after-leave="afterExpandAnimation"
                >
                    <Bubble
                            :bubble="bubble._destinationVertex"
                            :direction="direction"
                    ></Bubble>

                </transition>
            </div>
            <div v-for="child in bubble.children" :key="child.uiId" v-if="bubble.isRelation()"
                 :class="{
                    'mt-6 mb-6' : bubble.children.length === 2,
                    'mt-2 mb-2' : bubble.children.length > 2
                 }"
            >
                <transition :name="transitionName"
                            @before-enter="beforeExpandAnimation(child)"
                            @after-leave="afterExpandAnimation"
                >
                    <Bubble :bubble="child"
                            :direction="direction"
                    ></Bubble>
                </transition>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isGroupRelation()">
            <div v-for="child in bubble.children" :key="child.uiId"
                 :class="{
                    'mt-6 mb-6' : bubble.children.length === 2,
                    'mt-2 mb-2' : bubble.children.length > 2
                 }"
            >
                <transition :name="transitionName"
                            @before-enter="beforeExpandAnimation(child)"
                            @after-leave="afterExpandAnimation"
                >
                    <Bubble :bubble="child"
                            :direction="direction"
                    ></Bubble>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>

    import Dragged from '@/Dragged'
    import UiUtils from '@/UiUtils'

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
                loaded: false,
                justLoaded: true
            }
        },
        mounted: async function () {
            this.isCenter = this.bubble.isCenter !== undefined && this.bubble.isCenter;
            this.loaded = true;
            await this.$nextTick();
            await this.$nextTick();
            this.justLoaded = false;
        },
        methods: {
            beforeExpandAnimation: async function (child) {
                if (UiUtils.isInAnimation || this.transitionName !== "expand-child") {
                    return;
                }
                console.log("draw in children")
                child.draw = false;
                await this.$store.dispatch("redraw");
                setTimeout(() => {
                    child.draw = true;
                    child.refreshChildren();
                }, 275);
            },
            afterExpandAnimation: function () {
                /*
                I dont know why but this is only called on collapse
                */
                console.log("after")
                this.bubble.refreshChildren();
                return;
            },
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
            },
            transitionName: function () {
                if (this.justLoaded) {
                    return "";
                }
                return this.bubble.isToTheLeft() ? "expand-child-left" : "expand-child";
            }
        },
        // updated: function () {
        //     console.log(this.bubble.getLabel())
        // }
    }
</script>

<style scoped>
</style>
