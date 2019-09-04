<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card class="" flat color="transparent">
        <v-card-text>
            <v-form ref="resetPasswordForm">
                <v-alert
                        :value="resetPasswordError"
                        type="error"
                >
                    {{$t('forgot:forgotPasswordError')}}
                </v-alert>
                <v-alert
                        :value="resetPasswordSent"
                        type="success"
                >
                    {{$t('forgot:resetPasswordSent')}}
                </v-alert>
                <v-text-field
                        v-model="email"
                        :label="$t('login:email')"
                        :rules="[Rules.required]"
                        required
                ></v-text-field>
                <v-btn color="secondary" @click="resetPassword()" :disabled="waiting">
                    {{$t('send')}}
                </v-btn>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
    import I18n from '@/I18n'
    import Rules from '@/Rules'
    import LoadingFlow from '@/LoadingFlow'
    import UserService from '@/service/UserService'

    export default {
        name: "ForgotPasswordForm",
        methods: {
            resetPassword: function () {
                this.resetPasswordError = false;
                this.resetPasswordSent = false;
                if (!this.$refs.resetPasswordForm.validate()) {
                    return;
                }
                LoadingFlow.enter();
                this.waiting = true;
                UserService.resetPassword(
                    this.email
                ).then(function () {
                    LoadingFlow.leave();
                    this.resetPasswordSent = true;
                    this.waiting = false;
                }.bind(this)).catch(function () {
                    this.resetPasswordError = true;
                    LoadingFlow.leave();
                    this.waiting = false;
                }.bind(this));
            },
            enter: function () {
                this.email = "";
                this.resetPasswordSent = false;
                this.resetPasswordError = false;
                this.waiting = false;
                this.resetPasswordEmail = false;
                this.$refs.resetPasswordForm.reset();
            }
        },
        data: function () {
            I18n.i18next.addResources("en", "forgot", {
                title: "Send email to change your password",
                email: 'Email',
                forgotPassword: "Forgot password",
                forgotTitle: "Forgotten password",
                resetPasswordSent: "The instructions to change your password were sent to you by email",
                forgotPasswordError: "No account is related to this email"
            });
            I18n.i18next.addResources("fr", "forgot", {
                title: "Envoyer un courriel pour modifier votre mot de passe",
                email: 'Courriel',
                forgotPassword: "Mot de passe oublié",
                forgotTitle: "Mot de passe oublié",
                resetPasswordSent: "Les instructions pour modifier votre mot de passe vous ont été envoyé par courriel",
                forgotPasswordError: "Aucun compte n'est relié à ce courriel"
            });
            return {
                valid: true,
                email: "",
                Rules: Rules,
                resetPasswordSent: false,
                resetPasswordError: false,
                waiting: false,
                resetPasswordEmail: false
            };
        },
        mounted: function () {
            // this.$refs.forgotPasswordForm.enter();
        }
    }
</script>

<style scoped>

</style>
