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
        <p class="d-inline-flex vh-center">
          <span class="font-italic">{{ item.edgeLabel }}</span>
          <span v-if="item.isGroupRelation" class="font-italic">(</span>
          <span v-html="linkify(item.label)" :class="{
                    'font-italic': item.isGroupRelation
                }"></span>
          <span v-if="item.isGroupRelation" class="font-italic">)</span>
          <Tags :tags="item.tags" class="ml-4" v-if="showTags" :preventLink="true"></Tags>
        </p>
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
  props: ['collapse', 'bubble', 'preventExpand', 'showTags', 'childFilter'],
  components: {
    Tags: () => import('@/components/Tags')
  },
  data: function () {
    return {
      items: null,
      onlyShowSelectedChildren: true,
      collapsedDescendants: {}
    }
  },
  mounted: function () {
    this.rebuild();
  },
  methods: {
    rebuild: function () {
      this.collapsedDescendants = {};
      this.items = [
        this.forkAsItem(
            this.bubble ? this.bubble : CurrentSubGraph.get().center,
            false
        )
      ];
    },
    expand: function (item) {
      let graphElement = CurrentSubGraph.get().getHavingUri(item.uri);
      if (!graphElement) {
        graphElement = this.collapsedDescendants[item.id];
      }
      return graphElement.controller().expand(true, true, true).then(() => {
        item.children = this.buildItemChildren(graphElement, true);
        graphElement.getDescendantsEvenIfCollapsed().forEach((descendant) => {
          this.collapsedDescendants[descendant.getId()] = descendant;
        });
        graphElement.collapse();
      });
    },
    forkAsItem: function (fork, isFromExpand) {
      const item = {
        id: fork.getId(),
        uri: fork.getUri(),
        edgeLabel: this.getEdgeLabel(fork),
        label: fork.getLabelOrDefault(),
        isGroupRelation: fork.isGroupRelation(),
        tags: fork.getIdentifiers()
      };
      if (!this.preventExpand && fork.canExpand()) {
        item.children = [];
      }
      if (!fork.isLeaf()) {
        item.children = this.buildItemChildren(fork, isFromExpand);
      }
      return item;
    },
    buildItemChildren: function (fork, isFromExpand) {
      return fork.getClosestChildrenInTypes(GraphElementType.Fork).filter((childFork) => {
        return !this.childFilter || this.childFilter(childFork, isFromExpand);
      }).map((childFork) => {
        return this.forkAsItem(childFork, isFromExpand)
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
      let edgeLabel = "<span class='font-italic'>" + parent.edgeLabel + "</span>";
      let parentLabel = this.linkify(parent.label);
      if (parent.isGroupRelation) {
        parentLabel = "<span class='font-italic'>(" + parentLabel + ")</span>"
      }
      let content = edgeLabel + " " + parentLabel;
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