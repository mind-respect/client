<template>
  <v-navigation-drawer
      content-class="settings-menu"
      stateless
      touchless
      fixed
      max-width="400"
      width="350"
      height="90%"
      offset-y
      v-if="$store.state.user !== undefined"
      :close-on-content-click="false"
      z-index="14"
      right
      style="z-index:15;display:inherit;margin-top:44px;"
      v-model="showSettingsMenu"
  >
    <div style="background-color:white" class="pt-2">
      <router-link to="/welcome">
        <img
            :src="require('@/assets/MR.png')"
            height="35"
            width="51"
            alt="MR"
            class="float-right mr-4"
            v-if="isGraphRoute && $vuetify.breakpoint.width <= 320"
        >
      </router-link>
      <v-list :dense="$vuetify.breakpoint.mdAndDown">
        <v-list-item-group v-model="selectedItem">
          <v-list-item @click="$emit('enterDocsFlow');closeIfMobile();">
            <v-list-item-action>
              <v-icon>book</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('settings:documentation') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="showTags = !showTags">
            <v-list-item-action>
              <v-switch :input-value="showTags" color="third"></v-switch>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('settings:showTags') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="showRelations = !showRelations">
            <v-list-item-action>
              <v-switch :input-value="showRelations" color="third"></v-switch>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t('settings:showRelations') }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-list subheader v-if="isGraphRoute" :dense="$vuetify.breakpoint.mdAndDown">
        <v-subheader>
          {{ $t('settings:thisMap') }}
        </v-subheader>
        <v-list-item
            @click="$emit('addExistingChildToCenter');closeIfMobile();"
            :disabled="!isOwner || this.$store.state.isPatternFlow"
        >
          <v-list-item-action>
            <v-icon>scatter_plot</v-icon>
          </v-list-item-action>
          <v-list-item-title>{{ $t('graph:addExistingBubble') }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click="expandAll();closeIfMobile();" :disabled="!canExpandAll"
                     v-if="isGraphRoute">
          <v-list-item-action>
            <v-icon class="">unfold_more</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ $t('button:expandAll') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="selectAllBubbles();closeIfMobile();" v-if="isGraphRoute">
          <v-list-item-action>
            <v-icon class="">select_all</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ $t('button:selectAllBubbles') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="fontPicker();closeIfMobile();" v-if="isGraphRoute" :disabled="$store.state.isViewOnly">
          <v-list-item-action>
            <v-icon class="">font_download</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ $t('button:fontPicker') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="$emit('enterPatternFlow');closeIfMobile();"
                     v-if="isGraphRoute && !$store.state.isPatternFlow && !$store.state.isViewOnly">
          <v-list-item-action>
            <v-icon>stars</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ $t('settings:becomePattern') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="removePattern();closeIfMobile();"
                     v-if="isGraphRoute && $store.state.isPatternFlow && !$store.state.isViewOnly">
          <v-list-item-action>
            <v-icon>stars</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ $t('settings:removePattern') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list subheader :dense="$vuetify.breakpoint.mdAndDown" class="overflow-y-auto">
        <v-subheader>
          {{ $t('settings:yourAccount') }}
        </v-subheader>
        <v-list-item @click="switchLanguage();closeIfMobile();">
          <v-list-item-action>
            <v-icon class="">public</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
                                            <span
                                                v-if="$store.state.locale.toLowerCase() === 'fr' && $vuetify.breakpoint.smAndDown">
                                                EN
                                            </span>
              <span v-if="$store.state.locale.toLowerCase() === 'fr' && $vuetify.breakpoint.mdAndUp">
                                                English
                                            </span>
              <span v-if="$store.state.locale.toLowerCase() === 'en' && $vuetify.breakpoint.smAndDown">
                                                FR
                                            </span>
              <span v-if="$store.state.locale.toLowerCase() === 'en' && $vuetify.breakpoint.mdAndUp">
                                                Français
                                            </span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="logout();closeIfMobile();">
          <v-list-item-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ $t('logout') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-subheader v-if="isGraphRoute">
          {{ $t('settings:debugging') }}
        </v-subheader>
        <v-list-item @click="invalidateCacheAndRestart" v-if="isGraphRoute">
          <v-list-item-action>
            <v-icon class="">cached</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ $t('settings:invalidateCache') }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ $t('settings:invalidateCacheReload') }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script>
import AppController from '@/AppController'
import GraphController from '@/graph/GraphController'
import AuthenticateService from "@/service/AuthenticateService";
import I18n from '@/I18n'
import Store from "@/store";
import CurrentSubGraph from "@/graph/CurrentSubGraph";
import GraphUi from '@/graph/GraphUi'

export default {
  name: "SettingsMenu",
  components: {},
  data: function () {
    I18n.i18next.addResources("en", "settings", {
      becomePattern: "Create pattern",
      removePattern: "Remove the pattern",
      documentation: "Documentation",
      thisMap: "This map",
      yourAccount: "Your account",
      debugging: "Debugging",
      invalidateCache: "Invalidate cache",
      invalidateCacheReload: "And reload the map",
      showTags: "Show tags by default",
      showRelations: "Show relations by default",
      preferences: "Preferences"
    });
    I18n.i18next.addResources("fr", "settings", {
      becomePattern: "Créer un pattern",
      removePattern: "Enlever le pattern",
      documentation: "Documentation",
      thisMap: "Cette carte",
      yourAccount: "Votre compte",
      debugging: "Déboggage",
      invalidateCache: "Invalider la cache",
      invalidateCacheReload: "Et recharger la carte",
      showTags: "Afficher les étiquettes par défaut",
      showRelations: "Afficher les relations par défaut",
      preferences: "Préférences"
    });
    return {
      backgroundColor: null,
      showSettingsMenu: false,
      selectedItem: null
    }
  },
  mounted: function () {
  },
  methods: {
    toggle: function () {
      this.showSettingsMenu = !this.showSettingsMenu;
    },
    invalidateCacheAndRestart: function () {
      CurrentSubGraph.get().invalidateCache();
      Store.dispatch("centerRefresh");
    },
    closeIfMobile: function () {
      if (this.$vuetify.breakpoint.mdAndDown) {
        this.showSettingsMenu = false;
      }
    },
    removePattern: function () {
      AppController.removePattern();
    },
    expandAll: function () {
      GraphController.expandAll();
    },
    selectAllBubbles: function () {
      GraphController.selectAllBubbles();
    },
    fontPicker: function () {
      AppController.fontPicker();
    },
    switchLanguage: function () {
      let newLocale = this.$store.state.locale === "en" ? "fr" : "en";
      this.$store.dispatch('setLocale', newLocale);
    },
    logout: async function () {
      await AuthenticateService.logout();
      this.$router.push("/welcome");
    }
  },
  computed: {
    isGraphRoute: function () {
      return this.$route.name === "Center"
    },
    canExpandAll: function () {
      return GraphController.expandAllCanDo();
    },
    isOwner: function () {
      if (!this.$store.state.user) {
        return false;
      }
      return this.$route.params.username === this.$store.state.user.username
    },
    showTags: {
      get: function () {
        return this.$store.state.isShowTags;
      },
      set: function (value) {
        if (value) {
          GraphController.showAllTags();
        }
        if (!value) {
          GraphController.hideAllTags();
        }
        this.$store.dispatch("setIsShowTags", value);
      }
    },
    showRelations: {
      get: function () {
        return this.$store.state.isShowRelations;
      },
      set: async function (value) {
        await this.$store.dispatch("setIsShowRelations", value);
        Store.dispatch("redraw");
      }
    }
  }
}
</script>

<style>

</style>