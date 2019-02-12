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
                <a href="#" @click.prevent="forgotPasswordDialog = false" class="mr-1">
                    {{$t('login:forgotPassword')}}
                </a>
            </v-card-actions>
        </v-card>
        <v-dialog v-model="forgotPasswordDialog" width="900">
            <v-card>
                <v-card-title class="pb-0">
                    <h3 class="title">
                        {{$t('forgot:title')}}
                    </h3>
                    <v-spacer></v-spacer>
                    <v-icon @click="leaveDialog('forgotPasswordDialog')">close</v-icon>
                </v-card-title>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import I18n from '@/I18n'
    import AuthenticateService from '@/service/AuthenticateService'
    import Rules from '@/Rules'
    import LoadingFlow from '@/LoadingFlow'

    export default {
        name: "LoginForm",
        methods: {
            login: function () {
                this.wrongLogin = false;
                if (!this.$refs.loginForm.validate()) {
                    return;
                }
                LoadingFlow.enter();
                AuthenticateService.login(this.user).then(function (response) {
                    this.$store.dispatch('setUser', response.data)
                    this.$router.push({
                        name: 'UserHome',
                        params: {
                            username: response.data.user_name
                        }
                    });
                    this.$emit('flow-is-done');
                    LoadingFlow.leave();
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
                forgotPassword: "Mot de passe oublié"
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
            this.isWrongLogin = false;
            this.user = {
                email: "",
                password: ""
            }
        }
    }
</script>

<style scoped>

</style>
