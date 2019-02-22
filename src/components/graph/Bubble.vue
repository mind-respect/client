<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        {{bubble.getLabel()}}
        <v-text-field v-if="bubble.isVertex()" v-model="bubble.getServerFormat().label"></v-text-field>
    </div>
</template>

<script>
    export default {
        name: "Bubble",
        props: ['bubble'],
        mounted: function () {
            console.log(this.bubble);
            // debugger;
            // this.bubble =
        }
    }
</script>

<style scoped>

</style>
