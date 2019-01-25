<template>
    <div>
        <banner></banner>
        <v-layout
                align-center
                row
                justify-center
                class="mb-5 mt-5"
        >
            <v-flex xs12>
                <v-card color="secondary" class="white--text">
                    <v-card-title class="title white--text text-xs-center vh-center">
                        <v-icon class="mr-2 white--text">
                            notifications_active
                        </v-icon>
                        {{$t('about:whatYouDo')}}
                    </v-card-title>
                </v-card>
            </v-flex>
        </v-layout>
        <Level :title="$t('about:level1Title')" :level="1" image="swamp-2248571_1280.jpg">
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
        <Level image="ape-1000270_1280.jpg" :title="$t('about:level2Title')" :level="2">
            <!--https://pixabay.com/fr/singe-dschelada-primates-1000270/-->
            <div slot="description">
                <p class="title">
                    {{$t('about:level2Desc1')}}
                </p>
            </div>
        </Level>
        <Level image="featured_organize_chaos-1068x445.jpg" :title="$t('about:level3Title')" :level="3">
            <!--https://pixabay.com/fr/intelligence-artificielle-cerveau-3382507/-->
            <div slot="description">
                <v-list class="white--text" style="background-color: transparent">
                    <v-list-tile>
                        <v-list-tile-title class="title">
                            <v-icon class="white--text mr-2">search</v-icon>
                            {{$t('about:level3Desc1')}}
                        </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-title class="title">
                            <v-icon class="white--text mr-2">star</v-icon>
                            {{$t('about:level3Desc2')}}
                        </v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </div>
        </Level>
        <Level image="mindmap-2123973_1280.jpg" :title="$t('about:level4Title')" :level="4">
            <div slot="description" class="title">
                <v-list class="white--text" style="background-color: transparent">
                    <v-list-tile>
                        <v-list-tile-title class="title">
                            <v-icon class="white--text mr-2">fa-sitemap</v-icon>
                            {{$t('about:level4Desc1')}}
                        </v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </div>
        </Level>
        <Level image="neurons-440660.jpg" :title="$t('about:level5Title')" :level="5">
            <!--https://www.flickr.com/photos/jjorquera/15433132769-->
            <div slot="description">
                <v-list style="background-color:transparent;" class="white--text">
                    <v-list-tile>
                        <v-list-tile-title class="title">
                            <v-icon dark class="mr-2">
                                fa-balance-scale
                            </v-icon>
                            {{$t('about:level5Desc1')}}
                        </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon dark class="fa-flip-horizontal">
                                keyboard_return
                            </v-icon>
                        </v-list-tile-action>
                        <v-list-tile-title class="title">
                            {{$t('about:level5Desc11')}}
                        </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-title class="title">
                            <v-icon dark class="mr-2">
                                public
                            </v-icon>
                            {{$t('about:level5Desc2')}}
                        </v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile>
                        <v-list-tile-action>
                            <v-icon dark class="fa-flip-horizontal">
                                keyboard_return
                            </v-icon>
                        </v-list-tile-action>
                        <v-list-tile-title class="title">
                            {{$t('about:level5Desc21')}}
                        </v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </div>
        </Level>
        <Level image="dawn-3804124_1280.jpg" :title="$t('about:level6Title')" :level="6">
            <!--https://pixabay.com/fr/dawn-arbres-l-%C3%A9cart-brouillard-3804124/-->
        </Level>
        <!--<v-parallax-->
        <!--dark-->
        <!--src="@/assets/levels/dawn-3804124_1280.jpg"-->
        <!--&gt;-->
        <!--<v-layout row wrap>-->
        <!--<v-flex xs12 md6>-->
        <!--asf-->
        <!--</v-flex>-->
        <!--<v-flex xs12 md6>-->
        <!--<RegisterForm></RegisterForm>-->
        <!--</v-flex>-->
        <!--</v-layout>-->
        <!--</v-parallax>-->
        <v-layout row wrap class="">
            <v-flex xs12 md6 class="vh-center">
                <v-card flat color="secondary" height="100%" class="vh-center">
                    <v-card-title class="text-xs-center white--text vh-center">
                        <h3 class="display-2 text-xs-center">
                            {{$t('about:registerTitle')}}
                        </h3>
                        <div class="title">
                            {{$t('about:registerSubTitle')}}
                        </div>
                    </v-card-title>
                </v-card>
            </v-flex>
            <v-flex xs12 md6>
                <RegisterForm class="mt-2 mb-2"></RegisterForm>
            </v-flex>
        </v-layout>
        <v-footer class="pa-3" dark>
            <v-spacer></v-spacer>
            <v-icon class="fa-flip-horizontal mr-2">copyright</v-icon>
            Copyleft
            <span class="ml-2">Vincent Blouin</span>
            <v-spacer></v-spacer>
            <a href="https://www.facebook.com/mindrespectapp" :small="$vuetify.breakpoint.mdAndDown" class="mr-3 mt-1">
                <img src="https://facebookbrand.com/wp-content/uploads/2016/05/flogo_rgb_hex-brc-site-250.png?w=30&h=30">
            </a>
            <a href="https://github.com/mind-respect">
                <img height="32" width="32" :src="require('@/assets/about/GitHub-Mark-Light-32px.png')" class="mt-1">
            </a>
        </v-footer>
    </div>
</template>

<script>
    import I18n from '@/i18n'
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
                level2Desc1: "You increase the chances that this new idea will take the place it needs",
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
                level6Title: "Like your mind, you act in a coherent and conscious way",
                registerTitle: "Use MindRespect.com",
                registerSubTitle: "Take your notes in a unique way and let your ideas shape your life."
            });
            I18n.i18next.addResources("fr", "about", {
                whatYouDo: 'Que faites vous lorsque vous avez une nouvelle idée ?',
                level1Title: "Vous ne notez pas votre idée",
                level1Desc1: "Une nouvelle idée est telle un petit canal dans votre cerveau.",
                level1Desc2: "Elle s'assèche rapidement si vous ne la revisitez pas de temps en temps.",
                level2Title: 'Vous écrivez votre idée',
                level2Desc1: "Vous augmentez les chances que cette nouvelle idée prenne la place dont elle a besoin",
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
                level6Title: "À l'image de votre esprit, vous agissez de façon cohérente et consciente",
                registerTitle: "Utilisez MindRespect.com",
                registerSubTitle: "Prenez vos notes de façon unique et laissez vos idées modeler votre vie."
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
        }
    }
</script>

<style>
</style>
