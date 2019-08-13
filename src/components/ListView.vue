<template>
    <div v-if="dialog">
        <v-dialog v-model="dialog" width="900">
            <v-card>
                <v-card-title class="pb-0">
                    <v-btn text small color="secondary"
                           @click="copy()">
                        <v-icon class="mr-2">content_copy</v-icon>
                        {{$t('copy')}}
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="dialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="pt-0">
                    <v-treeview
                            :items="items"
                            open-all
                            ref="copyTree"
                    >
                        <template v-slot:label="{ item }">
                            <span class="font-italic">{{getEdgeLabel(item.original)}}</span>
                            <span v-html="linkify(item.original.getLabelOrDefault())"></span>
                        </template>
                    </v-treeview>
                </v-card-text>
            </v-card>
        </v-dialog>
        <div ref="copyList" v-html="htmlList()" style="position:absolute;top:-10000px; left:-10000px;"></div>
    </div>
</template>

<script>
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import GraphUi from '@/graph/GraphUi'
    import GraphElementType from '@/graph-element/GraphElementType'
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
                        this.forkAsItem(CurrentSubGraph.get().center)
                    ];
                    this.dialog = true;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsListViewFlow", false);
                    GraphUi.enableDragScroll();
                } else {
                    GraphUi.disableDragScroll();
                }
            }
        },
        methods: {
            copy: function () {
                this.selectText(this.$refs.copyList);
                document.execCommand("copy");
            },
            htmlList: function (parent) {
                let isRoot = false;
                if (!parent) {
                    isRoot = true;
                    parent = this.items[0];
                }
                let content = this.getEdgeLabel(parent.original) + " " + this.linkify(parent.original.getLabelOrDefault())
                content += "<ul>";
                parent.children.forEach((child) => {
                    content += "<li>";
                    content += this.htmlList(child);
                    content += "</li>";
                });
                content += "</ul>";
                return content;
            },
            forkAsItem: function (fork) {
                return {
                    id: fork.getId(),
                    original: fork,
                    children: fork.getClosestChildrenInTypes(GraphElementType.Fork).map((childFork) => {
                        return this.forkAsItem(childFork)
                    })
                }
            },
            getEdgeLabel: function (item) {
                let parentBubble = item.getParentBubble();
                if (parentBubble.isEdge() && parentBubble.isShrinked()) {
                    return "";
                }
                return parentBubble.isEdge() && !parentBubble.isLabelEmpty() ?
                    "(" + parentBubble.getLabel() + ") " : "";
            },
            linkify: function (label) {
                return linkifyHtml(label);
            },
            selectText: function (element) {
                let range;
                if (document.selection) {
                    // IE
                    range = document.body.createTextRange();
                    range.moveToElementText(element);
                    range.select();
                } else if (window.getSelection) {
                    range = document.createRange();
                    range.selectNode(element);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                }
            },
        }
    }
</script>

<style scoped>

</style>