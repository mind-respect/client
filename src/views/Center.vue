<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="mind_map">
        <div id="drawn_graph">

        </div>
    </div>
</template>

<script>
    import CenterFlow from '@/flow/CenterFlow'
    export default {
        name: "Center",
        mounted:function(){
            CenterFlow
        }
    }
</script>

<style scoped>

</style>
