<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        <v-card class="" flat color="transparent">
            <v-card-text class="pb-0">
                <v-form ref="loginForm">
                    <v-alert
                            :value="wrongLogin"
                            type="error"
                    >
                        {{$t('login:wrongLogin')}}
                    </v-alert>
                    <v-text-field
                            v-model="user.email"
                            :label="$t('login:email')"
                            :rules="[Rules.required]"
                            required
                    ></v-text-field>
                    <v-text-field
                            v-model="user.password"
                            :rules="[Rules.required]"
                            required
                            :label="$t('login:password')"
                            type="password"
                    ></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn
                        :disabled="!valid"
                        color="secondary"
                        @click="login"
                        class="ml-1"
                >
                    {{$t('login:loginBtn')}}
                </v-btn>
                <v-spacer></v-spacer>
                <a href="#" @click.prevent="goToForgotPassword()" class="mr-1">
                    {{$t('login:forgotPassword')}}
                </a>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import I18n from '@/I18n'
    import AuthenticateService from '@/service/AuthenticateService'
    import Rules from '@/Rules'
    import LoadingFlow from '@/LoadingFlow'
    import Vue from 'vue'
    import IdUri from "../../IdUri";

    export default {
        name: "LoginForm",
        methods: {
            goToForgotPassword: function () {
                this.$emit('flow-is-done');
                Vue.nextTick(function () {
                    this.$router.push(
                        "/forgot-password"
                    );
                }.bind(this))
            },
            login: async function () {
                this.wrongLogin = false;
                if (!this.$refs.loginForm.validate()) {
                    return;
                }
                LoadingFlow.enter();
                await this.$store.dispatch('setUser', undefined);
                await this.$store.dispatch('setXsrfToken', IdUri.uuid());
                AuthenticateService.login(this.user).then(function (response) {
                    this.$store.dispatch('setUser', response.data);
                    this.$emit('flow-is-done');
                    Vue.nextTick(() => {
                        if (this.$route.params.confirmToken && response.data.user_name === this.$route.params.destinationUsername) {
                            this.$router.push({
                                name: 'ConfirmFriendshipHome',
                                params: {
                                    username: this.$route.params.requestUsername,
                                    requestUsername: this.$route.params.requestUsername,
                                    destinationUsername: this.$route.params.destinationUsername,
                                    confirmToken: this.$route.params.confirmToken

                                }
                            });
                        } else {
                            this.$router.push({
                                name: 'UserHome',
                                params: {
                                    username: response.data.user_name
                                }
                            });
                        }
                        LoadingFlow.leave();
                    });
                }.bind(this)).catch(function () {
                    this.wrongLogin = true;
                    LoadingFlow.leave();
                }.bind(this));
            },
            enter: function () {
                this.wrongLogin = false;
                this.user = {
                    email: "",
                    password: ""
                };
                this.$refs.loginForm.reset();
            }
        },
        data: function () {
            I18n.i18next.addResources("en", "login", {
                title: "Mindrespect.com",
                email: 'Email',
                password: 'Password',
                loginBtn: "Login",
                wrongLogin: "Not right email or password, try again.",
                forgotPassword: "Forgot password"
            });
            I18n.i18next.addResources("fr", "login", {
                title: "Mindrespect.com",
                email: 'Courriel',
                password: 'Mot de passe',
                loginBtn: "Connecter",
                wrongLogin: "Pas le bon courriel ou mot de passe, essayez de nouveau.",
                forgotPassword: "Mot de passe oublié",
            });
            return {
                valid: true,
                user: {
                    email: "",
                    password: ""
                },
                wrongLogin: false,
                Rules: Rules,
                forgotPasswordDialog: false
            };
        },
        mounted: function () {
            // this.$refs.loginForm.enter();
        }
    }
</script>

<style scoped>

</style>
