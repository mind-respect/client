<template>
    <v-app id="app" v-if="dataLoaded">
        <div id="is-loading-overlay" v-if="isLoading">
            <div class="text">
                <v-progress-circular indeterminate color="white" v-if="hasLoadingSpinner"></v-progress-circular>
            </div>
        </div>
        <div id="nav" class="pa-0">
            <v-toolbar
                    app
                    color="white"
                    height="43"
                    :class="{
                        'no-padding' : $vuetify.breakpoint.smAndDown
                    }"
                    style="z-index:4;"
            >
                <v-toolbar-title>
                    <router-link to="/welcome" class="no-style-link vh-center">
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
                                class="mt-1 ml-3"
                                v-if="$vuetify.breakpoint.smAndDown"
                        ></v-img>
                    </router-link>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <!--<v-text-field-->
                <!--light-->
                <!--:placeholder="$t('search')"-->
                <!--append-icon="search"-->
                <!--v-if="$vuetify.breakpoint.mdAndUp"-->
                <!--&gt;</v-text-field>-->
                <Search></Search>
                <v-spacer></v-spacer>
                <v-btn flat light
                       v-if="$store.state.user === undefined"
                       @click="loginDialog = true"
                       :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }"
                >
                    {{$t('login')}}
                </v-btn>
                <v-btn flat light
                       v-if="$store.state.user === undefined"
                       @click="registerDialog = true"
                       :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }">
                    {{$t('register')}}
                </v-btn>
                <v-btn light flat @click="switchLanguage()"
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
                <v-btn :to="'/user/' + $store.state.user.username" v-if="$store.state.user" flat active-class="" :icon="$vuetify.breakpoint.mdAndDown">
                    <v-icon :class="{
                        'mr-2' : $vuetify.breakpoint.lgAndUp
                    }">
                        filter_center_focus
                    </v-icon>
                    <span v-if="$vuetify.breakpoint.lgAndUp">
                        {{$t('centers')}}
                    </span>
                </v-btn>
                <!--                <Button :button="undoButton" v-if="isGraphRoute"></Button>-->
                <!--                <Button :button="redoButton" v-if="isGraphRoute"></Button>-->
                <Button :button="zoomOutButton" v-if="isGraphRoute && $vuetify.breakpoint.lgAndUp"></Button>
                <Button :button="zoomInButton" v-if="isGraphRoute && $vuetify.breakpoint.lgAndUp"></Button>
                <Button :button="createVertexButton" :hightlight="true"
                        v-if="$store.state.user && $vuetify.breakpoint.lgAndUp"></Button>
                <SettingsMenu></SettingsMenu>
            </v-toolbar>
            <!--<router-link to="/">Home</router-link>-->
            <!--<router-link to="/about">About</router-link>-->
        </div>
        <SideMenu v-if="isGraphRoute && $vuetify.breakpoint.lgAndUp"></SideMenu>
        <v-content>
            <router-view></router-view>
        </v-content>
        <v-dialog v-model="registerDialog" width="900">
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
        <v-dialog v-model="loginDialog" width="900">
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
        <v-dialog v-model="forgotPasswordDialog" width="900">
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
        <v-dialog v-model="changePasswordDialog" width="900">
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
    import UserService from '@/service/UserService'
    import AuthenticateService from "./service/AuthenticateService";
    import LoginForm from "@/components/home/LoginForm";
    import RegisterForm from "@/components/home/RegisterForm";
    import ForgotPasswordForm from '@/components/home/ForgotPasswordForm'
    import ChangePasswordForm from '@/components/home/ChangePasswordForm'
    import SideMenu from '@/components/SideMenu'
    import SettingsMenu from '@/components/SettingsMenu'
    import Button from '@/components/graph/Button'
    import AppController from '@/AppController'
    import LoadingFlow from '@/LoadingFlow'
    import Store from '@/store'
    import Vue from 'vue'
    import KeyboardActions from '@/KeyboardActions'
    import Search from '@/components/Search'
    import VueClipboard from 'vue-clipboard2'
    import I18n from '@/I18n'

    Vue.use(VueClipboard);

    const aboutPages = ['register', 'login', 'forgotPassword', 'changePassword'];

    export default {
        components: {
            SideMenu,
            SettingsMenu,
            RegisterForm,
            LoginForm,
            ForgotPasswordForm,
            ChangePasswordForm,
            Search,
            Button
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
                "share": "Share",
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
                "share": "Partager",
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
                changePasswordDialog: false,
                undoButton: {
                    action: "undo",
                    icon: "undo",
                    ctrlShortcut: "Z",
                    controller: AppController,
                    disableNotHide: true
                },
                redoButton: {
                    action: "redo",
                    icon: "redo",
                    ctrlShortcut: "Y",
                    controller: AppController,
                    disableNotHide: true
                },
                zoomInButton: {
                    action: "zoomIn",
                    icon: "zoom_in",
                    ctrlShortcut: "&plus;",
                    controller: AppController
                },
                zoomOutButton: {
                    action: "zoomOut",
                    icon: "zoom_out",
                    ctrlShortcut: "&minus;",
                    controller: AppController,
                    disableNotHide: true
                },
                createVertexButton: {
                    action: "createVertex",
                    icon: "add",
                    controller: AppController
                }
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
            UserService.authenticatedUser().then(function (response) {
                this.$store.dispatch('setUser', response.data);
                this.dataLoaded = true;
                Vue.nextTick(function () {
                    this.showDialogFromRoute();
                }.bind(this))
            }.bind(this)).catch(function () {
                this.$store.dispatch('setUser', undefined);
                this.dataLoaded = true;
                Vue.nextTick(function () {
                    this.showDialogFromRoute();
                }.bind(this))
            }.bind(this));
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
    .v-chip {
        transition: none;
    }

    #is-loading-overlay {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 202;
        cursor: pointer;
    }

    #is-loading-overlay .text, .text {
        position: absolute;
        top: 50%;
        left: 50%;
        font-size: 21px;
        color: white;
        transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
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

    .reverse {
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

    .settings-menu {
        left: 100% !important;
        margin-left: -300px;
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
</style>

