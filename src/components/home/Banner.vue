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
          <h1 class="text-h3 white--text font-weight-light mt-6 text-center"
              style="font-size: 40px !important; ">
            {{ $t('banner:slogan') }}
          </h1>
        </v-card-title>
        <v-card-title class="vh-center">
          <h4 class="text-subtitle-1 white--text font-weight-bold text-center">
            {{ $t('banner:desc') }}
            <!--                        <a href="#" @click.prevent="Scroll.goToSection('mrLevel')" class="white&#45;&#45;text">-->
            {{ $t('banner:desc2') }}
            <!--                        </a>-->
            {{ $t('banner:desc3') }}
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
      slogan: 'Structure your notes, evolve your thinking',
      slogan2: 'Map your truth',
      slogan3: 'For ideas that are structured and in motion',
      desc: 'Mindrespect.com is a',
      desc2: 'unique way',
      desc3: 'to take notes'
    });
    // 'slogan': 'Le meilleur endroit pour vos idées',
    I18n.i18next.addResources("fr", "banner", {
      slogan: 'Structure vos notes, fait évoluer votre pensée',
      slogan2: 'Map your truth',
      slogan3: 'Pour des idées structurées et en mouvement',
      desc: "Mindrespect.com est un",
      desc2: "logiciel unique",
      desc3: "de prise de notes"
    });
    return {
      Scroll: Scroll
    };
  }
}
</script>
