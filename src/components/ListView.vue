<template>
    <div v-if="items">
        <v-treeview
                :items="items"
                :open-all="!collapse"
                ref="copyTree"
                transition
                :load-children="expand"
                hoverable
                open-on-click
                rounded
        >
            <template v-slot:label="{ item }">
                <span class="font-italic">{{item.edgeLabel}}</span>
                <span v-html="linkify(item.label)"></span>
            </template>
        </v-treeview>
        <div ref="copyList" v-html="htmlList()" style="position:absolute;top:-10000px; left:-10000px;"></div>
    </div>
</template>

<script>
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import GraphElementType from '@/graph-element/GraphElementType'
    import linkifyHtml from 'linkifyjs/html'

    export default {
        name: "ListView",
        props: ['collapse', 'bubble', 'preventExpand'],
        data: function () {
            return {
                items: null
            }
        },
        mounted: function () {
            this.rebuild();
        },
        methods: {
            rebuild: function () {
                this.items = [
                    this.forkAsItem(
                        this.bubble ? this.bubble : CurrentSubGraph.get().center
                    )
                ];
            },
            expand: function (item) {
                const graphElement = CurrentSubGraph.get().getHavingUri(item.uri);
                return graphElement.controller().expand(true, true, true).then(() => {
                    item.children = this.buildItemChildren(graphElement);
                    graphElement.collapse();
                });
            },
            forkAsItem: function (fork) {
                const item = {
                    id: fork.getId(),
                    uri: fork.getUri(),
                    edgeLabel: this.getEdgeLabel(fork),
                    label: fork.getLabelOrDefault()
                };
                if (!this.preventExpand && fork.canExpand()) {
                    item.children = [];
                }
                if (!fork.isLeaf()) {
                    item.children = this.buildItemChildren(fork);
                }
                return item;
            },
            buildItemChildren: function (fork) {
                return fork.getClosestChildrenInTypes(GraphElementType.Fork).map((childFork) => {
                    return this.forkAsItem(childFork)
                });
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
                let content = parent.edgeLabel + " " + this.linkify(parent.label);
                content += "<ul>";
                if (parent.children) {
                    parent.children.forEach((child) => {
                        content += "<li>";
                        content += this.htmlList(child);
                        content += "</li>";
                    });
                }
                content += "</ul>";
                return content;
            }
        }
    }
</script>

<style scoped>

</style>