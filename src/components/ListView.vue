<template>
    <v-dialog v-model="dialog" v-if="dialog" width="900">
        <v-card>
            <v-card-title class="pb-0">
                <v-spacer></v-spacer>
                <v-btn icon @click="dialog = false">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>
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
    </v-dialog>
</template>

<script>
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import GraphUi from '@/graph/GraphUi'
    import linkifyHtml from 'linkifyjs/html'

    export default {
        name: "ListView",
        data: function () {
            return {
                dialog: false,
                items: null
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsListViewFlow", false)
        },
        computed: {
            isListViewFlow: function () {
                return this.$store.state.isListViewFlow;
            }
        },
        watch: {
            isListViewFlow: function () {
                if (this.isListViewFlow) {
                    this.items = [
                        this.vertexAsItem(CurrentSubGraph.get().center)
                    ];
                    this.dialog = true;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsListViewFlow", false)
                    GraphUi.enableDragScroll();
                } else {
                    GraphUi.disableDragScroll();
                }
            }
        },
        methods: {
            vertexAsItem: function (vertex) {
                return {
                    id: vertex.getUri(),
                    original: vertex,
                    children: vertex.getClosestChildVertices().map((childVertex) => {
                        return this.vertexAsItem(childVertex)
                    })
                }
            },
            getEdgeLabel: function (item) {
                let parentBubble = item.original.getParentBubble();
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