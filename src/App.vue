<template>
    <v-app id="app" v-if="dataLoaded">
        <div id="is-loading-overlay" v-if="isLoading">
            <div class="text">
                <v-progress-circular indeterminate color="white"></v-progress-circular>
            </div>
        </div>
        <div id="nav" class="pa-0">
            <v-toolbar
                    app
                    dark
                    color="white"
                    :clipped-left="clipped"
                    :class="{
                        'no-padding' : $vuetify.breakpoint.smAndDown
                    }"
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
                <v-menu
                        :close-on-content-click="false"
                        :nudge-width="250"
                        offset-x
                        offset-y
                        v-if="$store.state.user !== undefined"
                >
                    <v-btn icon light slot="activator">
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
        <router-view></router-view>
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
    import RegisterForm from "./components/home/RegisterForm";
    import ForgotPasswordForm from '@/components/home/ForgotPasswordForm'
    import ChangePasswordForm from '@/components/home/ChangePasswordForm'
    import LoginForm from "./components/home/LoginForm";
    import LoadingFlow from '@/LoadingFlow'
    import Vue from 'vue'


    const aboutPages = ['register', 'login', 'forgotPassword', 'changePassword'];

    export default {
        components: {
            RegisterForm,
            LoginForm,
            ForgotPasswordForm,
            ChangePasswordForm
        },
        data: () => ({
            clipped: false,
            dataLoaded: false,
            registerDialog: false,
            loginDialog: false,
            loadingFlows: LoadingFlow.loadingFlows,
            isLoading: false,
            forgotPasswordDialog: false,
            changePasswordDialog: false
        }),
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
                Vue.nextTick(function(){
                    this.showDialogFromRoute();
                }.bind(this))
            }.bind(this)).catch(function () {
                this.$store.dispatch('setUser', undefined);
                let isOnAboutPage = aboutPages.indexOf(this.$route.name) > -1;
                if (!isOnAboutPage) {
                    this.$router.push("/");
                }
                this.dataLoaded = true;
                Vue.nextTick(function(){
                    this.showDialogFromRoute();
                }.bind(this))
            }.bind(this));
        },
        watch: {
            loadingFlows: function () {
                this.isLoading = this.loadingFlows.length > 0;
            },
            '$route.name': function () {
                if (this.$route.name === 'forgotPassword') {
                    this.forgotPasswordDialog = true;
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
                    this.$refs.registerForm.enter()
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

    .no-padding > .v-toolbar__content {
        padding: 0 !important;
    }
</style>
