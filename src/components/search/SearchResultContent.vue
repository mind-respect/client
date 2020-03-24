<template>
    <v-list-item-content class="search-result-content">
        <v-list-item-title>
            <v-badge
                    :value="!item.isMindRespect || (!item.original.getGraphElement().isMeta() && (item.original.getGraphElement().shouldShowChipIcon() || item.original.getGraphElement().isChipBackgroundColorDefined(true)))"
                    :color="(item.isMindRespect ? item.original.getGraphElement().getChipBackgroundColor(true) : 'transparent')"
                    :inline="item.isMindRespect && !item.original.getGraphElement().isMeta()"
                    :left="item.isMindRespect"
            >
                <template v-slot:badge>
                    <v-icon v-if="item.source ==='wikidata'" color="secondary">
                        label
                    </v-icon>
                    <v-icon v-if="item.isMindRespect && item.original.getGraphElement().shouldShowChipIcon()"
                            :color="getIconContrastColorFromBackground(item.original.getGraphElement().getChipBackgroundColor(true))"
                    >
                        {{item.original.getGraphElement().getChipIcon()}}
                    </v-icon>
                </template>
                <v-icon v-if="item.isMindRespect && (item.original.getGraphElement().isVertex() || item.original.getGraphElement().isMeta()) "
                        class="mr-1 grey--text" small>
                    {{item.original.getGraphElement().getShareIcon()}}
                </v-icon>
                <v-badge v-if="item.isMindRespect && item.original.getGraphElement().isMeta()"
                         :color="item.original.getGraphElement().getChipBackgroundColor()"
                         overlap bottom class="caption mr-2"
                >
                    <template v-slot:badge>
                                                        <span class="font-weight-bold" :class="{
                                                            'black--text':!shouldTextBeWhiteFromBackgroundColor(item.original.getGraphElement().getChipBackgroundColor())
                                                        }">
                                                           {{item.original.getNbNeighbors().getTotal()}}
                                                        </span>
                    </template>
                    <v-avatar :color="item.original.getGraphElement().getChipBackgroundColor()" size="28">
                        <v-icon :dark="shouldTextBeWhiteFromBackgroundColor(item.original.getGraphElement().getChipBackgroundColor())"
                                small>
                            label
                        </v-icon>
                    </v-avatar>
                </v-badge>
                {{item.label}}
            </v-badge>
        </v-list-item-title>
        <v-list-item-subtitle>
            <span v-if="item.source ==='wikidata'">
                {{item.description}}
            </span>
            <span v-else>
            <span v-if="item.original.getGraphElementType() === 'vertex'" class="around-list">
                <span v-for="context in Object.values(item.original.context)" class="around-list-item">
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
    import Color from "../../Color";

    export default {
        name: "SearchResult",
        props: ['item'],
        methods: {
            shouldTextBeWhiteFromBackgroundColor: function (hexColor) {
                return Color.getContrast(hexColor) === 'white'
            },
            getIconContrastColorFromBackground: function (hexColor) {
                return Color.getContrast(hexColor);
            }
        }
    }
</script>

<style scoped>
    .search-result-content .v-list-item__title {
        padding-bottom: 10px;
    }
</style>