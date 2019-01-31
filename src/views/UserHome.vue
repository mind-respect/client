<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout row wrap class="mt-5 pt-5">
        <v-flex xs12 md4 lg2 v-for="center in centers">
            <v-hover>
                <v-card height="200" class="ma-2" slot-scope="{hover}" :class="`elevation-${hover ? 12 : 2}`"
                        :href="center.uri().url()">
                    <v-card-title class="subheading">
                        <v-icon>
                            {{getIcon(center)}}
                        </v-icon>
                        <v-spacer></v-spacer>
                        {{center.getLabel()}}
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-card-text class="text-xs-center">
                        <div v-for="(value, key) in center.getContext()">
                            {{value}}
                        </div>
                    </v-card-text>
                </v-card>
            </v-hover>
        </v-flex>
    </v-layout>
</template>

<script>
    import CenterGraphElementService from '@/center/CenterGraphElementService'
    import CenterGraphElement from '@/center/CenterGraphElement'
    import IdUri from '@/IdUri'
    import GraphElementType from '@/graph-element/GraphElementType'

    export default {
        name: "CentersList",
        data: function () {
            return {
                centers: null,
                IdUri: IdUri
            }
        },
        methods: {
            getIcon: function (center) {
                let uri = center.getUri();
                let graphElementType = IdUri.getGraphElementTypeFromUri(uri);
                switch (graphElementType) {
                    case GraphElementType.Relation :
                        return "arrow_right_alt";
                    case GraphElementType.Meta :
                        return "local_offer";
                    default :
                        return "panorama_fish_eye";
                }
            },
            link: function (center) {
                return IdUri.htmlUrlForBubbleUri(
                    center.getUri()
                )
            }
        },
        mounted: function () {
            CenterGraphElementService.getPublicAndPrivate().then(function (response) {
                this.centers = CenterGraphElement.fromServerFormat(response.data);
            }.bind(this))
        }
    }
</script>

<style scoped>

</style>
