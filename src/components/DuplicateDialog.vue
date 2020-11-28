<template>
  <v-dialog v-model="dialog" v-if="dialog" width="900" top :fullscreen="$vuetify.breakpoint.smAndDown">
    <v-card>
      <v-card-title class="">
        <!--        {{ $t('duplicate:title') }}-->
        <v-spacer></v-spacer>
        <v-icon @click="dialog = false">close</v-icon>
      </v-card-title>
      <v-card-text>
        <v-list>
          <div v-for="(duplicate, index) in duplicates">
            <v-subheader v-if="index === 0">
              {{ $t('duplicate:selectedBubble') }}
            </v-subheader>
            <v-subheader v-if="index === 1">
              {{ $t('duplicate:duplicates') }}
            </v-subheader>
            <v-list-item :disabled="index === 0" @click="goToBubble(duplicate)">
              <SearchResultContent class="pt-0 mt-0" :item="duplicate"></SearchResultContent>
            </v-list-item>
          </div>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">{{$t('close')}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import I18n from "@/I18n";
import Selection from '@/Selection'
import SearchService from "@/search/SearchService";
import SearchResultContent from '@/components/search/SearchResultContent'
import CurrentSubGraph from "@/graph/CurrentSubGraph";

export default {
  name: "DuplicateDialog",
  components: {
    SearchResultContent
  },
  data: function () {
    I18n.i18next.addResources("en", "duplicate", {
      selectedBubble: "Selected bubble",
      duplicates: "Duplicates"
    });
    I18n.i18next.addResources("fr", "duplicate", {
      selectedBubble: "Bulle sélectionnée",
      duplicates: "Duplicats"
    });
    return {
      dialog: false,
      duplicates: null
    }
  },
  mounted: function () {
    this.$store.dispatch("setIsDuplicateFlow", false);
  },
  computed: {
    isDuplicateFlow: function () {
      return this.$store.state.isDuplicateFlow;
    }
  },
  watch: {
    isDuplicateFlow: function () {
      if (this.$store.state.isDuplicateFlow) {
        const selectedBubble = Selection.getSingle();
        this.duplicates = [selectedBubble].concat(selectedBubble.getDuplicates()).map((duplicate) => {
          const duplicateAsSearchResult = SearchService.searchResultFromOnMapGraphElement(
              duplicate
          );
          duplicateAsSearchResult.uiId = duplicate.getId();
          return duplicateAsSearchResult;
        });
        this.dialog = true;
      } else {
        this.dialog = false;
      }
    },
    dialog: function () {
      if (!this.dialog) {
        this.$store.dispatch("setIsDuplicateFlow", false);
      }
    }
  },
  methods: {
    goToBubble: function (bubbleAsSearchResult) {
      let bubble = CurrentSubGraph.get().getHavingUriAndId(
          bubbleAsSearchResult.uri,
          bubbleAsSearchResult.uiId,
          bubbleAsSearchResult.original.graphElementType
      );
      Selection.setToSingle(bubble, true);
      this.dialog = false;
    }
  }
}
</script>

<style scoped>

</style>