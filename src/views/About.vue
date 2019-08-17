<template>
    <div>
        <banner></banner>
        <v-layout
                class="mb-12 mt-12 vh-center"
        >
            <v-flex xs12>
                <v-card color="secondary" class="white--text">
                    <v-card-title class="title white--text text-center vh-center">
                        <v-icon class="mr-2 white--text">
                            notifications_active
                        </v-icon>
                        {{$t('about:whatYouDo')}}
                    </v-card-title>
                </v-card>
            </v-flex>
        </v-layout>
        <Level :title="$t('about:level1Title')" :level="1" image="swamp-2248571_1280_optimized_small.jpg">
            <!--https://pixabay.com/fr/marais-floride-terres-humides-2248571/-->
            <div slot="description">
                <p class="title">
                    {{$t('about:level1Desc1')}}
                </p>
                <p class="title">
                    {{$t('about:level1Desc2')}}
                </p>
            </div>
        </Level>
        <Level :title="$t('about:level2Title')" :level="2" image="plants-2564038_1280_optimized_small.jpg">
            <!--https://pixabay.com/fr/plantes-nature-vert-feuilles-2564038/-->
            <div slot="description">
                <p class="title">
                    {{$t('about:level2Desc1')}}
                </p>
            </div>
        </Level>
        <Level image="organized_chaos_optimized_small.jpg" :title="$t('about:level3Title')" :level="3">
            <!--https://pixabay.com/fr/intelligence-artificielle-cerveau-3382507/-->
            <div slot="description" class="vh-center">
                <v-layout >
                    <v-flex xs0 md2></v-flex>
                    <v-flex xs12 md8>
                        <v-layout  wrap class="white--text title" style="background-color: transparent">
                            <v-flex xs1>
                                <v-icon class="white--text mr-2">search</v-icon>
                            </v-flex>
                            <v-flex xs11 class="mb-6 text-center">
                                {{$t('about:level3Desc1')}}
                            </v-flex>
                            <v-flex xs1>
                                <v-icon class="white--text mr-2">star</v-icon>
                            </v-flex>
                            <v-flex xs11 class="text-center">
                                {{$t('about:level3Desc2')}}
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex xs0 md2></v-flex>
                </v-layout>
                <!--<v-card class="white&#45;&#45;text title" style="background-color: transparent">-->
                <!--<v-card-text>-->
                <!--<v-icon class="white&#45;&#45;text mr-2">search</v-icon>-->
                <!--{{$t('about:level3Desc1')}}-->
                <!--</v-card-text>-->
                <!--<v-card-text>-->
                <!--<v-icon class="white&#45;&#45;text mr-2">star</v-icon>-->
                <!--{{$t('about:level3Desc2')}}-->
                <!--</v-card-text>-->
                <!--</v-card>-->
                <!--<v-list class="white&#45;&#45;text" style="background-color: transparent" two-line dense>-->
                <!--<v-list-item>-->
                <!--<v-list-item-content>-->
                <!--<v-list-item-sub-title class="title white&#45;&#45;text">-->
                <!--<v-icon class="white&#45;&#45;text mr-2">search</v-icon>-->
                <!--{{$t('about:level3Desc1')}}-->
                <!--</v-list-item-sub-title>-->
                <!--</v-list-item-content>-->
                <!--</v-list-item>-->
                <!--<v-list-item>-->
                <!--<v-list-content-content>-->
                <!--<v-list-item-sub-title class="title">-->
                <!--<v-icon class="white&#45;&#45;text mr-2">star</v-icon>-->
                <!--{{$t('about:level3Desc2')}}-->
                <!--</v-list-item-sub-title>-->
                <!--</v-list-content-content>-->
                <!--</v-list-item>-->
                <!--</v-list>-->
            </div>
        </Level>
        <Level image="mindmap_optimized_small.jpg" :title="$t('about:level4Title')" :level="4">
            <div slot="description" class="title">
                <v-layout >
                    <v-flex xs0 sm2 md2></v-flex>
                    <v-flex xs12 sm8 md8>
                        <v-layout  wrap class="white--text title" style="background-color: transparent">
                            <v-flex xs1>
                                <v-icon class="white--text mr-2">fa-sitemap</v-icon>
                            </v-flex>
                            <v-flex xs11 class="mb-6 text-center">
                                {{$t('about:level4Desc1')}}
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex xs0 sm2 md2></v-flex>
                </v-layout>
            </div>
        </Level>
        <Level image="neurons_optimized_small.jpg" :title="$t('about:level5Title')" :level="5">
            <!--https://www.flickr.com/photos/jjorquera/15433132769-->
            <div slot="description">
                <v-layout >
                    <v-flex xs0 sm2 md2 lg3 xl4></v-flex>
                    <v-flex xs12 sm8 md8 lg6 xl4>
                        <v-layout  wrap class="white--text title ml-4" style="background-color: transparent">
                            <v-flex xs1 class="">
                                <v-icon class="white--text mr-2">ac_unit</v-icon>
                            </v-flex>
                            <v-flex xs11 class="mb-6 text-xs-left pl-6">
                                {{$t('about:level5Desc1')}}
                            </v-flex>
                            <v-flex xs1>
                                <v-icon class="white--text mr-2 flip-horizontal">keyboard_return</v-icon>
                            </v-flex>
                            <v-flex xs11 class="mb-6 text-xs-left pl-6">
                                {{$t('about:level5Desc11')}}
                            </v-flex>
                            <v-flex xs1>
                                <v-icon class="white--text mr-2 flip-horizontal">
                                    public
                                </v-icon>
                            </v-flex>
                            <v-flex xs11 class="mb-6 text-xs-left pl-6">
                                {{$t('about:level5Desc2')}}
                            </v-flex>
                            <v-flex xs1>
                                <v-icon class="white--text mr-2 flip-horizontal">
                                    keyboard_return
                                </v-icon>
                            </v-flex>
                            <v-flex xs11 class="mb-6 text-xs-left pl-6">
                                {{$t('about:level5Desc21')}}
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex xs0 sm2 md2 l3 xl4></v-flex>
                </v-layout>
            </div>
        </Level>
        <Level image="dawn-3804124_1280_optimized.jpg" :title="$t('about:level6Title')" :level="6">
            <!--https://pixabay.com/fr/dawn-arbres-l-%C3%A9cart-brouillard-3804124/-->
        </Level>
        <v-layout  wrap class="">
            <v-flex xs12 md6 class="vh-center">
                <v-card flat color="secondary" height="100%" class="vh-center">
                    <v-card-title class="text-center white--text vh-center pr-0 pl-0">
                        <h3 class="display-2 text-center">
                            {{$t('register:title')}}
                        </h3>
                        <div class="title">
                            {{$t('register:subtitle')}}
                        </div>
                    </v-card-title>
                </v-card>
            </v-flex>
            <v-flex xs12 md6 class="mt-12 mb-12">
                <RegisterForm></RegisterForm>
            </v-flex>
        </v-layout>
        <v-footer class="pa-4" dark>
            <v-spacer></v-spacer>
            <v-icon class="flip-horizontal mr-2">copyright</v-icon>
            Copyleft
            <span class="ml-2">Vincent Blouin</span>
            <v-spacer></v-spacer>
            <a href="https://www.facebook.com/mindrespectapp" :small="$vuetify.breakpoint.mdAndDown" class="mr-4 mt-1">
                <img src="https://facebookbrand.com/wp-content/uploads/2016/05/flogo_rgb_hex-brc-site-250.png?w=30&h=30">
            </a>
            <a href="https://github.com/mind-respect">
                <img height="32" width="32" :src="require('@/assets/about/GitHub-Mark-Light-32px.png')" class="mt-1">
            </a>
        </v-footer>
    </div>
</template>

<script>
    import I18n from '@/I18n'
    import Banner from "@/components/home/Banner";
    import Level from "@/components/home/Level"
    import RegisterForm from "@/components/home/RegisterForm"

    export default {
        components: {Banner, Level, RegisterForm},
        data: function () {
            I18n.i18next.addResources("en", "about", {
                whatYouDo: 'What do you do when you have a new idea?',
                level1Title: "You don't write down your idea",
                level1Desc1: "A new idea is like a small stream in your brain.",
                level1Desc2: "It dries quickly if you don't revisit it from time to time.",
                level2Title: 'You write your idea',
                level2Desc1: "You increase the chances that this new idea will become a reality.",
                level2Desc2: "Helps you to memorize your ideas",
                level2Desc3: "Facilitates your thinking",
                level3Title: "You record your idea in a software program",
                level3Desc1: "You quickly find your idea",
                level3Desc2: "You are more organized",
                level4Title: "You write it down in a mind map software",
                level4Desc1: "Your notes are more structured and your idea clearer",
                level5Title: "You write it down in MindRespect.com !",
                level5Desc1: "You are more coherent",
                level5Desc11: "your idea is more linked and integrated",
                level5Desc2: "You are more aware",
                level5Desc21: "you discover the path between your idea and reality",
                level6Title: "Like your mind, you act in a coherent and conscious way"
            });
            I18n.i18next.addResources("fr", "about", {
                whatYouDo: 'Que faites vous lorsque vous avez une nouvelle idée ?',
                level1Title: "Vous ne notez pas votre idée",
                level1Desc1: "Une nouvelle idée est telle un petit canal dans votre cerveau.",
                level1Desc2: "Elle s'assèche rapidement si vous ne la revisitez pas de temps en temps.",
                level2Title: 'Vous écrivez votre idée',
                level2Desc1: "Vous augmentez les chances que cette nouvelle idée devienne une réalité.",
                level2Desc2: "Vous aide à mémoriser vos idées",
                level2Desc3: "Facilite votre réflexion",
                level3Title: "Vous notez votre idée dans un logiciel",
                level3Desc1: "Vous retrouvez rapidement votre idée",
                level3Desc2: "Vous êtes plus organisé",
                level4Title: "Vous la notez dans un logiciel de carte mentale",
                level4Desc1: "Vos notes sont plus structurées et votre idée plus claire",
                level5Title: "Vous la notez dans MindRespect.com !",
                level5Desc1: "Vous êtes plus cohérent",
                level5Desc11: "votre idée est davantage liée et intégrée",
                level5Desc2: "Vous êtes plus conscient",
                level5Desc21: "vous découvrez le chemin entre votre idée et la réalité",
                level6Title: "À l'image de votre esprit, vous agissez de façon cohérente et consciente"
            });
            return {
                noteTakingLevels: [
                    {
                        color: 'red lighten-2',
                        icon: 'not_interested',
                        title: 'level1Title',
                        desc: 'level1Desc'
                    },
                    {
                        color: 'purple darken-1',
                        icon: 'mdi-book-variant'
                    },
                    {
                        color: 'green lighten-1',
                        icon: 'mdi-airballoon'
                    },
                    {
                        color: 'indigo',
                        icon: 'mdi-buffer'
                    }
                ]
            }
        },
        mounted: function () {
            if (this.$store.state.user && this.$route.name === 'home') {
                this.$router.push({
                    name: 'UserHome',
                    params: {
                        username: this.$store.state.user.username
                    }
                })
            }
        }
    }
</script>

<style>
</style>
