<template>
  <v-dialog v-model="dialog" v-if="dialog" width="900" top :fullscreen="$vuetify.breakpoint.smAndDown">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">
          label
        </v-icon>
        {{ $t('addTag:tag') }}
        <v-spacer></v-spacer>
        <v-icon
            color="third"
            @click="dialog = false"
        >
          close
        </v-icon>
      </v-card-title>
      <v-card-text v-if="!isChangeShareLevelFlow">
        <v-list>
          <v-subheader class="pl-0">
            {{ $t('selectedBubble') }}
          </v-subheader>
          <v-list-item class="pl-0">
            <SearchResultContent :item="selectedBubbleAsSearchResult" class="pt-0 mt-0"></SearchResultContent>
          </v-list-item>
        </v-list>
        <div class="text-center">
          <v-btn text class="pl-0" v-show="canSwap" @click="swap">
            <v-icon class="mr-2">
              swap_vert
            </v-icon>
            {{ $t('addTag:swap') }}
          </v-btn>
        </div>
        <v-list>
          <v-subheader class="pl-0">
            {{ $t('addTag:tagNoun') }}
          </v-subheader>
          <v-list-item class="pl-0 pr-0 pt-0 mt-0" v-if="hasSelectedTag && selectedSearchResult">
            <SearchResultContent :item="selectedSearchResult"
                                 class="pl-0 pr-0 pt-0 mt-0"></SearchResultContent>
            <v-card-actions v-if="hasSelectedTag">
              <v-btn icon @click="selectedSearchResult = null;hasSelectedTag = false;">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-actions>
          </v-list-item>
          <v-list-item class="pl-0 pr-0 pt-0 mt-0" v-if="!bubble || (!bubble.isMeta()) && !hasSelectedTag">
            <v-list-item-content>
              <v-autocomplete
                  class="pl-0 pr-0 pt-0 mt-0"
                  ref="tagSearch"
                  v-model="selectedSearchResult"
                  :items="items"
                  :search-input.sync="search"
                  item-value="uri"
                  item-text="label"
                  return-object
                  :menu-props="menuProps"
                  :loading="searchLoading"
                  @change="selectSearchResult()"
                  cache-items
                  clearable
                  :no-data-text="$t('noSearchResults')"
                  :hide-no-data='!search || search.trim() === ""'
                  @focus="focus"
                  :placeholder="$t('addTag:placeholder')"
                  :disabled="!bubble"
              >
                <template v-slot:prepend-inner>
                  <img :src="require('@/assets/wikipedia.svg')" width="25">
                </template>
                <template v-slot:item="{ item }" :attr="searchResultAttrs(item.uri)">
                  <SearchResultContent :item="item"></SearchResultContent>
                  <SearchResultAction :item="item"></SearchResultAction>
                </template>
                <SearchCreate slot="append-item" @create="createTagWithNoRef"
                              ref="searchCreate"></SearchCreate>
                <SearchLoadMore slot="append-item" @loadMore="loadMore"
                                ref="loadMore" v-show="!searchLoading"></SearchLoadMore>
                <v-list-item slot="no-data" @click="createTagWithNoRef"
                             v-if="search && search.trim() !== ''"
                             v-show="!searchLoading">
                  <v-list-item-content>
                    <v-list-item-title>
                      "{{ search }}"
                    </v-list-item-title>
                    <v-list-item-subtitle class="">
                      {{ $t('create') }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon>
                      add
                    </v-icon>
                  </v-list-item-action>
                </v-list-item>
              </v-autocomplete>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-text v-if="isChangeShareLevelFlow">
        <v-alert type="success">
          {{ $t('addTag:tagAdded') }}
        </v-alert>
        <v-card>
          <v-card-title class="text-subtitle-1 pb-0">
            {{ $t('addTag:changeTagShareLevel1') }}
          </v-card-title>
          <v-card-text class="pt-0">
            <SearchResultContent :item="selectedSearchResult"></SearchResultContent>
          </v-card-text>
        </v-card>
        <v-card class="mt-4">
          <v-card-title class="text-subtitle-1 pb-0">
            {{ $t('addTag:changeTagShareLevel') }}
          </v-card-title>
          <v-card-text>
            <ShareLevelSelection class="mt-4" :shareLevel="selectedTagShareLevel"
                                 @update="updateShareLevel"></ShareLevelSelection>
          </v-card-text>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" @click="confirm()" :loading="tagLoading"
               :disabled="selectedSearchResult === null"
               v-if="!isChangeShareLevelFlow"
        >
          <v-icon class="mr-2">
            label
          </v-icon>
          {{ $t('addTag:tag') }}
        </v-btn>
        <v-btn color="secondary"
               @click="confirmChangeTagShareLevel()"
               :loading="confirmChangeTagShareLevelLoading"
               :disabled="confirmChangeTagShareLevelLoading"
               v-if="isChangeShareLevelFlow"
        >
          {{ $t('confirm') }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="dialog=false">
          {{ $t('cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import I18n from '@/I18n'
import Tag from "@/tag/Tag";
import Selection from '@/Selection'
import SearchService from '@/search/SearchService'
import SearchCreate from '@/components/search/SearchCreate'
import SearchLoadMore from '@/components/search/SearchLoadMore'
import SearchResultContent from '@/components/search/SearchResultContent'
import SearchResultAction from '@/components/search/SearchResultAction'
import KeyboardActions from '@/KeyboardActions'
import ShareLevelSelection from '@/components/ShareLevelSelection'
import GraphElementType from '@/graph-element/GraphElementType'

export default {
  name: "AddTagDialog",
  components: {
    SearchCreate,
    SearchLoadMore,
    SearchResultContent,
    SearchResultAction,
    ShareLevelSelection
  },
  mounted: function () {
    this.$store.dispatch("setIsAddTagFlow", false);
  },
  data: function () {
    I18n.i18next.addResources("en", "addTag", {
      tagNoun: "Tag",
      placeholder: "Search a tag",
      shareLevel: "Share level",
      tagAdded: "Tag added",
      changeTagShareLevel: "Change the tag sharing level?",
      changeTagShareLevel1: "The added tag has a stricter sharing level than the selected bubble",
      tag: "Tag",
      swap: "Swap"
    });
    I18n.i18next.addResources("fr", "addTag", {
      tagNoun: "Étiquette",
      placeholder: "Chercher un étiquette",
      shareLevel: "Niveau de partage",
      tagAdded: "Étiquette ajouté",
      changeTagShareLevel: "Modifier le niveau de partage de l'étiquette ?",
      changeTagShareLevel1: "L'étiquette ajouté a un niveau de partage plus strict que la bulle sélectionné",
      tag: "Étiquetter",
      swap: "Échanger"
    });
    return {
      search: null,
      dialog: false,
      selectedSearchResult: null,
      items: [],
      searchLoading: false,
      menuProps: {
        "contentClass": 'search-menu add-tag-dialog-menu'
      },
      tagLoading: false,
      isChangeShareLevelFlow: false,
      addedTag: null,
      selectedTagShareLevel: null,
      confirmChangeTagShareLevelLoading: false,
      searchTimeout: null,
      selectedBubbleAsSearchResult: null,
      selectedPanel: [],
      hasSelectedTag: false
    }
  },
  computed: {
    isAddTagFlow: function () {
      return this.$store.state.isAddTagFlow;
    },
    canSwap: function () {
      return this.selectedSearchResult && this.selectedSearchResult.isMindRespect &&
          this.selectedSearchResult.original.getGraphElementType() !== GraphElementType.Meta;
    }
  },
  watch: {
    isAddTagFlow: function () {
      this.hasSelectedTag = false;
      if (this.$store.state.isAddTagFlow) {
        this.isChangeShareLevelFlow = false;
        this.confirmChangeTagShareLevelLoading = false;
        this.selectedSearchResult = null;
        this.bubble = Selection.getSingle();
        this.selectedBubbleAsSearchResult = SearchService.searchResultFromOnMapGraphElement(
            Selection.getSingle()
        );
        this.dialog = true;
        let selection = Selection.getSelectedBubbles();
        if (selection.length === 2) {
          this.selectedSearchResult = SearchService.searchResultFromOnMapGraphElement(
              selection[1]
          );
          this.hasSelectedTag = true;
        } else {
          this.$nextTick(() => {
            setTimeout(() => {
              this.$refs.tagSearch.reset();
              this.$refs.tagSearch.$el.querySelector("input").focus();
            }, 100)
          });
        }
      } else {
        this.hasSelectedTag = false;
        this.dialog = false;
      }
    },
    dialog: function () {
      if (this.dialog) {
        KeyboardActions.disable();
      } else {
        KeyboardActions.enable();
        this.$store.dispatch("setIsAddTagFlow", false)
      }
    },
    search: function (val) {
      this.setMenuPosition();
      val && val !== this.select && this.querySelectionsDebounced(val);
    }
  },
  methods: {
    updateShareLevel: function (newShareLevel) {
      this.selectedTagShareLevel = newShareLevel;
    },
    confirmChangeTagShareLevel: function () {
      this.confirmChangeTagShareLevelLoading = true;
      this.addedTag.controller().setShareLevelDo(
          this.selectedTagShareLevel
      ).then(() => {
        this.confirmChangeTagShareLevelLoading = false;
        this.dialog = false;
      });
    },
    focus: function () {
      this.$nextTick(async () => {
        await this.$nextTick();
        await this.$nextTick();
        await this.$nextTick();
        setTimeout(() => {
          this.setMenuPosition();
        }, 100)
      });
    },
    selectSearchResult: async function () {
      this.$refs.tagSearch.blur();
      this.hasSelectedTag = true;
    },
    confirm: async function () {
      this.tagLoading = true;
      let tag = Tag.fromSearchResult(
          this.selectedSearchResult
      );
      if (this.bubble.hasIdentification(tag)) {
        return false;
      }
      tag.makeGeneric();
      const imageUrl = await this.selectedSearchResult.getImageUrl(this.selectedSearchResult);
      if (imageUrl) {
        tag.addImage(imageUrl);
      }
      const tags = await this.identify(tag);
      this.tagLoading = false;
      this.$store.dispatch("redraw");
      this.addedTag = tags[0];
      this.isChangeShareLevelFlow = this.bubble.isVertexType() && this.bubble.hasLooserShareLevelThan(this.addedTag);
      this.selectedTagShareLevel = this.bubble.getShareLevel();
      if (!this.isChangeShareLevelFlow) {
        this.dialog = false;
      }
      this.$emit("tagAdded");
      return tag;
    },
    createTagWithNoRef: function () {
      this.tagLoading = true;
      let tag = Tag.withUriLabelAndDescription(
          Tag.generateVoidUri(),
          this.search,
          ""
      );
      this.identify(tag).then((tags) => {
        this.tagLoading = false;
        this.dialog = false;
      });
      this.$refs.tagSearch.reset();
      this.$refs.tagSearch.blur();
    },
    querySelectionsDebounced: function (searchText) {
      this.searchLoading = true;
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(async () => {
        await this.querySelections(searchText)
        this.searchLoading = false;
      }, 500);
    },
    querySelections: async function (term) {
      const results = await SearchService.tags(term);
      let nbResults = 0;
      this.items = results.map((result) => {
        result.disabled = this.bubble.hasTagRelatedToUri(result.uri);
        if (!result.disabled && result.original.graphElement && result.original.graphElement.hasTagRelatedToUri) {
          result.disabled = result.original.graphElement.hasTagRelatedToUri(
              this.bubble.getUri()
          );
        }
        if (!result.disabled) {
          nbResults++
        }
        return result;
      });
      if (this.$refs.loadMore) {
        this.$refs.loadMore.reset(nbResults, this.search);
      }
      if (this.$refs.searchCreate) {
        this.$refs.searchCreate.reset(nbResults, this.search);
      }
    },
    loadMore: function (callback) {
      SearchService.tags(this.search, this.items.filter((item) => {
        return item.source === "mindrespect.com";
      }).length).then((results) => {
        this.items = this.items.concat(results);
        callback(results.length, this.$refs.tagSearch);
      });
    },
    setMenuPosition: function () {
      const menu = document.getElementsByClassName('add-tag-dialog-menu')[0];
      if (!menu) {
        return;
      }
      const autocompleteRect = this.$refs.tagSearch.$el.getBoundingClientRect();
      menu.style.left = autocompleteRect.x + "px";
      menu.style.top = (autocompleteRect.y + autocompleteRect.height) + "px";
    },
    identify: function (identifier) {
      return this.selectedBubbleAsSearchResult.original.getGraphElement().controller().addIdentification(
          identifier
      );
    },
    swap: function () {
      this.bubble = this.selectedSearchResult.original.getGraphElement();
      const swapTmp = this.selectedBubbleAsSearchResult;
      this.selectedBubbleAsSearchResult = this.selectedSearchResult;
      this.selectedSearchResult = swapTmp;
    }
  }
}
</script>

<style scoped>

</style>