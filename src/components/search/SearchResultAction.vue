<template>
    <v-list-item-action class="vh-center mb-0">
        <img v-if="item.source ==='wikidata'" :src="require('@/assets/wikipedia.svg')" width="25" class="mt-1 mr-2">
        <span v-else>
            <v-icon v-if="item.isCenter" class="mr-2 mb-4">
                filter_center_focus
            </v-icon>
            <img v-if="item.original.isTagFromWikipedia()" :src="require('@/assets/wikipedia.svg')" width="25"
                 class="mt-0 mr-2">
        </span>
        <div class="caption" v-if="isOnMap()">
            <v-icon small class="mr-1">map</v-icon>
            {{$t('app:on')}}
        </div>
        <div class="caption" v-if="isOnMap()">
            {{$t('app:thisMap')}}
        </div>
    </v-list-item-action>
</template>

<script>
    import CurrentSubGraph from "@/graph/CurrentSubGraph";

    export default {
        name: "SearchResultAction",
        props: ['item'],
        methods: {
            isOnMap: function () {
                const subGraph = CurrentSubGraph.get();
                return subGraph.center && subGraph.hasUri(this.item.uri)
            }
        }
    }
</script>

<style scoped>

</style>