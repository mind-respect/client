<template>

    <v-parallax
            dark
            :src="require('../assets/neurons-dark.jpg')"
            height="459"
    >
        <v-layout
                align-center
                column
                justify-center
        >
            <h1 class="display-2 font-weight-thin mt-4 mb-3 white--text font-weight-bold mr-title"
                style="font-size: 55px !important;">
                {{$t('banner:slogan')}}
            </h1>
            <h4 class="subheading white--text font-weight-bold">
                {{$t('banner:desc')}}
            </h4>
        </v-layout>
    </v-parallax>
</template>

<script>
    import I18n from '@/i18n'

    export default {
        name: 'banner',
        data: function () {
            I18n.i18next.addResources("en", "banner", {
                'slogan': 'The best place for your ideas',
                'desc': 'A note-taking application that makes them constantly evolve'
            });
            I18n.i18next.addResources("fr", "banner", {
                'slogan': 'Le meilleur endroit pour vos idées',
                'desc': "Une application de prise de note qui les fait évoluer constamment"
            });
            return {};
        }
    }
</script>
