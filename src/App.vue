<template>
    <v-app id="app" v-if="dataLoaded">
        <v-overlay :value="isLoading" z-index="9999">
            <div class="text">
                <v-progress-circular indeterminate color="white" v-if="hasLoadingSpinner"></v-progress-circular>
            </div>
        </v-overlay>
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
                <v-toolbar-title>
                    <router-link to="/welcome" class="no-style-link vh-center mr-4">
                        <v-img
                                :src="require('@/assets/logo-horizontal-black-small.png')"
                                height="44"
                                width="223"
                                alt="mindrespect.com"
                                v-if="$vuetify.breakpoint.mdAndUp"
                        ></v-img>
                        <v-img
                                :src="require('@/assets/MR.png')"
                                height="35"
                                width="51"
                                alt="MR"
                                class="mt-1 ml-4"
                                v-if="$vuetify.breakpoint.smAndDown && !isGraphRoute"
                        ></v-img>
                    </router-link>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <Search class="mt-6"></Search>
                <v-spacer></v-spacer>
                <v-btn text light
                       v-if="$store.state.user === undefined"
                       @click="loginDialog = true"
                       :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }"
                >
                    {{$t('login')}}
                </v-btn>
                <v-btn text light
                       v-if="$store.state.user === undefined"
                       @click="registerDialog = true"
                       :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }">
                    {{$t('register')}}
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
                <ToolbarGraphButtons v-if="$store.state.user"></ToolbarGraphButtons>
            </v-app-bar>
        </div>
        <SideMenu v-if="isGraphRoute && $store.state.selected.length > 0"></SideMenu>
        <v-content>
            <router-view></router-view>
        </v-content>
        <v-dialog v-model="registerDialog" width="900" v-if="registerDialog">
            <v-card>
                <v-card-title class="pb-0">
                    <h3 class="title">
                        {{$t('register:title')}}
                        <div class="grey--text">
                            {{$t('register:subtitle')}}
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
                    <h3 class="title">
                        {{$t('login:title')}}
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
                    <h3 class="title">
                        {{$t('forgot:title')}}
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
                    <h3 class="title">
                        {{$t('password:title')}}
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

    Vue.use(VueClipboard);
    export default {
        components: {
            ToolbarGraphButtons: () => import('@/components/ToolbarGraphButtons'),
            SideMenu,
            RegisterForm: () => import('@/components/home/RegisterForm'),
            LoginForm: () => import('@/components/home/LoginForm'),
            ForgotPasswordForm: () => import('@/components/home/ForgotPasswordForm'),
            ChangePasswordForm: () => import('@/components/home/ChangePasswordForm'),
            Search: () => import('@/components/Search')
        },
        data: function () {
            I18n.i18next.addResources("en", "button", {
                "select": "Hand selector",
                "group": "Merge bubbles into one",
                "addChild": "Add a child (tab)",
                "identify": "Tags",
                "identifyWhenMany": "Tags",
                "compare": "Compare with another user",
                "reverseToRight": "Invert relation",
                "reverseToLeft": "Invert relation",
                "suggestions": "Suggestions",
                "subElements": "Made of graph elements",
                "center": "Center bubble",
                "note": "Note",
                "images": "Add images",
                "cut": "Cut",
                "paste": "Paste",
                "selectTree": "Select tree",
                "makePrivate": "Make private",
                "makePublic": "Make public",
                "remove": "Delete (del)",
                "accept": "Accept",
                "addSibling": "Add sibling (enter)",
                "zoomIn": "Zoom in",
                "zoomOut": "Zoom out",
                "expandAll": "Expand all",
                "selectAllBubbles": "Select all",
                "visitOtherInstances": "See where this bubble is also found on this map",
                "collapse": "Hide tree",
                "expand": "Expand",
                "wikidataOn": "Activate autocompletion from Wikidata",
                "wikidataOff": "Deactivate autocompletion from Wikidata",
                "copy": "Copy",
                "undo": "Undo",
                "redo": "Redo",
                "changeBackgroundColor": "Background color",
                "convertToRelation": "Convert to relation",
                "convertToGroupRelation": "Convert to group relation",
                "wikipediaLinks": "Learn more on Wikipedia",
                "merge": "Merge",
                "list": "See the selection as a list",
                "listAll": "See as list",
                "fontPicker": "Font picker",
                "setShareLevel": "Share",
                "createVertex": "Create a new bubble"
            });
            I18n.i18next.addResources("fr", "button", {
                "select": "Sélection à la main",
                "group": "Créer une bulle à partir de celles sélectionnés",
                "addChild": "Ajouter un enfant (tab)",
                "identify": "Étiquettes",
                "identifyWhenMany": "Étiquettes",
                "compare": "Comparer avec un autre usager",
                "reverseToRight": "Inverser la relation",
                "reverseToLeft": "Inverser la relation",
                "suggestions": "Suggestions",
                "subElements": "De quoi est composé la bulle",
                "center": "Centrer la bulle",
                "note": "Note",
                "images": "Ajouter des images",
                "cut": "Couper",
                "paste": "Coller",
                "selectTree": "Sélectionner l'arbre",
                "makePrivate": "Rendre privé",
                "makePublic": "Rendre public",
                "remove": "Effacer (suppr)",
                "accept": "Accepter",
                "addSibling": "Ajouter une bulle soeur (enter)",
                "zoomIn": "Zoom intérieur",
                "zoomOut": "Zoom extérieur",
                "expandAll": "Expandre tout",
                "selectAllBubbles": "Sélectionner tout",
                "visitOtherInstances": "Voir où cette bulle se trouve également sur cette carte",
                "collapse": "Cacher l'arbre",
                "expand": "Expandre",
                "wikidataOn": "Activer l'autocompletion de Wikidata",
                "wikidataOff": "Désactiver l'autocompletion de Wikidata",
                "copy": "Copier",
                "undo": "Annuller",
                "redo": "Refaire",
                "changeBackgroundColor": "Couleur de fond",
                "convertToRelation": "Convertir en relation",
                "convertToGroupRelation": "Convertir en relation groupée",
                "wikipediaLinks": "En savoir plus sur Wikipédia",
                "merge": "Fusionner",
                "list": "Voir la sélection sous forme de liste",
                "listAll": "Voir en liste",
                "fontPicker": "Polices",
                "setShareLevel": "Partager",
                "createVertex": "Créer une nouvelle bulle"
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
                changePasswordDialog: false
            };
        },
        methods: {
            switchLanguage: function () {
                let newLocale = this.$store.state.locale === "en" ? "fr" : "en";
                this.$store.dispatch('setLocale', newLocale);
            },
            showDialogFromRoute: function () {
                if (this.$route.name === 'register') {
                    this.registerDialog = true;
                }
                if (this.$route.name === 'login') {
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
                return this.$route.name === "Center"
            }
        },
        mounted: function () {
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
                if (this.$route.name === 'forgotPassword') {
                    this.forgotPasswordDialog = true;
                }
                if (this.$route.name === "Center") {
                    KeyboardActions.enable();
                } else {
                    KeyboardActions.disable();
                }
            },
            loginDialog: function () {
                if (this.loginDialog) {
                    this.$router.push({
                        name: "login"
                    });
                    this.$refs.loginForm.enter();
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
                    this.$refs.registerForm.enter();
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
                    this.$refs.forgotPasswordForm.enter();
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
        overflow: hidden;
        margin: 0;
        padding: 0;
        height: 100%;
    }

    body {
        overflow: scroll;
        margin: 0;
        padding: 0;
        height: 100%;
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

    .blur-overlay {
        filter: blur(4px);
    }

    .v-toolbar__content {
        padding: 6px;
    }

    .around-list {
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .around-list-item {
        overflow: hidden;
        float: left;
        max-width: 50%;
        padding-left: 5px;
        text-overflow: ellipsis;
    }

    .around-list-item::after {
        content: " ● ";
        color: #1A237E;
    }

    .around-list-item:last-of-type {
        content: " ● ";
    }

    .around-list-item:not(empty):last-of-type::after {
        content: " ...";
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
</style>

