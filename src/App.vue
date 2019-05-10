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
                    dark
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
                <v-btn :to="'/user/' + $store.state.user.username" v-if="$store.state.user" flat color="primary">
                    <v-icon class="mr-2">
                        filter_center_focus
                    </v-icon>
                    {{$t('centers')}}
                </v-btn>
                <Button :button="zoomOutButton"></Button>
                <Button :button="zoomInButton"></Button>
                <Button :button="createVertexButton" :large="true"></Button>
                <v-menu
                        :nudge-width="250"
                        offset-y
                        content-class="settings-menu"
                        v-if="$store.state.user !== undefined"
                >
                    <v-btn icon light slot="activator" class="mr-2">
                        <v-icon>
                            settings
                        </v-icon>
                    </v-btn>
                    <v-card>
                        <v-list>
                            <v-list-tile @click="switchLanguage()">
                                <v-list-tile-action>
                                    <v-icon class="">public</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title>
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
                                    </v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                            <v-list-tile @click="logout()">
                                <v-list-tile-action>
                                    <v-icon>exit_to_app</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title>
                                        {{$t('logout')}}
                                    </v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                    </v-card>
                </v-menu>
            </v-toolbar>
            <!--<router-link to="/">Home</router-link>-->
            <!--<router-link to="/about">About</router-link>-->
        </div>
        <SideMenu v-if="$route.name === 'Center'"></SideMenu>
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
    import Button from '@/components/graph/Button'
    import AppController from '@/AppController'
    import LoadingFlow from '@/LoadingFlow'
    import Store from '@/store'
    import Vue from 'vue'
    import KeyboardActionsHandler from '@/KeyboardActionsHandler'
    import Search from '@/components/Search'

    const aboutPages = ['register', 'login', 'forgotPassword', 'changePassword'];

    export default {
        components: {
            SideMenu,
            RegisterForm,
            LoginForm,
            ForgotPasswordForm,
            ChangePasswordForm,
            Search,
            Button
        },
        data: function () {
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
                    controller: AppController
                },
                createVertexButton:{
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
            logout: function () {
                Promise.all([
                    AuthenticateService.logout(),
                    this.$store.dispatch('setUser', undefined)
                ]).then(function () {
                    this.$router.push("/")
                }.bind(this));
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
        mounted: function () {
            UserService.authenticatedUser().then(function (response) {
                this.$store.dispatch('setUser', response.data);
                this.dataLoaded = true;
                Vue.nextTick(function () {
                    this.showDialogFromRoute();
                }.bind(this))
            }.bind(this)).catch(function () {
                this.$store.dispatch('setUser', undefined);
                let isOnAboutPage = aboutPages.indexOf(this.$route.name) > -1;
                if (!isOnAboutPage) {
                    this.$router.push("/");
                }
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
                    KeyboardActionsHandler.enable();
                } else {
                    KeyboardActionsHandler.disable();
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
</style>
