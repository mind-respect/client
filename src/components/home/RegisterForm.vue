<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card class="" flat color="transparent">
        <v-card-text>
            <v-form ref="registerForm">
                <v-alert
                        :value="robotDoubt"
                        type="error"
                >
                    {{$t('robotDoubt')}}
                </v-alert>
                <v-alert
                        :value="createConflict"
                        type="error"
                >
                    <div v-if="emailAlreadyRegistered">
                        {{$t('register:emailAlreadyRegistered')}}
                    </div>
                    <div v-if="usernameAlreadyRegistered">
                        {{$t('register:usernameAlreadyRegistered')}}
                    </div>
                    <div v-if="invalidUsername">
                        {{$t('register:invalidUsername')}}
                    </div>
                    <div v-if="usernameTooLong">
                        {{$t('register:usernameTooLong')}}
                    </div>
                </v-alert>
                <v-text-field
                        v-model="newUser.username"
                        :error-messages="newUsernameErrors"
                        :label="$t('register:newUsername')"
                        :rules="[Rules.required]"
                        maxlength="30"
                        required
                        v-on:keyup.enter="register"
                ></v-text-field>
                <v-text-field
                        v-model="newUser.email"
                        :error-messages="emailErrors"
                        :label="$t('register:email')"
                        :rules="[Rules.required, Rules.email]"
                        required
                        v-on:keyup.enter="register"
                ></v-text-field>
                <v-text-field
                        v-model="newUser.password"
                        :error-messages="passwordErrors"
                        :label="$t('register:password')"
                        :rules="[Rules.min8Char]"
                        required
                        type="password"
                        v-on:keyup.enter="register"
                ></v-text-field>
                <v-alert type="warning">
                    {{$t('register:warning')}}
                </v-alert>
                <v-btn
                        :disabled="!valid || loading"
                        color="secondary"
                        @click="register"
                        class="ml-0"
                >
                    {{$t('register:registerBtn')}}
                </v-btn>
            </v-form>
        </v-card-text>
        <RecaptchaInfo></RecaptchaInfo>
    </v-card>
</template>

<script>
    import I18n from '@/I18n'
    import AuthenticateService from '@/service/AuthenticateService'
    import Rules from '@/Rules'
    import LoadingFlow from '@/LoadingFlow'
    import Vue from 'vue'
    import IdUri from "../../IdUri";
    import {VueReCaptcha} from "vue-recaptcha-v3";

    Vue.use(VueReCaptcha, {siteKey: process.env.VUE_APP_RECAPTCHA_KEY});

    export default {
        name: "RegisterForm",
        components: {
            RecaptchaInfo: () => import('@/components/home/RecaptchaInfo')
        },
        methods: {
            register: async function () {
                this.createConflict = false;
                this.robotDoubt = false;
                this.emailAlreadyRegistered = false;
                this.usernameAlreadyRegistered = false;
                this.invalidUsername = false;
                this.usernameTooLong = false;
                if (!this.$refs.registerForm.validate()) {
                    return;
                }
                LoadingFlow.enter();
                this.loading = true;
                await this.$store.dispatch('setUser', undefined);
                await this.$store.dispatch('setXsrfToken', IdUri.uuid());
                let recaptchaToken = await this.$recaptcha("register");
                AuthenticateService.register(this.newUser, recaptchaToken).then((response) => {
                    this.$store.dispatch('setUser', response.data);
                    this.$emit('flow-is-done');
                    Vue.nextTick(() => {
                        this.$router.push({
                            name: 'PatternsUserHome'
                        });
                        this.$recaptchaInstance.hideBadge();
                        this.$store.dispatch("setIsFirstTime", true);
                        LoadingFlow.leave();
                        this.loading = false;
                    });
                }).catch((response) => {
                    if (response.response.data.reason === "recaptcha score") {
                        this.robotDoubt = true;
                    } else {
                        response.response.data.forEach((error) => {
                            if ("already_registered_email" === error.reason) {
                                this.emailAlreadyRegistered = true;
                            }
                            if ("user_name_already_registered" === error.reason) {
                                this.usernameAlreadyRegistered = true;
                            }
                            if ("invalid_user_name" === error.reason) {
                                this.invalidUsername = true;
                            }
                            if ("too_long" === error.reason) {
                                this.usernameTooLong = true;
                            }
                        });
                    }
                    this.createConflict = true;
                    this.loading = false;
                    LoadingFlow.leave();
                });
            },
            enter: function () {
                this.newUser = {
                    username: "",
                    email: "",
                    password: ""
                };
                this.createConflict = false;
                this.emailAlreadyRegistered = false;
                this.usernameAlreadyRegistered = false;
                this.invalidUsername = false;
                this.usernameTooLong = false;
                this.$refs.registerForm.reset();
            }
        },
        data: function () {
            I18n.i18next.addResources("en", "register", {
                title: "Use MindRespect.com",
                subtitle: "Take your notes in a unique way and let your ideas shape your life.",
                newUsername: 'Username (public name)',
                email: 'Email',
                password: 'Password',
                registerBtn: "Register for free",
                emailAlreadyRegistered: "Email already registered",
                usernameAlreadyRegistered: "Username already taken",
                invalidUsername: "Username is invalid, it can only contain letters, numbers, underscores and hyphens",
                usernameTooLong: "Username can't exceed 30 characters",
                warning: "The application is under development and for the moment is only optimized for the latest versions of Chrome."
            });
            I18n.i18next.addResources("fr", "register", {
                title: "Utilisez MindRespect.com",
                subtitle: "Prenez vos notes de façon unique et laissez vos idées modeler votre vie.",
                newUsername: "Nom d'usager (nom public)",
                email: 'Courriel',
                password: 'Mot de passe',
                registerBtn: "Inscrivez-vous gratuitement",
                emailAlreadyRegistered: "Courriel déjà enregistré",
                usernameAlreadyRegistered: "Usager est déjà pris",
                invalidUsername: "Le nom d'usager est invalide, il peut contenir des lettres, des nombres, des soulignements (underscores) et des traits d'union",
                usernameTooLong: "Le nom d'usager ne peut excéder 30 caractères",
                warning: "L'application est en développement et pour l'instant n'est optimisé que pour les dernières versions de Chrome"
            });
            return {
                Rules: Rules,
                valid: true,
                loading: false,
                newUser: {
                    username: "",
                    email: "",
                    password: ""
                },
                newUsernameErrors: null,
                emailErrors: null,
                passwordErrors: null,
                createConflict: false,
                usernameAlreadyRegistered: false,
                emailAlreadyRegistered: false,
                invalidUsername: false,
                usernameTooLong: false,
                robotDoubt: false
            };
        },
        mounted: function () {
            // this.$refs.registerForm.enter();
        }
    }
</script>

<style scoped>

</style>
