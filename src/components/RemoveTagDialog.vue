<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
  <v-dialog v-model="removeTagDialog" v-if="isRemoveTagFlow" width="600" id="removeTagDialog">
    <v-card>
      <v-card-title class="text-h6">
        {{ $t('removeTag:title_prefix') }}
        <v-spacer></v-spacer>
        <v-icon
            color="third"
            @click="removeTagDialog = false"
        >close
        </v-icon>
      </v-card-title>
      <v-card-text class="pt-0">
        <v-list>
          <v-subheader v-if="isMultipleFlow && false">
            {{ $t('removeTag:multiple') }}
          </v-subheader>
          <v-list-item
              v-for="tagInfo in tagsInfo"
              :key="tagInfo.taggedBubble.uiId"
          >
            <v-list-item-content>
              <v-list-item-title>
                <v-icon class="mr-2">
                  label
                </v-icon>
                "{{ tagInfo.tagVertex.getOriginalMeta().getLabelOrDefault() }}"
                {{ $t('toTheBubble') }}
                "{{ tagInfo.taggedBubble.getLabelOrDefault() }}"
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <form>
          <input type="text" ref="enterRemoveInput" autofocus style="width:0">
          <v-btn color="secondary" class="ml-2" @click="remove">
            <v-icon class="mr-2">delete</v-icon>
            {{ $t('removeTag:confirm') }}
            <span v-if="isMultipleFlow" class="ml-2">
                            {{ $t('removeTag:multiple_confirm_suffix') }}
                        </span>
          </v-btn>
        </form>
        <v-spacer></v-spacer>
        <v-btn
            text
            class="mr-2"
            @click="removeTagDialog = false"
        >
          {{ $t('removeTag:cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Selection from '@/Selection'
import I18n from '@/I18n'
import KeyboardActions from '@/KeyboardActions'
import CurrentSubGraph from "../graph/CurrentSubGraph";

export default {
  name: "RemoveTagDialog",
  data: function () {
    I18n.i18next.addResources("en", "removeTag", {
      "title_prefix": "Pull off tag",
      "multiple": "All these bubbles",
      "desc1": "Do you really want to remove this?",
      "desc2": "The relations around an erased bubble are also removed.",
      "desc3": "If you choose to remove this and it seems like related bubbles have disapeared, try to look for them in the search bar.",
      "confirm": "Remove",
      "multiple_confirm_suffix": "for all",
      "cancel": "Cancel"
    });
    I18n.i18next.addResources("fr", "removeTag", {
      "title_prefix": "Enlever l'étiquette",
      "multiple": "Toutes ces bulles",
      "desc1": "Voulez-vous vraiment effacer ça?",
      "desc2": "Les relations autour des bulles seront également effacées.",
      "desc3": "Si des bulles semblent avoir disparues, retrouvez les dans la barre de recherche.",
      "confirm": "Enlever",
      "multiple_confirm_suffix": "pour tout",
      "cancel": "Annuler"
    });
    return {
      removeTagDialog: false,
      tagsInfo: []
    }
  },
  mounted: function () {
    this.$store.dispatch("setIsRemoveTagFlow", false)
  },
  computed: {
    isRemoveTagFlow: function () {
      return this.$store.state.isRemoveTagFlow;
    },
    isMultipleFlow: function () {
      return this.tagsInfo.length > 1;
    }
  },
  watch: {
    isRemoveTagFlow: function () {
      if (this.$store.state.isRemoveTagFlow === false) {
        this.removeTagDialog = false;
        return;
      }
      const bubbles = this.$store.state.isRemoveTagFlow === true ?
          Selection.getSelectedElements() :
          this.$store.state.isRemoveTagFlow.map((bubbleUri) => {
            return CurrentSubGraph.get().getHavingUri(bubbleUri);
          });
      this.tagsInfo = [];
      bubbles.forEach((bubble) => {
        this._addTagInfoFromBubble(bubble);
      });
      this.removeTagDialog = true;
      this.$nextTick(() => {
        const element = this.$refs.enterRemoveInput;
        this.$nextTick(() => {
          element.focus()
        });
      })
    },
    removeTagDialog: function () {
      if (this.removeTagDialog === false) {
        KeyboardActions.enable();
        this.$store.dispatch("setIsRemoveTagFlow", false)
      } else {
        KeyboardActions.disable();
      }
    }
  },
  methods: {
    remove: async function () {
      await Promise.all(
          this.tagsInfo.map((tagInfo) => {
            return tagInfo.original.controller().removeTagFromTaggedBubbleAndTagVertex(
                tagInfo
            );
          })
      );
      this.removeTagDialog = false;
    },
    _addTagInfoFromBubble: function (bubble) {
      if (bubble.isMetaGroupVertex()) {
        bubble.expand();
        return bubble.getNextChildren().forEach((child) => {
          this._addTagInfoFromBubble(child);
        });
      }
      let tagVertex, taggedBubble;
      if (bubble.isMeta()) {
        tagVertex = bubble;
        taggedBubble = bubble.getParentVertex();
      } else {
        tagVertex = bubble.getTagVertex();
        taggedBubble = bubble;
      }
      this.tagsInfo.push({
        taggedBubble: taggedBubble,
        tagVertex: tagVertex,
        original: bubble
      });
    }
  }
}
</script>

<style scoped>

</style>
