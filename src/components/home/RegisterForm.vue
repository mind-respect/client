<template>
    <v-card class="mt-5 mb-5" flat color="transparent">
        <v-card-text>
        <form>
            <v-text-field
                    v-model="newUser.newUsername"
                    :error-messages="newUsernameErrors"
                    :label="$t('register:newUsername')"
                    required
                    @input="$v.name.$touch()"
                    @blur="$v.name.$touch()"
            ></v-text-field>
            <v-text-field
                    v-model="newUser.email"
                    :error-messages="emailErrors"
                    :label="$t('register:email')"
                    required
                    @input="$v.name.$touch()"
                    @blur="$v.name.$touch()"
            ></v-text-field>
            <v-text-field
                    v-model="newUser.password"
                    :error-messages="passwordErrors"
                    :label="$t('register:password')"
                    required
                    type="password"
                    @input="$v.name.$touch()"
                    @blur="$v.name.$touch()"
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
                AuthenticateService.register(this.newUser).then(function(){

                });
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
                    newUsername: "",
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
