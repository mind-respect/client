<template>
  <v-app id="app" v-if="dataLoaded">
    <v-overlay :value="isLoading" z-index="9999">
      <div class="text">
        <v-progress-circular indeterminate color="white" v-if="hasLoadingSpinner"></v-progress-circular>
      </div>
    </v-overlay>
    <OfflineOverLay></OfflineOverLay>
    <div id="nav" class="pa-0">
      <v-app-bar
          color="white"
          height="43"
          app
          :class="{
                        'no-padding' : $vuetify.breakpoint.smAndDown
                    }"
          style="z-index:4;"
      >
        <v-toolbar-title v-show="!showSearch || $vuetify.breakpoint.mdAndUp">
          <router-link to="/welcome" class="no-style-link vh-center" :class="{
                        'mr-4' : $vuetify.breakpoint.mdAndUp
                        }">
            <v-img
                :src="require('@/assets/logo-horizontal-black-small.png')"
                height="44"
                width="223"
                alt="mindrespect.com"
                v-if="$vuetify.breakpoint.lgAndUp"
            ></v-img>
            <v-img
                :src="require('@/assets/MR.png')"
                height="35"
                width="51"
                alt="MR"
                class="mt-1"
                :class="{
                                    'ml-2': $vuetify.breakpoint.smAndUp
                                }"
                v-if="$vuetify.breakpoint.mdAndDown && (!isGraphRoute || $vuetify.breakpoint.width > 320)"
            ></v-img>
          </router-link>
        </v-toolbar-title>
        <v-menu
            :nudge-width="200"
            offset-x
            :offset-y="$vuetify.breakpoint.mdAndDown"
            v-if="!isGraphRoute && ($vuetify.breakpoint.mdAndUp || !showSearch)"
            :fixed="$vuetify.breakpoint.mdAndDown"
            :max-width="$vuetify.breakpoint.mdAndDown ? $vuetify.breakpoint.getClientWidth() : 'auto'"
            :position-x="0"
            :position-y="0"
            :close-on-content-click="false"
        >
          <template v-slot:activator="{ on }">
            <div v-on="on">
              <v-icon v-if="showOnlyMovieIconInRecruit"
                      class="ml-3"
                      v-on="on"
                      color="secondary">
                movie
              </v-icon>
              <v-btn text color="secondary" v-else>
                <v-icon class="mr-2" v-if="$vuetify.breakpoint.lgAndUp">person</v-icon>
                {{ $t('app:recruits') }} !
              </v-btn>
            </div>
          </template>
          <v-card :class="{
                        'pa-0' : $vuetify.breakpoint.mdAndDown
                    }">
            <v-card-title class="vh-center text-subtitle-1">
              <v-icon class="mr-2">email</v-icon>
              {{ $t('app:recruitContact') }} :
              <a href="mailto:vincent.blouin@gmail.com" class="ml-2">
                vincent.blouin@gmail.com
              </a>
            </v-card-title>
            <v-card-text :class="{
                        'pa-0' : $vuetify.breakpoint.mdAndDown
                    }">
              <iframe :width="$vuetify.breakpoint.mdAndDown ? $vuetify.breakpoint.getClientWidth() : 560"
                      height="315" :src="$t('app:recruitVideo')" frameborder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen></iframe>
            </v-card-text>
          </v-card>
        </v-menu>
        <v-spacer></v-spacer>
        <v-btn icon v-show="showSearch && $vuetify.breakpoint.smAndDown" @click="leaveSearchFlow">
          <v-icon color="primary">keyboard_backspace</v-icon>
        </v-btn>
        <Search class="mt-6" v-show="showSearch || $vuetify.breakpoint.mdAndUp" ref="search"
                @leaveSearchFlow="leaveSearchFlow"></Search>
        <v-spacer></v-spacer>
        <v-btn icon color="third"
               v-if="$store.state.userHomeSelectedCenter && isUserHomeRoute"
               v-show="!showSearch"
               :href="$store.state.userHomeSelectedCenter.uri().url()"
               target="_blank">
          <v-icon>
            open_in_new
          </v-icon>
        </v-btn>
        <v-btn icon color="third"
               v-if="$store.state.userHomeSelectedCenter && isUserHomeRoute"
               v-show="!showSearch"
               @click="copyUserHomeSelectedCenterUrl()">
          <v-icon>
            link
          </v-icon>
        </v-btn>
        <ToolbarGraphButtons v-if="$store.state.user" @enterSearchFlow="enterSearchFlow"
                             ref="toolBar"
                             @enterDocsFlow="$refs.docsFlow.enter()"
                             @enterPatternFlow="patternDialog = true"
                             @addExistingChildToCenter="$store.dispatch('setAddExistingToParent', true)"
        ></ToolbarGraphButtons>
        <v-btn text light
               v-if="$store.state.user === undefined"
               @click="loginDialog = true"
               :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }"
        >
          {{ $t('login') }}
        </v-btn>
        <v-btn text light
               v-if="$store.state.user === undefined"
               @click="registerDialog = true"
               :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }">
          {{ $t('register') }}
        </v-btn>
        <v-btn light text @click="switchLanguage()"
               v-if="$store.state.user === undefined"
               :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }">
          <v-icon class="mr-2 pa-0">public</v-icon>
          <span v-if="$store.state.locale.toLowerCase() === 'fr' && $vuetify.breakpoint.smAndDown">
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
        </v-btn>
      </v-app-bar>
    </div>
    <SideMenu v-if="isGraphRoute"></SideMenu>
    <v-main>
      <router-view></router-view>
    </v-main>
    <v-dialog v-model="registerDialog" width="900" v-if="registerDialog">
      <v-card>
        <v-card-title class="pb-0">
          <h3 class="text-h6">
            {{ $t('register:title') }}
            <div class="grey--text">
              {{ $t('register:subtitle') }}
            </div>
          </h3>
          <v-spacer></v-spacer>
          <v-icon @click="registerDialog = false">close</v-icon>
        </v-card-title>
        <v-card-text class="pa-0">
          <RegisterForm @flow-is-done="registerDialog = false" ref="registerForm"></RegisterForm>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loginDialog" width="900" v-if="loginDialog">
      <v-card>
        <v-card-title class="pb-0">
          <h3 class="text-h6">
            {{ $t('login:title') }}
          </h3>
          <v-spacer></v-spacer>
          <v-icon @click="loginDialog = false">close</v-icon>
        </v-card-title>
        <v-card-text class="pa-0">
          <LoginForm @flow-is-done="loginDialog = false" ref="loginForm"></LoginForm>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="forgotPasswordDialog" width="900" v-if="forgotPasswordDialog">
      <v-card>
        <v-card-title class="pb-0">
          <h3 class="text-h6">
            {{ $t('forgot:title') }}
          </h3>
          <v-spacer></v-spacer>
          <v-icon @click="forgotPasswordDialog = false">close</v-icon>
        </v-card-title>
        <v-card-text>
          <ForgotPasswordForm @flow-is-done="forgotPasswordDialog = false"
                              ref="forgotPasswordForm"></ForgotPasswordForm>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="changePasswordDialog" width="900" v-if="changePasswordDialog">
      <v-card>
        <v-card-title class="pb-0">
          <h3 class="text-h6">
            {{ $t('password:title') }}
          </h3>
          <v-spacer></v-spacer>
          <v-icon @click="changePasswordDialog = false">close</v-icon>
        </v-card-title>
        <v-card-text>
          <ChangePasswordForm @flow-is-done="changePasswordDialog = false"
                              ref="changePasswordForm"></ChangePasswordForm>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-if="patternDialog" v-model="patternDialog" width="600">
      <v-card>
        <v-card-title>
          {{ $t('areYouSure') }}
          <v-spacer></v-spacer>
          <v-btn @click="patternDialog=false" icon>
            <v-icon>
              close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-body-1">
          <p>
            {{ $t('app:patternInfo') }}
          </p>
          <p>
            {{ $t('app:patternInfo2') }}
          </p>
          <v-alert
              border="left"
              colored-border
              type="info"
              color="secondary"
              elevation="2"
          >
            {{ $t('app:patternInfo3') }}
          </v-alert>
          <ListView :collapse="true" :showTags="true"></ListView>
        </v-card-text>
        <v-card-actions fixed>
          <v-btn @click="becomeAPattern" :loading="makePatternLoading" :disabled="makePatternLoading"
                 color="secondary">
            <v-icon class="mr-2">
              stars
            </v-icon>
            {{ $t('app:makeAPattern') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="patternDialog=false" text>
            {{ $t('cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <DocsDialog ref="docsFlow"></DocsDialog>
    <v-snackbar v-model="firstTimeSnackbar" color="secondary" timeout="-1" app>
      <v-toolbar color="transparent" dense elevation="0">
        <span class="text-body-1" v-if="$vuetify.breakpoint.mdAndUp">{{ $t('app:firstTime') }}</span>
        <v-divider vertical class="mx-4" color="white" v-if="$vuetify.breakpoint.mdAndUp"></v-divider>
        <v-btn
            dark
            text
            @click="$refs.docsFlow.enter()"
            class="pl-0 pr-0"
        >
          <v-icon class="mr-2">book</v-icon>
          {{ $t('app:firstTime2') }}
        </v-btn>
        <v-icon class="ml-8" @click="firstTimeSnackbar = false; $store.dispatch('setIsFirstTime', false);">close
        </v-icon>
      </v-toolbar>
    </v-snackbar>
  </v-app>
</template>

<script>
import SideMenu from '@/components/SideMenu'
import UserService from '@/service/UserService'
import LoadingFlow from '@/LoadingFlow'
import Store from '@/store'
import Vue from 'vue'
import KeyboardActions from '@/KeyboardActions'
import VueClipboard from 'vue-clipboard2'
import I18n from '@/I18n'
import AppController from '@/AppController'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import ShareLevel from '@/vertex/ShareLevel'

const LoginPages = ['login', 'LoginFriendshipConfirm'];

Vue.use(VueClipboard);
export default {
  components: {
    ToolbarGraphButtons: () => import('@/components/ToolbarGraphButtons'),
    SideMenu,
    RegisterForm: () => import('@/components/home/RegisterForm'),
    LoginForm: () => import('@/components/home/LoginForm'),
    ForgotPasswordForm: () => import('@/components/home/ForgotPasswordForm'),
    ChangePasswordForm: () => import('@/components/home/ChangePasswordForm'),
    Search: () => import('@/components/Search'),
    DocsDialog: () => import('@/components/DocsDialog'),
    ListView: () => import('@/components/ListView'),
    OfflineOverLay: () => import('@/components/OfflineOverlay')
  },
  data: function () {
    I18n.i18next.addResources("en", "button", {
      removeTagFlow: "Remove tag",
      enterDuplicateMenu: "See duplicates",
      goToLink: "Go to the clicked link",
      select: "Hand selector",
      group: "Merge bubbles into one",
      focusRelation: "Edit relation",
      addBubbleMenu: "Add a bubble",
      addChild: "Add a bubble next to it (tab)",
      addExistingToParentFlow: "Link to an existing bubble",
      editMenu: "Write",
      focus: "Write",
      focusDirectly: "Write",
      moveBubbleMenu: "Move",
      moveCompletelyUp: "Move completely up",
      moveUpOneStep: "Move up",
      moveDownOneStep: "Move down",
      moveCompletelyDown: "Move completely down",
      addTag: "Add tag",
      tagTogether: "Label one to the other",
      showTags: "Show tags",
      hideTags: "Hide tags",
      compare: "Compare with another user",
      reverseToRight: "Invert relation",
      reverseToLeft: "Invert relation",
      suggestions: "Suggestions",
      subElements: "Made of graph elements",
      center: "Center bubble",
      note: "Note",
      images: "Add images",
      cut: "Cut bubble",
      paste: "Paste the cut bubble",
      pasteText: "Paste text",
      selectTree: "Select tree",
      makePrivate: "Make private",
      makePublic: "Make public",
      remove: "Delete (del)",
      removeRelation: "Delete the link with the bubble at the back",
      accept: "Accept",
      addSibling: "Add bubble under (enter)",
      addSiblingUp: "Add bubble above",
      addParent: "Add a bubble at the back",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      expandAll: "Expand all",
      selectAllBubbles: "Select all",
      collapse: "Hide tree",
      collapseOthers: "Hide other trees",
      expand: "Expand",
      wikidataOn: "Activate autocompletion from Wikidata",
      wikidataOff: "Deactivate autocompletion from Wikidata",
      copy: "Copy text",
      undo: "Undo",
      redo: "Redo",
      changeBackgroundColor: "Background color",
      convertToRelation: "Convert to relation",
      convertToGroupRelation: "Convert to group relation",
      wikipediaLinks: "Learn more on Wikipedia",
      merge: "Merge",
      list: "See the selection as a list",
      listAll: "See as list",
      fontPicker: "Font picker",
      setShareLevel: "Share",
      createVertex: "Create a new center",
      close: "Close",
      leaveContext: "Split into 2 cards that share a tag",
      setColor: "Set color",
      openWikipediaLink: "Open Wikipedia link"
    });
    I18n.i18next.addResources("fr", "button", {
      removeTagFlow: "Enlever l'étiquette",
      enterDuplicateMenu: "Voir les duplicats",
      goToLink: "Aller au lien cliqué",
      select: "Sélection à la main",
      group: "Créer une bulle à partir de celles sélectionnés",
      focusRelation: "Éditer la relation",
      addBubbleMenu: "Ajouter une bulle",
      addChild: "Ajouter une bulle à coté (tab)",
      addExistingToParentFlow: "Relier à une bulle existante",
      editMenu: "Écrire",
      focus: "Écrire",
      focusDirectly: "Écrire",
      moveBubbleMenu: "Déplacer",
      moveCompletelyUp: "Déplacer complètement en haut",
      moveUpOneStep: "Déplacer vers le haut",
      moveDownOneStep: "Déplacer vers le bas",
      moveCompletelyDown: "Déplacer complètement en bas",
      addTag: "Ajouter étiquette",
      tagTogether: "Étiquetter l'un à l'autre",
      showTags: "Montrer les étiquettes",
      hideTags: "Cacher les étiquettes",
      compare: "Comparer avec un autre usager",
      reverseToRight: "Inverser la relation",
      reverseToLeft: "Inverser la relation",
      suggestions: "Suggestions",
      subElements: "De quoi est composé la bulle",
      center: "Centrer la bulle",
      note: "Note",
      images: "Ajouter des images",
      cut: "Couper la bulle",
      paste: "Coller la bulle coupée",
      pasteText: "Coller texte",
      selectTree: "Sélectionner l'arbre",
      makePrivate: "Rendre privé",
      makePublic: "Rendre public",
      remove: "Effacer (suppr)",
      removeRelation: "Effacer le lien avec la bulle en arrière",
      accept: "Accepter",
      addSibling: "Ajouter une bulle en dessous (enter)",
      addSiblingUp: "Ajouter une bulle au dessus",
      addParent: "Ajouter une bulle en arrière",
      zoomIn: "Zoom intérieur",
      zoomOut: "Zoom extérieur",
      expandAll: "Expandre tout",
      selectAllBubbles: "Sélectionner tout",
      collapse: "Cacher l'arbre",
      collapseOthers: "Cacher les autres arbres",
      expand: "Expandre",
      wikidataOn: "Activer l'autocompletion de Wikidata",
      wikidataOff: "Désactiver l'autocompletion de Wikidata",
      copy: "Copier texte",
      undo: "Annuller",
      redo: "Refaire",
      changeBackgroundColor: "Couleur de fond",
      convertToRelation: "Convertir en relation",
      convertToGroupRelation: "Convertir en relation groupée",
      wikipediaLinks: "En savoir plus sur Wikipédia",
      merge: "Fusionner",
      list: "Voir la sélection sous forme de liste",
      listAll: "Voir en liste",
      fontPicker: "Polices",
      setShareLevel: "Partager",
      createVertex: "Créer un nouveau centre",
      close: "Fermer",
      leaveContext: "Séparer en 2 cartes qui partagent un étiquette",
      setColor: "Définir la couleur",
      openWikipediaLink: "Ouvrir le lien wikipedia"
    });

    I18n.i18next.addResources("en", "app", {
      makeAPattern: "Make this map a pattern",
      patternInfo: "Other users will be able to copy this map and use it as a starting point to add their own ideas.",
      patternInfo2: "All bubbles on this map, even those under bubbles to expand, will be public.",
      patternInfo3: "Check that this map only contains bubbles and tags that you want to share.",
      on: "On",
      thisMap: "this map",
      recruits: "Recruits",
      recruitVideo: "https://www.youtube.com/embed/XTHBs3qsuxo?cc_load_policy=1&hl=en",
      recruitContact: "Contact me",
      firstTime: "Welcome to mindrespect.com",
      firstTime2: "see documentation"
    });

    I18n.i18next.addResources("fr", "app", {
      makeAPattern: "Faire de cette carte un pattern",
      patternInfo: "D'autres usagers pourront copier cette carte et l'utiliser comme point de départ pour y ajouter leurs propres idées.",
      patternInfo2: "Toutes les bulles de cette carte, même celles qui sont sous des bulles à expandre, seront publiques.",
      patternInfo3: "Vérifiez que cette carte ne contient que des bulles et étiquettes que vous voulez partager.",
      on: "Sur",
      thisMap: "cette carte",
      recruits: "Recrute",
      recruitVideo: "https://www.youtube.com/embed/XTHBs3qsuxo?cc_load_policy=0&hl=fr",
      recruitContact: "Contactez-moi",
      firstTime: "Bienvenue sur mindrespect.com",
      firstTime2: "consulter la documentation"
    });
    return {
      clipped: false,
      dataLoaded: false,
      registerDialog: false,
      loginDialog: false,
      loadingFlows: LoadingFlow.loadingFlows,
      isLoading: false,
      hasLoadingSpinner: true,
      forgotPasswordDialog: false,
      changePasswordDialog: false,
      showSearch: this.$vuetify.breakpoint.mdAndUp,
      patternDialog: false,
      makePatternLoading: false,
      showRecruitMenu: false,
      firstTimeSnackbar: false
    };
  },
  methods: {
    copyUserHomeSelectedCenterUrl: function () {
      this.$copyText(
          this.$store.state.userHomeSelectedCenter.uri().absoluteUrl()
      )
    },
    becomeAPattern: function () {
      this.makePatternLoading = true;
      AppController.becomeAPattern().then(() => {
        CurrentSubGraph.get().getGraphElements().forEach((bubble) => {
          if (bubble.canChangeShareLevel()) {
            bubble.setShareLevel(
                ShareLevel.PUBLIC
            );
            bubble.refreshButtons();
          }
        });
        this.patternDialog = false;
        this.makePatternLoading = false;
      })
    },
    enterSearchFlow: function () {
      this.showSearch = true;
      this.$refs.search.enterSearchFlow();
    },
    leaveSearchFlow: function () {
      this.showSearch = false;
      this.$refs.toolBar.leaveSearchFlow();
    },
    isLoginUrl: function () {
      return LoginPages.indexOf(this.$route.name) > -1;
    },
    switchLanguage: function () {
      let newLocale = this.$store.state.locale === "en" ? "fr" : "en";
      this.$store.dispatch('setLocale', newLocale);
    },
    showDialogFromRoute: function () {
      if (this.$route.name === 'register') {
        this.registerDialog = true;
      }
      if (this.isLoginUrl()) {
        this.loginDialog = true;
      }
      if (this.$route.name === 'forgotPassword') {
        this.forgotPasswordDialog = true;
      }
      if (this.$route.name === 'changePassword') {
        this.changePasswordDialog = true;
      }
    }
  },
  computed: {
    isGraphRoute: function () {
      return this.$route.name === "Center";
    },
    isUserHomeRoute: function () {
      return this.$route.name.indexOf('UserHome') > -1;
    },
    showOnlyMovieIconInRecruit: function () {
      return this.$vuetify.breakpoint.mdAndDown && [
        'home', 'welcome', 'register', 'login'
      ].indexOf(this.$route.name) > -1;
    }
  },
  mounted: function () {
    if (document.scrollingElement) {
      document.scrollingElement.style.overflow = "scroll";
    }
    UserService.authenticatedUser().then((response) => {
      this.$store.dispatch('setUser', response.data);
      this.dataLoaded = true;
      Vue.nextTick(() => {
        this.showDialogFromRoute();
      })
    }).catch(() => {
      this.$store.dispatch('setUser', undefined);
      this.dataLoaded = true;
      Vue.nextTick(() => {
        this.showDialogFromRoute();
      })
    });
  },
  watch: {
    loadingFlows: function () {
      this.isLoading = this.loadingFlows.length > 0;
      if (this.isLoading) {
        this.hasLoadingSpinner = this.loadingFlows[this.loadingFlows.length - 1];
      }
      Store.dispatch("setIsLoading", this.isLoading);
    },
    '$route.name': function () {
      this.showDialogFromRoute();
      if (this.$route.name === "Center") {
        KeyboardActions.enable();
        if (this.$store.state.isFirstTime) {
          this.firstTimeSnackbar = true;
        }
      } else {
        KeyboardActions.disable();
      }
    },
    loginDialog: function () {
      if (this.loginDialog) {
        if (!this.isLoginUrl()) {
          this.$router.push({
            name: "login"
          });
        }
        return;
      }
      this.$router.push({
        name: "home"
      });
    },
    registerDialog: function () {
      if (this.registerDialog) {
        this.$router.push({
          name: "register"
        });
        return;
      }
      this.$router.push({
        name: "home"
      });
    },
    forgotPasswordDialog: function () {
      if (this.forgotPasswordDialog) {
        this.$router.push({
          name: "forgot-password"
        });
        return;
      }
      this.$router.push({
        name: "home"
      });
    },
    changePasswordDialog: function () {
      if (this.changePasswordDialog) {
        // Vue.nextTick(function () {
        //     console.log(this.$refs)
        //     debugger;
        //     // this.$refs.changePasswordForm.enter();
        // }.bind(this))
        return;
      }
      this.$router.push({
        name: "home"
      });
    }
  }
}
</script>

<style>
html {
  margin: 0;
  padding: 0;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
  height: 100%;
}

/*
Trying to avoid white block at bottom with height :100% but it's not really working
*/
.v-main {
  height: 100%;
}

.v-main__wrap {
  height: 100%;
}

.secondary-color {
  color: #1A237E !important;
}

.third-color {
  color: #00897B !important;
}

.v-chip {
  transition: none;
}

.mr-title {
  font-family: 'Dancing Script', cursive !important;
  font-size: 35px;
  font-weight: bold;
}

a.no-style-link {
  color: white;
  text-decoration: none;
}

.vh-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/*
vertical-center
*/
.v-center {
  display: flex;
  align-items: center;
}

/*
horizontal-center
*/
.h-center {
  display: flex;
  justify-content: center;
}

.h-right {
  display: flex;
  justify-content: right;
}

.no-padding > .v-toolbar__content {
  padding: 0 !important;
}

.grab-bing {
  cursor: -webkit-grab;
  cursor: -moz-grab;
  cursor: -o-grab;
  cursor: grab;
}

.grab-bing:active {
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
  cursor: -o-grabbing;
  cursor: grabbing;
}

.reverse, .v-chip.reverse .v-chip__content {
  display: flex;
  flex-direction: row-reverse;
}

.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.v-toolbar__content {
  padding: 6px;
}

.around-list-item {
  overflow: hidden;
  float: left;
  max-width: 50%;
  padding-left: 5px;
  /*text-overflow: ellipsis;*/
}

.around-list-item::after {
  content: " | ";
  color: gray;
}

.around-list-item:not(empty):last-of-type::after {
  content: "";
}

*.unselectable {
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;

  /*
    Introduced in IE 10.
    See http://ie.microsoft.com/testdrive/HTML5/msUserSelect/
  */
  -ms-user-select: none;
  user-select: none;
}

.flip-horizontal {
  transform: scale(-1, 1);
}

/*
vuetifyjs wrong component css order fixes
*/
.v-badge__badge .v-icon {
  font-size: 14px;
}

[contenteditable] {
  -webkit-user-select: text;
  user-select: text;
}

.line-through {
  text-decoration: line-through;
}

.grecaptcha-badge {
  visibility: hidden;
}

.rotate-90 {
  -webkit-transform: rotate(90deg);
  -moz-transform: rotate(90deg);
  -ms-transform: rotate(90deg);
  -o-transform: rotate(90deg);
  transform: rotate(90deg);
}

.rotate-270 {
  -webkit-transform: rotate(270deg);
  -moz-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  -o-transform: rotate(270deg);
  transform: rotate(270deg);
}

</style>

