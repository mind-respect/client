<template>
  <div v-if="dialog">
    <v-dialog v-model="dialog" width="900" :fullscreen="$vuetify.breakpoint.smAndDown">
      <v-card>
        <v-card-title class="pb-0">
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-actions>
          <v-list
              flat
              dense
          >
            <v-list-item-group
                v-model="buttons"
                multiple
                active-class=""
            >
              <v-list-item @click="childFilterToggle">
                <template v-slot:default="{ active }">
                  <v-list-item-action>
                    <v-checkbox :input-value="active" v-model="applyChildFilter"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title class="text-subtitle-1 font-weight-regular">{{
                        $t('listViewDialog:filter')
                      }}
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>
            </v-list-item-group>
            <v-list-item @click="copy()">
              <v-list-item-icon>
                <v-icon>content_copy</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="text-uppercase">
                  {{ $t('copy') }}
                </v-list-item-title>
                <transition name="fade-transition">
                  <v-list-item-subtitle v-show="listCopied" class="third-color">
                    {{ $t('listViewDialog:listCopied') }}
                  </v-list-item-subtitle>
                </transition>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-actions>
        <v-card-text class="pt-0">
          <ListView ref="listView" :bubble="rootBubble" :childFilter="childFilter" :key="listViewKey"></ListView>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import GraphUi from '@/graph/GraphUi'
import KeyboardActions from '@/KeyboardActions'
import Selection from "@/Selection";
import I18n from '@/I18n'

export default {
  name: "ListViewDialog",
  components: {
    ListView: () => import('@/components/ListView'),
  },
  data: function () {
    I18n.i18next.addResources("en", "listViewDialog", {
      filter: "Only show selected children",
      listCopied: "List copied"
    });
    I18n.i18next.addResources("fr", "listViewDialog", {
      filter: "Ne montrer que les enfants sélectionnés",
      listCopied: "Liste copiée"
    });

    return {
      dialog: false,
      rootBubble: null,
      applyChildFilter: true,
      buttons: [],
      listCopied: false,
      listCopiedTimeout: null,
      listViewKey: Math.random()
    };
  },
  computed: {
    isListViewFlow: function () {
      return this.$store.state.isListViewFlow;
    }
  },
  mounted: function () {
    this.$store.dispatch("setIsListViewFlow", false);
  },
  watch: {
    isListViewFlow: function () {
      if (this.isListViewFlow) {
        this.applyChildFilter = true;
        this.rootBubble = Selection.getRootOfSelectedTree();
        this.dialog = true;
      }
    },
    dialog: function () {
      if (this.dialog === false) {
        this.$store.dispatch("setIsListViewFlow", false);
        GraphUi.enableDragScroll();
        KeyboardActions.enable();
      } else {
        GraphUi.disableDragScroll();
        KeyboardActions.disable();
      }

    }
  },
  methods: {
    copy: function () {
      this.$refs.listView.copy();
      this.listCopied = true;
      if (this.listCopiedTimeout !== null) {
        clearTimeout(this.listCopiedTimeout);
      }
      this.listCopiedTimeout = setTimeout(() => {
        this.listCopied = false;
        this.listCopiedTimeout = null;
      }, 5000);
    },
    childFilter: function (child, isFromExpand) {
      return !this.applyChildFilter || isFromExpand || child.isSelected;
    },
    childFilterToggle: function () {
      this.applyChildFilter = !this.applyChildFilter;
      this.listViewKey = Math.random();
    }
  }
}
</script>

<style scoped>

</style>