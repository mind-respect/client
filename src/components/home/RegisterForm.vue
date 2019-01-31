<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card class="mt-5 mb-5" flat color="transparent">
        <v-card-text>
            <form>
                <v-text-field
                        v-model="newUser.username"
                        :error-messages="newUsernameErrors"
                        :label="$t('register:newUsername')"
                        required
                ></v-text-field>
                <v-text-field
                        v-model="newUser.email"
                        :error-messages="emailErrors"
                        :label="$t('register:email')"
                        required
                ></v-text-field>
                <v-text-field
                        v-model="newUser.password"
                        :error-messages="passwordErrors"
                        :label="$t('register:password')"
                        required
                        type="password"
                ></v-text-field>
                <v-btn
                        :disabled="!valid"
                        color="secondary"
                        @click="register"
                >
                    {{$t('register:registerBtn')}}
                </v-btn>
            </form>
        </v-card-text>
    </v-card>
</template>

<script>
    import I18n from '@/i18n'
    import AuthenticateService from '@/service/AuthenticateService'

    export default {
        name: "RegisterForm",
        methods: {
            register: function () {
                AuthenticateService.register(this.newUser).then(function (response) {
                    this.$store.dispatch('setUser', response.data)
                    this.$router.push({
                        name: 'UserHome',
                        params: {
                            username: response.data.user_name
                        }
                    })
                }.bind(this));
            }
        },
        data: function () {
            I18n.i18next.addResources("en", "register", {
                newUsername: 'newUser name (public name)',
                email: 'Email',
                password: 'Password',
                registerBtn: "Register for free"
            });
            I18n.i18next.addResources("fr", "register", {
                newUsername: "Nom d'usager (nom public)",
                email: 'Courriel',
                password: 'Mot de passe',
                registerBtn: "Inscrivez-vous gratuitement"
            });
            return {
                valid: true,
                newUser: {
                    username: "",
                    email: "",
                    password: ""
                },
                newUsernameErrors: null,
                emailErrors: null,
                passwordErrors: null
            };
        }
    }
</script>

<style scoped>

</style>
