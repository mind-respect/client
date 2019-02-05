<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card class="" flat color="transparent">
        <v-card-text>
            <form>
                <v-text-field
                        v-model="user.email"
                        :error-messages="emailErrors"
                        required
                        :label="$t('login:email')"
                        required
                ></v-text-field>
                <v-text-field
                        v-model="user.password"
                        required
                        :error-messages="passwordErrors"
                        :label="$t('login:password')"
                        required
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
            </form>
        </v-card-text>
    </v-card>
</template>

<script>
    import I18n from '@/I18n'
    import AuthenticateService from '@/service/AuthenticateService'

    export default {
        name: "LoginForm",
        methods: {
            login: function () {
                AuthenticateService.login(this.user).then(function (response) {
                    this.$store.dispatch('setUser', response.data)
                    this.$router.push({
                        name: 'UserHome',
                        params: {
                            username: response.data.user_name
                        }
                    });
                    this.$emit('flow-is-done')
                }.bind(this));
            }
        },
        data: function () {
            I18n.i18next.addResources("en", "login", {
                title: "Mindrespect.com",
                email: 'Email',
                password: 'Password',
                loginBtn: "Login",
            });
            I18n.i18next.addResources("fr", "login", {
                title: "Mindrespect.com",
                email: 'Courriel',
                password: 'Mot de passe',
                loginBtn: "Connecter"
            });
            return {
                valid: true,
                user: {
                    username: "",
                    email: "",
                    password: ""
                },
                usernameErrors: null,
                emailErrors: null,
                passwordErrors: null
            };
        }
    }
</script>

<style scoped>

</style>
