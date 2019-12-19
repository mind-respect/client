<template>
    <v-list-item-content>
        <v-list-item-title>
            <v-badge color="transparent">
                <template v-slot:badge>
                    <v-icon v-if="item.source ==='wikidata'">
                        label
                    </v-icon>
                    <v-icon v-else>
                        {{item.original.getIcon(item)}}
                    </v-icon>
                </template>
                {{item.label}}
            </v-badge>
        </v-list-item-title>
        <v-list-item-subtitle>
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
        </v-list-item-subtitle>
    </v-list-item-content>
</template>

<script>
    export default {
        name: "SearchResult",
        props: ['item']
    }
</script>

<style scoped>

</style>