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
        <!--<v-toolbar-->
                <!--color="secondary"-->
                <!--dark-->
                <!--class="pa-0 mt-4 mb-5"-->
                <!--extended-->
        <!--&gt;-->
            <!--<v-spacer></v-spacer>-->
            <!--<v-toolbar-title>-->
                <!--<v-icon class="mr-2">-->
                    <!--notifications_active-->
                <!--</v-icon>-->
                <!--{{$t('about:whatYouDo')}}-->
            <!--</v-toolbar-title>-->
            <!--<v-spacer></v-spacer>-->
            <!--&lt;!&ndash;<v-btn flat>&ndash;&gt;-->
            <!--&lt;!&ndash;<v-icon class="mr-2">play_circle_outline</v-icon>&ndash;&gt;-->
            <!--&lt;!&ndash;Voir vidéo&ndash;&gt;-->

            <!--&lt;!&ndash;</v-btn>&ndash;&gt;-->
        <!--</v-toolbar>-->
        <h3 class="text-xs-center mb-5">
            <v-badge color="secondary" left :class="{
                'ml-4': $vuetify.breakpoint.smAndDown
            }">
                <span slot="badge">1</span>
                <span class="headline">{{$t('about:level1Title')}}</span>
            </v-badge>
            <div class="text-xs-center subheading mt-3 mb-3">
                <p class="title">
                    {{$t('about:level1Desc1')}}
                </p>
                <p class="title">
                    {{$t('about:level1Desc2')}}
                </p>
            </div>
        </h3>
        <v-parallax :src="require('../assets/levels/swamp-2248571_1280.jpg')"
                    :height="stepsParallaxHeight"></v-parallax>
        <!--https://pixabay.com/fr/marais-floride-terres-humides-2248571/-->
        <h3 class="text-xs-center mb-5 mt-5">
            <v-badge color="secondary" left :class="{
                'ml-4': $vuetify.breakpoint.smAndDown
            }">
                <span slot="badge">2</span>
                <span class="headline">{{$t('about:level2Title')}}</span>
            </v-badge>
            <v-layout row wrap class="text-xs-center vh-center subheading mt-3">
                <v-flex xs12>
                    <p class="title">
                        {{$t('about:level2Desc1')}}
                    </p>
                </v-flex>
                <!--<v-flex xs12 class="vh-center">-->
                <!--<ul class="text-xs-left ml-5">-->
                <!--<li style="max-width: 400px;">-->
                <!--{{$t('about:level2Desc1')}}-->
                <!--</li>-->
                <!--<li>-->
                <!--{{$t('about:level2Desc2')}}-->
                <!--</li>-->
                <!--<li>-->
                <!--{{$t('about:level2Desc3')}}-->
                <!--</li>-->
                <!--</ul>-->
                <!--</v-flex>-->
            </v-layout>
        </h3>
        <v-parallax :src="require('../assets/levels/ape-1000270_1280.jpg')" :height="stepsParallaxHeight"></v-parallax>
        <!--https://pixabay.com/fr/singe-dschelada-primates-1000270/-->
        <h3 class="text-xs-center mb-5 mt-5">
            <v-badge color="secondary" left :class="{
                'ml-4': $vuetify.breakpoint.smAndDown
            }">
                <span slot="badge">3</span>
                <span class="headline">{{$t('about:level3Title')}}</span>
            </v-badge>
            <div class="text-xs-center vh-center subheading mt-3">
                <ul class="text-xs-left ml-5 title">
                    <li>
                        {{$t('about:level3Desc1')}}
                    </li>
                    <li>
                        {{$t('about:level3Desc2')}}
                    </li>
                </ul>
            </div>
        </h3>
        <v-img :src="require('../assets/levels/featured_organize_chaos-1068x445.jpg')"
               :height="stepsParallaxHeight"></v-img>
        <!--https://pixabay.com/fr/intelligence-artificielle-cerveau-3382507/-->
        <h3 class="text-xs-center mb-5 mt-5">
            <v-badge color="secondary" left :class="{
                'ml-4': $vuetify.breakpoint.smAndDown
            }">
                <span slot="badge">4</span>
                <span class="headline">{{$t('about:level4Title')}}</span>
            </v-badge>
            <div class="text-xs-center vh-center mt-3 title">
                {{$t('about:level4Desc1')}}
            </div>
        </h3>
        <!--<v-parallax :src="require('../assets/levels/pipes-refactored.jpg')" height="600"></v-parallax>-->
        <v-img :src="require('../assets/levels/mindmap-2123973_1280.jpg')" :height="stepsParallaxHeight"
               id="mrLevel"></v-img>
        <!--https://www.flickr.com/photos/jjorquera/15433132769-->
        <h3 class="text-xs-center mb-5 mt-5">
            <v-badge color="secondary" left :class="{
                'ml-4': $vuetify.breakpoint.smAndDown
            }">
                <span slot="badge">5</span>
                <span class="headline">{{$t('about:level5Title')}}</span>
            </v-badge>
            <div class="text-xs-center vh-center subheading mt-3">
                <ul class="text-xs-left ml-5 title">
                    <li>
                        {{$t('about:level5Desc1')}}
                    </li>
                    <li>
                        {{$t('about:level5Desc2')}}
                    </li>
                    <li>
                        {{$t('about:level5Desc3')}}
                    </li>
                </ul>
            </div>
        </h3>
        <v-parallax :src="require('../assets/levels/neurons-440660.jpg')" :height="stepsParallaxHeight"></v-parallax>
        <h3 class="text-xs-center mb-5 mt-5">
            <v-badge color="secondary" left :class="{
                'ml-4': $vuetify.breakpoint.smAndDown
            }">
                <span slot="badge">6</span>
                <span class="headline">{{$t('about:level6Title')}}</span>
            </v-badge>
        </h3>
        <!--https://pixabay.com/fr/singe-dschelada-primates-1000270/-->
        <!--<v-container fluid>-->
        <!--<v-layout row wrap>-->
        <!--<v-flex xs12 sm6 lg4 class="mb-2">-->
        <!--<v-card :class="{-->
        <!--'mr-4': $vuetify.breakpoint.smAndUp-->
        <!--}">-->
        <!--<v-img-->
        <!--:src="require('../assets/levels/no-notes-level.jpg')"-->
        <!--class="white&#45;&#45;text font-weight-bold"-->
        <!--aspect-ratio="2.75"-->
        <!--gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"-->
        <!--&gt;-->
        <!--&lt;!&ndash;https://pixabay.com/fr/chapeau-la-mode-style-heureux-591973/&ndash;&gt;-->
        <!--<v-container fill-height fluid>-->
        <!--<v-layout fill-height>-->
        <!--<v-flex xs12 class="text-xs-center">-->
        <!--<v-badge color="secondary" left>-->
        <!--<span slot="badge">1</span>-->
        <!--<span class="headline">{{$t('about:level1Title')}}</span>-->
        <!--</v-badge>-->
        <!--</v-flex>-->
        <!--</v-layout>-->
        <!--</v-container>-->
        <!--</v-img>-->
        <!--&lt;!&ndash;<v-card-title class="subheading pb-2">&ndash;&gt;-->
        <!--&lt;!&ndash;{{$t('about:level1Title')}}&ndash;&gt;-->
        <!--&lt;!&ndash;<v-spacer></v-spacer>&ndash;&gt;-->
        <!--&lt;!&ndash;&lt;!&ndash;<small class="">Niveau 0</small>&ndash;&gt;&ndash;&gt;-->
        <!--&lt;!&ndash;</v-card-title>&ndash;&gt;-->
        <!--<v-card-title class="subheading">-->
        <!--{{$t('about:level1Desc')}}-->
        <!--</v-card-title>-->
        <!--&lt;!&ndash;<v-divider></v-divider>&ndash;&gt;-->
        <!--&lt;!&ndash;<v-card-text class="pt-2">&ndash;&gt;-->
        <!--&lt;!&ndash;{{$t('about:level1Desc')}}&ndash;&gt;-->
        <!--&lt;!&ndash;</v-card-text>&ndash;&gt;-->
        <!--</v-card>-->
        <!--</v-flex>-->
        <!--<v-flex xs12 sm6 lg4>-->
        <!--<v-card :class="{-->
        <!--'mr-4': $vuetify.breakpoint.smAndUp-->
        <!--}">-->
        <!--<v-img-->
        <!--:src="require('../assets/levels/adult-1850177_640.jpg')"-->
        <!--class="white&#45;&#45;text font-weight-bold"-->
        <!--gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"-->
        <!--aspect-ratio="2.75"-->
        <!--&gt;-->
        <!--&lt;!&ndash;https://pixabay.com/fr/adulte-journal-intime-journal-1850177/&ndash;&gt;-->
        <!--<v-container fill-height fluid>-->
        <!--<v-layout fill-height>-->
        <!--<v-flex xs12 class="text-xs-center">-->
        <!--<v-badge color="secondary" left>-->
        <!--<span slot="badge" class="pa-0 ma-0">2</span>-->
        <!--<span class="headline">{{$t('about:level2Title')}}</span>-->
        <!--</v-badge>-->

        <!--</v-flex>-->
        <!--</v-layout>-->
        <!--</v-container>-->
        <!--</v-img>-->
        <!--<v-card-title class="subheading">-->
        <!--<ul>-->
        <!--<li>-->
        <!--{{$t('about:level2Desc1')}}-->
        <!--</li>-->
        <!--<li>-->
        <!--{{$t('about:level2Desc2')}}-->
        <!--</li>-->
        <!--</ul>-->
        <!--</v-card-title>-->
        <!--</v-card>-->
        <!--</v-flex>-->
        <!--<v-flex xs12 sm6 lg4>-->
        <!--<v-card :class="{-->
        <!--'mr-4': $vuetify.breakpoint.smAndUp-->
        <!--}">-->
        <!--<v-img-->
        <!--:src="require('../assets/levels/children-593313_640.jpg')"-->
        <!--class="white&#45;&#45;text"-->
        <!--aspect-ratio="2.75"-->
        <!--gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"-->
        <!--&gt;-->
        <!--&lt;!&ndash;https://pixabay.com/fr/enfants-win-succ%C3%A8s-jeu-vid%C3%A9o-jouer-593313/&ndash;&gt;-->
        <!--<v-container fill-height fluid>-->
        <!--<v-layout fill-height>-->
        <!--<v-flex xs12 class="text-xs-center vh-center">-->
        <!--<v-badge color="secondary" left>-->
        <!--<span slot="badge" class="pa-0 ma-0">3</span>-->
        <!--<span class="headline">-->
        <!--{{$t('about:level3Title')}}-->
        <!--</span>-->
        <!--</v-badge>-->
        <!--</v-flex>-->
        <!--</v-layout>-->
        <!--</v-container>-->
        <!--</v-img>-->
        <!--<v-card-title class="subheading">-->
        <!--<ul>-->
        <!--<li>-->
        <!--{{$t('about:level3Desc1')}}-->
        <!--</li>-->
        <!--<li>-->
        <!--{{$t('about:level3Desc2')}}-->
        <!--</li>-->
        <!--</ul>-->
        <!--</v-card-title>-->
        <!--</v-card>-->
        <!--</v-flex>-->
        <!--<v-flex xs12 sm6 lg4>-->
        <!--<v-card :class="{-->
        <!--'mr-4': $vuetify.breakpoint.smAndUp-->
        <!--}">-->
        <!--<v-img-->
        <!--:src="require('../assets/levels/mindmap-2123973_640.jpg')"-->
        <!--class="white&#45;&#45;text"-->
        <!--aspect-ratio="2.75"-->
        <!--gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"-->
        <!--&gt;-->
        <!--&lt;!&ndash;https://pixabay.com/fr/mindmap-remue-m%C3%A9ninges-id%C3%A9e-2123973/&ndash;&gt;-->
        <!--<v-container fill-height fluid>-->
        <!--<v-layout fill-height>-->
        <!--<v-flex xs12 align-end flexbox>-->
        <!--<span class="headline">-->
        <!--<v-badge color="secondary" left>-->
        <!--<span slot="badge" class="pa-0 ma-0">4</span>-->
        <!--{{$t('about:level4Title')}}-->
        <!--</v-badge>-->
        <!--</span>-->
        <!--</v-flex>-->
        <!--</v-layout>-->
        <!--</v-container>-->
        <!--</v-img>-->
        <!--<v-card-title class="subheading">-->
        <!--{{$t('about:level4Desc1')}}-->
        <!--</v-card-title>-->
        <!--</v-card>-->
        <!--</v-flex>-->
        <!--<v-flex xs12 sm6 lg4>-->
        <!--<v-card :class="{-->
        <!--'mr-4': $vuetify.breakpoint.smAndUp-->
        <!--}">-->
        <!--<v-img-->
        <!--:src="require('../assets/levels/level-5-feature-square-250.jpg')"-->
        <!--class="white&#45;&#45;text"-->
        <!--aspect-ratio="2.75"-->
        <!--gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"-->
        <!--&gt;-->
        <!--<v-container fill-height fluid>-->
        <!--<v-layout fill-height>-->
        <!--<v-flex xs12 class="text-xs-center">-->
        <!--<v-badge color="secondary" left class="headline">-->
        <!--<span slot="badge" class="pa-0 ma-0">5</span>-->
        <!--{{$t('about:level5Title')}}-->
        <!--</v-badge>-->
        <!--</v-flex>-->
        <!--</v-layout>-->
        <!--</v-container>-->
        <!--</v-img>-->
        <!--<v-card-title class="subheading">-->
        <!--<ul>-->
        <!--<li>-->
        <!--{{$t('about:level5Desc1')}}-->
        <!--</li>-->
        <!--<li>-->
        <!--{{$t('about:level5Desc2')}}-->
        <!--</li>-->
        <!--</ul>-->
        <!--</v-card-title>-->
        <!--</v-card>-->
        <!--</v-flex>-->
        <!--<v-flex xs12 sm6 lg4>-->
        <!--<v-card :class="{-->
        <!--'mr-4': $vuetify.breakpoint.smAndUp-->
        <!--}">-->
        <!--<v-img-->
        <!--:src="require('../assets/levels/no-notes-level.jpg')"-->
        <!--class="white&#45;&#45;text"-->
        <!--aspect-ratio="2.75"-->
        <!--&gt;-->
        <!--<v-container fill-height fluid>-->
        <!--<v-layout fill-height>-->
        <!--<v-flex xs12 align-end flexbox>-->
        <!--<span class="headline">Top 10 Australian beaches</span>-->
        <!--</v-flex>-->
        <!--</v-layout>-->
        <!--</v-container>-->
        <!--</v-img>-->
        <!--<v-card-title>-->
        <!--<div>-->
        <!--<span class="grey&#45;&#45;text">Number 10</span><br>-->
        <!--<span>Whitehaven Beach</span><br>-->
        <!--<span>Whitsunday Island, Whitsunday Islands</span>-->
        <!--</div>-->
        <!--</v-card-title>-->
        <!--</v-card>-->
        <!--</v-flex>-->
        <!--&lt;!&ndash;<v-flex xs12>&ndash;&gt;-->
        <!--&lt;!&ndash;<v-card flat class="vh-center">&ndash;&gt;-->
        <!--&lt;!&ndash;<iframe width="560" height="315" src="https://www.youtube.com/embed/nK3dSxvRHvc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>&ndash;&gt;-->
        <!--&lt;!&ndash;</v-card>&ndash;&gt;-->
        <!--&lt;!&ndash;</v-flex>&ndash;&gt;-->
        <!--&lt;!&ndash;<v-flex xs12>&ndash;&gt;-->
        <!--&lt;!&ndash;<v-timeline align-top>&ndash;&gt;-->
        <!--&lt;!&ndash;<v-timeline-item&ndash;&gt;-->
        <!--&lt;!&ndash;v-for="(item, i) in noteTakingLevels"&ndash;&gt;-->
        <!--&lt;!&ndash;:color="item.color"&ndash;&gt;-->
        <!--&lt;!&ndash;:icon="item.icon"&ndash;&gt;-->
        <!--&lt;!&ndash;:key="i"&ndash;&gt;-->
        <!--&lt;!&ndash;fill-dot&ndash;&gt;-->
        <!--&lt;!&ndash;&gt;&ndash;&gt;-->
        <!--&lt;!&ndash;<v-card&ndash;&gt;-->
        <!--&lt;!&ndash;:color="item.color"&ndash;&gt;-->
        <!--&lt;!&ndash;dark&ndash;&gt;-->
        <!--&lt;!&ndash;&gt;&ndash;&gt;-->
        <!--&lt;!&ndash;<v-card-title class="title">&ndash;&gt;-->
        <!--&lt;!&ndash;{{$t('about:' + item.title)}}&ndash;&gt;-->
        <!--&lt;!&ndash;</v-card-title>&ndash;&gt;-->
        <!--&lt;!&ndash;<v-card-text class="white text&#45;&#45;primary">&ndash;&gt;-->
        <!--&lt;!&ndash;<p>&ndash;&gt;-->
        <!--&lt;!&ndash;{{$t('about:' + item.desc)}}&ndash;&gt;-->
        <!--&lt;!&ndash;</p>&ndash;&gt;-->
        <!--&lt;!&ndash;</v-card-text>&ndash;&gt;-->
        <!--&lt;!&ndash;</v-card>&ndash;&gt;-->
        <!--&lt;!&ndash;</v-timeline-item>&ndash;&gt;-->
        <!--&lt;!&ndash;</v-timeline>&ndash;&gt;-->
        <!--&lt;!&ndash;</v-flex>&ndash;&gt;-->
        <!--&lt;!&ndash;<v-flex xs12 class="timeline-container">&ndash;&gt;-->
        <!--&lt;!&ndash;</v-flex>&ndash;&gt;-->
        <!--</v-layout>-->
        <!--</v-container>-->

    </div>
</template>

<script>
    import I18n from '@/i18n'
    import Banner from "../components/Banner";

    export default {
        components: {Banner},
        data: function () {
            I18n.i18next.addResources("en", "about", {
                whatYouDo: 'What are you doing with your thoughts and ideas?',
                level1Title: "You don't write them down",
                level1Desc: "You give yourself up to life to remember or not things that are important to you.",
                level2Title: 'You write them down',
                level2Desc1: "Helps you to memorize your ideas",
                level2Desc2: "Facilitates your thinking",
                level3Title: "You write them down on software",
                level3Desc1: "You quickly find your ideas",
                level3Desc2: "You are better organized",
                level4Title: "You use a mind mapping software",
                level4Desc1: "Makes your thoughts clearer and your notes more structured",
                level5Title: "You use MindRespect.com!",
                level5Desc1: "Evolves your perspectives by creating more links between your current and past reflections",
                level5Desc2: "Same benefits as mind mapping and note-taking software",
            });
            I18n.i18next.addResources("fr", "about", {
                whatYouDo: 'Que faites vous lorsque vous avez une nouvelle idée ?',
                level1Title: "Vous ne notez pas votre idée",
                level1Desc1: "Une nouvelle idée est telle un petit canal dans votre cerveau.",
                level1Desc2: "Elle s'assèche rapidement si vous ne la revisitez pas de temps en temps.",
                level1DescOld: "Vous vous abandonnez à la vie pour vous rappeller ou pas des choses importantes pour vous.",
                level2Title: 'Vous écrivez votre idée',
                level2Desc1: "Vous augmentez les chances que cette nouvelle idée prenne la place dont elle a besoin",
                level2Desc2: "Vous aide à mémoriser vos idées",
                level2Desc3: "Facilite votre réflexion",
                level3Title: "Vous noté votre idée dans un logiciel",
                level3Desc1: "Vous retrouvez rapidement votre idée",
                level3Desc2: "Vous êtes plus organisé",
                level4Title: "Vous la noté dans un logiciel de carte mentale",
                level4Desc1: "Vos notes sont plus structurées et votre idée plus claire",
                level5Title: "Vous la noté dans MindRespect.com !",
                level5Desc1: "Vous êtes plus cohérent → votre idée est davantage liés avec vos autres idées",
                level5Desc2: "Vous êtes plus conscient → vous découvrez le chemin entre votre idée et la réalité",
                level5Desc3: "Vous avez tous les avantages des niveaux précédents",
                level6Title: "Ayez une meilleure vie, ayez un meilleur monde !",
                level6Desc1: "Lorem ipsum"
            });
            return {
                stepsParallaxHeight: 300,
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
