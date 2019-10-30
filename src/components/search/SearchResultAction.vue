<template>
    <v-list-item-action class="vh-center mb-0">
        <img v-if="item.source ==='wikidata'" :src="require('@/assets/wikipedia.svg')" width="25" class="mt-1 mr-2">
        <span v-else>
            <v-icon v-if="item.isCenter" class="mr-2 mb-4">
                filter_center_focus
            </v-icon>
            <img v-if="item.original.isTagFromWikipedia()" :src="require('@/assets/wikipedia.svg')" width="25" class="mt-0 mr-2">
            <v-icon class="mb-4">
                {{item.original.getIcon(item)}}
            </v-icon>
        </span>
    </v-list-item-action>
</template>

<script>
    export default {
        name: "SearchResultAction",
        props: ['item']
    }
</script>

<style scoped>

</style>