<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card class="" flat color="transparent">
        <v-card-text>
            <v-form ref="changePasswordForm">
                <v-alert
                        :value="changePasswordSuccess"
                        type="success"
                >
                    {{$t('password:success')}}
                </v-alert>
                <v-alert
                        :value="changePasswordError"
                        type="error"
                >
                    {{$t('password:expired')}}
                </v-alert>
                <v-text-field
                        v-model="newPassword"
                        :label="$t('password:newPassword')"
                        :rules="[Rules.min8Char, Rules.required]"
                        type="password"
                ></v-text-field>
                <v-text-field
                        v-model="repeatPassword"
                        :label="$t('password:repeat')"
                        :rules="[Rules.min8Char, Rules.required]"
                        type="password"
                ></v-text-field>
                <v-btn color="secondary" @click="changePassword()" :disabled="waiting" class="ml-0">
                    {{$t('change')}}
                </v-btn>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
    import I18n from '@/I18n'
    import UserService from '@/service/UserService'
    import Rules from '@/Rules'

    export default {
        name: "ChangePasswordForm",
        data: function () {
            I18n.i18next.addResources("en", "password", {
                title: "Send email to change your password",
                success: "Password changed",
                newPassword: "New password",
                repeat: "Retype password",
                expired: "You can no longer change your password using this link, please make a new request."
            });
            I18n.i18next.addResources("fr", "password", {
                title: "Modification de mot de passe",
                success: "Mot de passe modifié",
                newPassword: "Nouveau mot de passe",
                repeat: "Répéter le mot de passe",
                expired: "Vous ne pouvez plus modifier votre mot de passe à l'aide de ce lien, veuillez faire une nouvelle demande."
            });
            return {
                valid: true,
                newPassword: "",
                repeatPassword: "",
                Rules: Rules,
                changePasswordSuccess: false,
                changePasswordError: false,
                waiting: false
            };
        },
        methods: {
            enter: function () {
                this.newPassword = "";
                this.repeatPassword = "";
                this.changePasswordSuccess = false;
                this.changePasswordError = false;
            },
            changePassword: function () {
                this.changePasswordSuccess = false;
                this.changePasswordError = false;
                if (!this.$refs.changePasswordForm.validate()) {
                    return;
                }
                this.waiting = true;
                UserService.changePassword(
                    this.newPassword,
                    this.$route.params.email,
                    this.$route.params.changePasswordToken
                ).then(function () {
                    this.changePasswordSuccess = true;
                }.bind(this)).catch(function () {
                    this.changePasswordError = true;
                    this.waiting = false;
                }.bind(this))
            }
        }
    }
</script>

<style scoped>

</style>
