<template>
    <v-layout row v-if="loaded">
        <v-flex xs12>
            <v-card>
                <v-card-text class="pt-0">
                    <v-treeview
                            :items="items"
                            open-all
                    >
                        <template v-slot:label="{ item }">
                            <span class="font-italic">{{getEdgeLabel(item)}}</span>
                            <span v-html="linkify(item.original.getLabelOrDefault())"></span>
                        </template>
                    </v-treeview>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import GraphElementType from '@/graph-element/GraphElementType'
    import linkifyHtml from 'linkifyjs/html'

    export default {
        name: "GraphList",
        data: function () {
            return {
                loaded: false,
                items: null
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsSideMenuCollapsed", true);
            this.items = [
                this.forkAsItem(CurrentSubGraph.get().center)
            ];
            this.loaded = true;
        },
        computed: {
            isListViewFlow: function () {
                return this.$store.state.isListViewFlow;
            }
        },
        methods: {
            forkAsItem: function (fork) {
                return {
                    id: fork.getUri(),
                    original: fork,
                    children: fork.getClosestChildrenInTypes(GraphElementType.Fork).map((childFork) => {
                        return this.forkAsItem(childFork)
                    })
                }
            },
            getEdgeLabel: function (item) {
                let parentBubble = item.original.getParentBubble();
                if (parentBubble.isEdge() && parentBubble.isShrinked()) {
                    return "";
                }
                return parentBubble.isEdge() && !parentBubble.isLabelEmpty() ?
                    "(" + parentBubble.getLabel() + ") " : "";
            },
            linkify: function (label) {
                return linkifyHtml(label);
            }
        }
    }
</script>

<style scoped>

</style>