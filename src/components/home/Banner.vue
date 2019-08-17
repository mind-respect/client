<template>
    <v-parallax
            dark
            :src="require('@/assets/about/levels/personal-3286016_1280_optimized.jpg')"
            height="459"
    >
        <!--https://pixabay.com/fr/personnels-collective-groupe-savoir-3286016/-->
        <v-layout
                align-center
                column
                justify-center
        >
            <v-card style="background-color:black;">
                <v-card-title class="pt-0 pb-0 vh-center">
                    <h1 class="display-2 white--text font-weight-light mt-6 text-center"
                        style="font-size: 40px !important; ">
                        {{$t('banner:slogan')}}
                    </h1>
                </v-card-title>
                <v-card-title class="vh-center">
                    <h4 class="subtitle-1 white--text font-weight-bold text-center">
                        {{$t('banner:desc')}}
<!--                        <a href="#" @click.prevent="Scroll.goToSection('mrLevel')" class="white&#45;&#45;text">-->
                            {{$t('banner:desc2')}}
<!--                        </a>-->
                        {{$t('banner:desc3')}}
                    </h4>
                </v-card-title>
            </v-card>
        </v-layout>
    </v-parallax>
</template>

<script>
    import I18n from '@/I18n'
    import Scroll from '@/Scroll'

    export default {
        name: 'banner',
        data: function () {
            I18n.i18next.addResources("en", "banner", {
                'slogan': 'Structure your notes, make your thinking evolve',
                desc: 'Mindrespect.com is a',
                desc2: 'unique way',
                desc3: 'to take notes'
            });
            // 'slogan': 'Le meilleur endroit pour vos idées',
            I18n.i18next.addResources("fr", "banner", {
                'slogan': 'Structure vos notes, fait évoluer votre pensée',
                desc: "Mindrespect.com est une",
                desc2: "façon unique",
                desc3: "de prendre ses notes"
            });
            return {
                Scroll: Scroll
            };
        }
    }
</script>
