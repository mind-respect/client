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
                            lightbulb_outline
                        </v-icon>
                        {{$t('about:whatYouDo')}}
                    </v-card-title>
                </v-card>
            </v-flex>
        </v-layout>
        <Level :title="$t('about:level1Title')" :level="1" image="swamp-2248571_1280_optimized_small.jpg">
            <!--https://pixabay.com/fr/marais-floride-terres-humides-2248571/-->
            <div slot="description">
                <p class="title mb-0 white--text">
                    {{$t('about:level1Desc1')}}
                </p>
                <p class="subtitle-1">
                    {{$t('about:level1Desc2')}}
                </p>
            </div>
        </Level>
        <Level :title="$t('about:level2Title')" :level="2" image="plants-2564038_1280_optimized_small.jpg">
            <!--https://pixabay.com/fr/plantes-nature-vert-feuilles-2564038/-->
            <div slot="description">
                <p class="title white--text">
                    {{$t('about:level2Desc1')}}
                </p>
            </div>
        </Level>
        <Level image="organized_chaos_optimized_small.jpg" :title="$t('about:level3Title')" :level="3">
            <!--https://pixabay.com/fr/intelligence-artificielle-cerveau-3382507/-->
            <div slot="description" class="vh-center">
                <p class="title white--text">
                    {{$t('about:level3Desc1')}}
                </p>
            </div>
        </Level>
        <Level image="mindmap_optimized_small.jpg" :title="$t('about:level4Title')" :level="4">
            <div slot="description">
                <p class="title white--text mb-0">
                    {{$t('about:level4Desc1')}}
                </p>
                <p class="subtitle-1 mt-0">
                    {{$t('about:level4Desc11')}}
                </p>
            </div>
        </Level>
        <Level image="neurons_optimized_small.jpg" :title="$t('about:level5Title')" :level="5">
            <!--https://www.flickr.com/photos/jjorquera/15433132769-->
            <div slot="description">
                <v-list color="primary" three-line dark>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="title">
                                {{$t('about:level5Desc1')}}
                                <v-list-item-subtitle class="subtitle-1">
                                    {{$t('about:level5Desc11')}}
                                </v-list-item-subtitle>
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="title">
                                {{$t('about:level5Desc2')}}
                                <v-list-item-subtitle class="subtitle-1">
                                    {{$t('about:level5Desc21')}}
                                </v-list-item-subtitle>
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </div>
        </Level>
        <Level image="dawn-3804124_1280_optimized.jpg" :title="$t('about:level6Title')" :level="6">
            <!--https://pixabay.com/fr/dawn-arbres-l-%C3%A9cart-brouillard-3804124/-->
        </Level>
        <v-layout wrap class="" v-if="!$store.state.user">
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
                level3Desc1: "Because you find your ideas quickly, you consult them more often and you are more aware of them.",
                level4Title: "You write it down in a mind map software",
                level4Desc1: "Your notes are more structured and your idea clearer",
                level4Desc11: "The mindmap format honours both content and structure.",
                level5Title: "You write it down in MindRespect.com !",
                level5Desc1: "You are more coherent",
                level5Desc11: "Your idea is more linked and integrated",
                level5Desc2: "You are more aware",
                level5Desc21: "You discover the path between your idea and reality",
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
                level3Desc1: "Parce que vous retrouvez rapidement vos idées, vous les consulter plus souvent et vous en êtes plus conscient",
                level4Title: "Vous la notez dans un logiciel de carte mentale",
                level4Desc1: "Vos notes sont plus structurées et votre idée plus claire",
                level4Desc11: "Le format carte mentale ou mindmap, honore autant le contenu que la structure",
                level5Title: "Vous la notez dans MindRespect.com !",
                level5Desc1: "Vous êtes plus cohérent",
                level5Desc11: "Votre idée est davantage liée et intégrée",
                level5Desc2: "Vous êtes plus conscient",
                level5Desc21: "Vous découvrez le chemin entre votre idée et la réalité",
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
            } else {
                document.scrollingElement.scrollTop = 0;
            }
        }
    }
</script>

<style>
</style>
