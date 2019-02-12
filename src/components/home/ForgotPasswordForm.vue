<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card class="" flat color="transparent">
        <v-card-text>
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
                <v-btn
                        :disabled="!valid"
                        color="secondary"
                        @click="login"
                        class="ml-0"
                >
                    {{$t('login:loginBtn')}}
                </v-btn>
            </v-form>
        </v-card-text>
    </v-card>
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
            I18n.i18next.addResources("en", "forgot", {
                title: "Send email to change your password",
                email: 'Email'
            });
            I18n.i18next.addResources("fr", "forgot", {
                title: "Envoyer un courriel pour modifier votre mot de passe",
                email: 'Courriel'
            });
            return {
                valid: true,
                user: {
                    email: "",
                    password: ""
                },
                wrongLogin: false,
                Rules: Rules
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
