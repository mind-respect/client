<template>
    <form>
        <v-text-field
                v-model="user.username"
                :error-messages="usernameErrors"
                :label="$t('register:username')"
                required
                @input="$v.name.$touch()"
                @blur="$v.name.$touch()"
        ></v-text-field>
        <v-text-field
                v-model="user.email"
                :error-messages="emailErrors"
                :label="$t('register:email')"
                required
                @input="$v.name.$touch()"
                @blur="$v.name.$touch()"
        ></v-text-field>
        <v-text-field
                v-model="user.password"
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
</template>

<script>
    import I18n from '@/i18n'

    export default {
        name: "RegisterForm",
        methods: {
            register: function () {

            }
        },
        data: function () {
            I18n.i18next.addResources("en", "register", {
                username: 'User name (public name)',
                email: 'Email',
                password: 'Password',
                registerBtn: "Register for free"
            });
            I18n.i18next.addResources("fr", "register", {
                username: "Nom d'usager (nom public)",
                email: 'Courriel',
                password: 'Mot de passe',
                registerBtn: "Inscrivez-vous gratuitement"
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
