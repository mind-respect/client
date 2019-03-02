<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        <div class="vertices-children-container" v-if="bubble.isGroupRelation()">
            <div v-for="child in bubble.sortedImmediateChild(parentVertex)">
                <div v-for="(triple, uiId) in child">
                    <Bubble :bubble="triple.edge" :childVertex="triple.vertex" :orientation="orientation"></Bubble>
                </div>
            </div>
        </div>
        <div class="vertices-children-container" v-if="bubble.isEdge()">
            <Bubble :bubble="childVertex" :orientation="orientation"></Bubble>
        </div>
        <div class="vertices-children-container" v-if="!isCenter && bubble.isVertex()">
            <div v-for="triple in bubble.rightBubbles">
                <Bubble :bubble="triple.edge" :childVertex="triple.destination" :orientation="orientation"></Bubble>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Children",
        components:{
            Bubble: () => import('@/components/graph/Bubble')
        },
        mounted:function(){
            // console.log(Bubble);
        },
        props: ['bubble', 'childVertex', 'isCenter', 'parentVertex', 'orientation']
    }
</script>

<style scoped>

</style>
