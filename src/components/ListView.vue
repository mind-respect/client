<template>
    <v-dialog v-model="dialog" v-if="dialog" width="900">
        <v-card>
            <v-card-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="dialog = false">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <v-treeview
                        :items="items"
                        open-all
                >
                </v-treeview>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import SubGraph from '@/graph/SubGraph'
    import GraphUi from '@/graph/GraphUi'

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
                        this.vertexAsItem(SubGraph.graph.center)
                    ];
                    this.dialog = true;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsListViewFlow", false)
                    GraphUi.enableDragScroll();
                }else{
                    GraphUi.disableDragScroll();
                }
            }
        },
        methods: {
            vertexAsItem: function (vertex) {
                return {
                    id: vertex.getUri(),
                    name: vertex.getLabelOrDefault(),
                    children: vertex.getClosestChildVertices().map((childVertex) => {
                        return this.vertexAsItem(childVertex)
                    })
                }
            }
        }
    }
</script>

<style scoped>

</style>