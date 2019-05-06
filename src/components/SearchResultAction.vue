<template>
    <v-list-tile-action>
        <i v-if="item.source ==='wikidata'" class="fab fa-wikipedia-w mt-1"></i>
        <span v-else>
            <v-icon>
                {{item.original.getIcon(item)}}
            </v-icon>
            <i v-if="item.original.isTagFromWikipedia()" class="fab fa-wikipedia-w mt-1 ml-2"></i>
        </span>
    </v-list-tile-action>
</template>

<script>
    export default {
        name: "SearchResultAction",
        props: ['item']
    }
</script>

<style scoped>

</style>