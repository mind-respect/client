<template>
    <v-list-tile-content>
        <v-list-tile-title>
            {{item.label}}
        </v-list-tile-title>
        <v-list-tile-sub-title>
            <span v-if="item.source ==='wikidata'">
                {{item.description}}
            </span>
            <span v-else>
            <span v-if="item.original.getGraphElementType() === 'vertex'" class="around-list">
                <span v-for="context in Object.values(item.original.context)"
                      class="around-list-item">
                    {{context}}
                </span>
            </span>
            <span v-else>
                {{item.original.somethingToDistinguish}}
            </span>
        </span>
        </v-list-tile-sub-title>
    </v-list-tile-content>
</template>

<script>
    export default {
        name: "SearchResult",
        props: ['item']
    }
</script>

<style scoped>

</style>