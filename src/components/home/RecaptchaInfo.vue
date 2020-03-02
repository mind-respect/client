<template>
    <v-card-subtitle>
        {{$t('recaptchaInfo:text1')}}
        <a href="https://policies.google.com/privacy" class="grey--text">{{$t('recaptchaInfo:text2')}}</a>
        {{$t('recaptchaInfo:text3')}}
        <a href="https://policies.google.com/terms" class="grey--text">{{$t('recaptchaInfo:text4')}}</a>
        {{$t('recaptchaInfo:text5')}}.
    </v-card-subtitle>
</template>

<script>
    import I18n from "../../I18n";

    export default {
        name: "RecaptchaInfo",
        data: function () {
            I18n.i18next.addResources("en", "recaptchaInfo", {
                text1: "This form is protected by reCAPTCHA and the Google",
                text2: "Privacy Policy",
                text3: "and",
                text4: "Terms of Service",
                text5: "apply"
            });
            I18n.i18next.addResources("fr", "recaptchaInfo", {
                text1: "Ce formulaire est protégé par reCAPTCHA de Google et leurs",
                text2: "Politique de confidentialité",
                text3: "et",
                text4: "Conditions d'utilisation",
                text5: "s'appliquent"
            });
            return {};
        }
    }
</script>

<style scoped>

</style>