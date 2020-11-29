<template>
  <v-dialog v-model="dialog" v-if="dialog" width="900" id="removeDialog" :fullscreen="$vuetify.breakpoint.smAndDown">
    <v-card>
      <v-card-title class="text-h6">
        {{ $t('copyTree:title') }}
        <v-spacer></v-spacer>
        <v-icon
            color="third"
            @click="dialog = false"
        >close
        </v-icon>
      </v-card-title>
      <v-card-text class="pt-0 text-body-1" v-if="relateSuccess">
        <v-alert
            dense
            text
            type="success"
        >
          {{ $t('copyTree:relateSuccess') }}
        </v-alert>
      </v-card-text>
      <v-card-text class="pt-0 text-body-1" v-if="newCenterSuccess">

      </v-card-text>
      <v-card-text class="pt-0 text-body-1" v-if="!relateSuccess && !newCenterSuccess">
        <v-list>
          <v-list-item-group
              v-model="action"
              active-class=""
          >
            <v-list-item @click="focusSearch">
              <template v-slot:default="{ active }">
                <v-list-item-action>
                  <v-checkbox :input-value="active"></v-checkbox>
                </v-list-item-action>
                <v-icon class="mr-4">arrow_right_alt</v-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('copyTree:relateToYourBubble') }}
                  </v-list-item-title>
                </v-list-item-content>
              </template>
            </v-list-item>
            <v-list-item-group sub-group :value="true" v-show="action === 0" v-ripple>
              <v-subheader v-if="copyRelateBubble" class="pb-0">
                {{ $t('copyTree:parentBubbleToNewTree') }} :
              </v-subheader>
              <v-list-item @click.prevent="" class="pt-0">
                <SearchResultContent :item="copyRelateBubbleAsSearchResult"
                                     class="pt-0"
                                     v-if="copyRelateBubble"></SearchResultContent>
                <v-list-item-content v-show="!copyRelateBubble">
                  <v-autocomplete
                      ref="copyRelateSearch"
                      v-model="copyRelateBubbleAsSearchResult"
                      :items="searchItems"
                      :search-input.sync="search"
                      item-value="uri"
                      item-text="label"
                      return-object
                      :menu-props="menuProps"
                      :loading="searchLoading"
                      @change="selectSearchResult()"
                      cache-items
                      :no-data-text="$t('noSearchResults')"
                      clearable
                      :label="$t('copyTree:parentBubbleToNewTree')"
                      @focus="focus"
                      @blur="$emit('blur')"
                  >
                    <template v-slot:item="{ item }">
                      <SearchResultContent :item="item"></SearchResultContent>
                      <SearchResultAction :item="item"></SearchResultAction>
                    </template>
                    <SearchLoadMore slot="append-item" @loadMore="loadMore"
                                    ref="copyTreeLoadMore"></SearchLoadMore>
                  </v-autocomplete>
                </v-list-item-content>
                <v-card-actions v-if="copyRelateBubble !== null">
                  <v-btn icon @click="cancelRelateBubble">
                    <v-icon>close</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-list-item>
            </v-list-item-group>
            <v-list-item>
              <template v-slot:default="{ active }">
                <v-list-item-action>
                  <v-checkbox :input-value="active"></v-checkbox>
                </v-list-item-action>
                <v-icon class="mr-4">filter_center_focus</v-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('copyTree:newCenter') }}
                  </v-list-item-title>
                </v-list-item-content>
              </template>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" class="ml-4" @click="confirm"
               :loading="isLoading"
               :disabled="isLoading || action === null || (action === 0 && this.copyRelateBubble === null)"
               v-if="!this.relateSuccess && !this.newCenterSuccess"
        >
          {{ $t('confirm') }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="dialog = false" text class="mr-4" v-if="relateSuccess || newCenterSuccess">
          {{ $t('done') }}
        </v-btn>
        <v-btn color="primary" @click="dialog = false" text class="mr-4" v-else>
          {{ $t('cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import I18n from '@/I18n'
import KeyboardActions from '@/KeyboardActions'
import SearchLoadMore from '@/components/search/SearchLoadMore'
import SearchResultContent from '@/components/search/SearchResultContent'
import SearchResultAction from '@/components/search/SearchResultAction'
import SearchService from "@/search/SearchService";
import IdUri from "@/IdUri";

export default {
  name: "CopyTreeOfOtherDialog",
  components: {
    SearchLoadMore,
    SearchResultContent,
    SearchResultAction
  },
  data: function () {
    I18n.i18next.addResources("en", "copyTree", {
      title: "Copy tree in your map",
      newCenter: "Add as new center",
      relateToYourBubble: "Relate to one of your bubble",
      placeholder: "Relate with",
      relateSuccess: "Votre bulle a été reliée",
      parentBubbleToNewTree: "Parent bubble to new copied tree"
    });
    I18n.i18next.addResources("fr", "copyTree", {
      title: "Copier l'arbre dans votre carte",
      newCenter: "Ajouter comme nouveau centre",
      relateToYourBubble: "Relier à l'une de vos bulle",
      placeholder: "Relier avec",
      relateSuccess: "Votre bulle a été reliée",
      parentBubbleToNewTree: "Bulle parente à l'arbre copié"
    });
    return {
      dialog: false,
      isLoading: false,
      action: null,
      search: null,
      searchLoading: false,
      searchItems: [],
      menuProps: {
        "contentClass": 'search-menu copy-tree-search-dialog-menu'
      },
      copyRelateBubble: null,
      copyRelateBubbleAsSearchResult: null,
      relateSuccess: true,
      newCenterSuccess: true
    };
  },
  mounted: function () {
    this.$store.dispatch("isCopyTreeFlow", false);
  },
  methods: {
    confirm: async function () {
      this.isLoading = true;
      if (this.action === 0) {
        await this.copyRelateBubble.controller().copyAndRelateTreeOfOtherUser(
            IdUri.currentUsernameInUrl()
        );
        this.relateSuccess = true;
      } else {
        await this.copyRelateBubble.controller().copyTreeOfOtherUserAsNewCenter(
            IdUri.currentUsernameInUrl()
        );
      }
      this.isLoading = false;
    },
    selectSearchResult: async function () {
      if (!this.copyRelateBubbleAsSearchResult) {
        this.copyRelateBubble = null;
        return;
      }
      this.copyRelateBubble = this.copyRelateBubbleAsSearchResult.original.getGraphElement();
      await this.$nextTick();
      this.action = 0;
      // this.mergeBubbleAsSearchResult = SearchService.searchResultFromOnMapGraphElement(
      //     this.mergeBubble
      // );
    },
    focusSearch: async function () {
      await this.$nextTick();
      if (this.action !== 0) {
        return;
      }
      this.copyRelateBubble = null;
      this.copyRelateBubbleAsSearchResult = null;
      await this.$nextTick();
      this.$refs.copyRelateSearch.reset();
      await this.$nextTick();
      this.$refs.copyRelateSearch.focus();
    },
    cancelRelateBubble: async function () {
      this.copyRelateBubble = null;
      this.search = "";
      this.$refs.copyRelateSearch.reset();
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
    async querySelections(term) {
      const results = await SearchService.ownVertices(term);
      this.searchItems = results.map((result) => {
        result.disabled = result.original.getGraphElement().isPattern() || !result.original.getGraphElement().isOwner();
        return result;
      });
      if (this.$refs.copyTreeLoadMore) {
        this.$refs.copyTreeLoadMore.reset(results.length, term);
      }
    },
    setMenuPosition: async function () {
      await this.$nextTick();
      setTimeout(() => {
        const menu = document.getElementsByClassName('copy-tree-search-dialog-menu')[0];
        if (!menu) {
          return;
        }
        const autocompleteRect = this.$refs.copyRelateSearch.$el.getBoundingClientRect();
        menu.style.left = autocompleteRect.x + "px";
        menu.style.top = (autocompleteRect.y + autocompleteRect.height) + "px";
      }, 3000)
    },
    loadMore: function (callback) {
      SearchService.ownVertices(this.search, this.searchItems.length).then((results) => {
        this.searchItems = this.searchItems.concat(results.map((result) => {
              result.disabled = result.original.getGraphElement().isPattern() || !result.original.getGraphElement().isOwner();
              return result;
            })
        );
        this.$nextTick(() => {
          callback(results.length, this.$refs.copyRelateSearch);
        });
      });
    }
  },
  computed: {
    isCopyTreeFlow: function () {
      return this.$store.state.isCopyTreeFlow;
    }
  },
  watch: {
    search: function (val) {
      this.setMenuPosition();
      val && val !== this.select && this.querySelections(val)
    },
    isCopyTreeFlow: async function () {
      if (this.$store.state.isCopyTreeFlow) {
        this.dialog = true;
      }
    },
    dialog: function () {
      if (this.dialog === false) {
        KeyboardActions.enable();
        this.$store.dispatch("isCopyTreeFlow", false)
      } else {
        this.action = null;
        this.relateSuccess = false;
        this.newCenterSuccess = false;
        KeyboardActions.disable();
      }
    }
  }
}
</script>

<style scoped>

</style>