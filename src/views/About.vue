<template>
    <div>
        <banner></banner>
        <v-toolbar
                color="secondary"
                dark
                class="pa-0 mt-4"
        >
            <v-spacer></v-spacer>
            <v-toolbar-title>
                <v-icon class="mr-2">
                    notifications_active
                </v-icon>
                {{$t('about:whatYouDo')}}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <!--<v-btn flat>-->
            <!--<v-icon class="mr-2">play_circle_outline</v-icon>-->
            <!--Voir vidéo-->

            <!--</v-btn>-->
        </v-toolbar>
        <v-container fluid>
            <v-layout row wrap>
                <v-flex xs4 class="mb-2">
                    <v-card class="mr-4">
                        <v-img
                                :src="require('../assets/levels/no-notes-level.jpg')"
                                class="white--text font-weight-bold"
                                aspect-ratio="2.75"
                                gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"
                        >
                            <!--https://pixabay.com/fr/chapeau-la-mode-style-heureux-591973/-->
                            <v-container fill-height fluid>
                            <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                            <span class="headline">{{$t('about:level1Title')}}</span>
                            </v-flex>
                            </v-layout>
                            </v-container>
                        </v-img>
                        <!--<v-card-title class="subheading pb-2">-->
                            <!--{{$t('about:level1Title')}}-->
                            <!--<v-spacer></v-spacer>-->
                            <!--&lt;!&ndash;<small class="">Niveau 0</small>&ndash;&gt;-->
                        <!--</v-card-title>-->
                        <v-card-title class="subheading">
                            {{$t('about:level1Desc')}}
                        </v-card-title>
                        <!--<v-divider></v-divider>-->
                        <!--<v-card-text class="pt-2">-->
                        <!--{{$t('about:level1Desc')}}-->
                        <!--</v-card-text>-->
                    </v-card>
                </v-flex>
                <v-flex xs4>
                    <v-card class="mr-4">
                        <v-img
                                :src="require('../assets/levels/adult-1850177_640.jpg')"
                                class="white--text font-weight-bold"
                                gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"
                                aspect-ratio="2.75"
                        >
                            <!--https://pixabay.com/fr/adulte-journal-intime-journal-1850177/-->
                            <v-container fill-height fluid>
                                <v-layout fill-height>
                                    <v-flex xs12 align-end flexbox>
                                        <span class="headline">{{$t('about:level2Title')}}</span>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-img>
                        <v-card-title class="subheading">
                            <ul>
                                <li>
                                    {{$t('about:level2Desc1')}}
                                </li>
                                <li>
                                    {{$t('about:level2Desc2')}}
                                </li>
                            </ul>
                        </v-card-title>
                    </v-card>
                </v-flex>
                <v-flex xs4>
                    <v-card class="mr-4">
                        <v-img
                                :src="require('../assets/levels/children-593313_640.jpg')"
                                class="white--text"
                                aspect-ratio="2.75"
                                gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"
                        >
                            <!--https://pixabay.com/fr/enfants-win-succ%C3%A8s-jeu-vid%C3%A9o-jouer-593313/-->
                            <v-container fill-height fluid>
                                <v-layout fill-height>
                                    <v-flex xs12 align-end flexbox>
                                        <span class="headline">
                                            {{$t('about:level3Title')}}
                                        </span>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-img>
                        <v-card-title class="subheading">
                            <ul>
                                <li>
                                    {{$t('about:level3Desc1')}}
                                </li>
                                <li>
                                    {{$t('about:level3Desc2')}}
                                </li>
                            </ul>
                        </v-card-title>
                    </v-card>
                </v-flex>
                <v-flex xs4>
                    <v-card class="mr-4">
                        <v-img
                                :src="require('../assets/levels/no-notes-level.jpg')"
                                class="white--text"
                                aspect-ratio="2.75"
                        >
                            <v-container fill-height fluid>
                                <v-layout fill-height>
                                    <v-flex xs12 align-end flexbox>
                                        <span class="headline">Top 10 Australian beaches</span>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-img>
                        <v-card-title>
                            <div>
                                <span class="grey--text">Number 10</span><br>
                                <span>Whitehaven Beach</span><br>
                                <span>Whitsunday Island, Whitsunday Islands</span>
                            </div>
                        </v-card-title>
                    </v-card>
                </v-flex>
                <v-flex xs4>
                    <v-card class="mr-4">
                        <v-img
                                :src="require('../assets/levels/no-notes-level.jpg')"
                                class="white--text"
                                aspect-ratio="2.75"
                        >
                            <v-container fill-height fluid>
                                <v-layout fill-height>
                                    <v-flex xs12 align-end flexbox>
                                        <span class="headline">Top 10 Australian beaches</span>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-img>
                        <v-card-title>
                            <div>
                                <span class="grey--text">Number 10</span><br>
                                <span>Whitehaven Beach</span><br>
                                <span>Whitsunday Island, Whitsunday Islands</span>
                            </div>
                        </v-card-title>
                    </v-card>
                </v-flex>
                <v-flex xs4>
                    <v-card class="mr-4">
                        <v-img
                                :src="require('../assets/levels/no-notes-level.jpg')"
                                class="white--text"
                                aspect-ratio="2.75"
                        >
                            <v-container fill-height fluid>
                                <v-layout fill-height>
                                    <v-flex xs12 align-end flexbox>
                                        <span class="headline">Top 10 Australian beaches</span>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-img>
                        <v-card-title>
                            <div>
                                <span class="grey--text">Number 10</span><br>
                                <span>Whitehaven Beach</span><br>
                                <span>Whitsunday Island, Whitsunday Islands</span>
                            </div>
                        </v-card-title>
                    </v-card>
                </v-flex>
                <!--<v-flex xs12>-->
                <!--<v-card flat class="vh-center">-->
                <!--<iframe width="560" height="315" src="https://www.youtube.com/embed/nK3dSxvRHvc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>-->
                <!--</v-card>-->
                <!--</v-flex>-->
                <!--<v-flex xs12>-->
                <!--<v-timeline align-top>-->
                <!--<v-timeline-item-->
                <!--v-for="(item, i) in noteTakingLevels"-->
                <!--:color="item.color"-->
                <!--:icon="item.icon"-->
                <!--:key="i"-->
                <!--fill-dot-->
                <!--&gt;-->
                <!--<v-card-->
                <!--:color="item.color"-->
                <!--dark-->
                <!--&gt;-->
                <!--<v-card-title class="title">-->
                <!--{{$t('about:' + item.title)}}-->
                <!--</v-card-title>-->
                <!--<v-card-text class="white text&#45;&#45;primary">-->
                <!--<p>-->
                <!--{{$t('about:' + item.desc)}}-->
                <!--</p>-->
                <!--</v-card-text>-->
                <!--</v-card>-->
                <!--</v-timeline-item>-->
                <!--</v-timeline>-->
                <!--</v-flex>-->
                <!--<v-flex xs12 class="timeline-container">-->
                <!--</v-flex>-->
            </v-layout>
        </v-container>
    </div>
</template>

<script>
    import I18n from '@/i18n'
    import Banner from "../components/Banner";

    export default {
        components: {Banner},
        data: function () {
            I18n.i18next.addResources("en", "about", {
                'whatYouDo': 'What are you doing with your thoughts and ideas?',
                level1Title: "You don't write them down",
                level1Desc: "You give yourself up to life to remember or not things that are important to you.",
                level2Title: 'You write them down',
                level2Desc1: "Helps you to memorize your ideas",
                level2Desc2: "Facilitates your thinking",
                level3Title: "You write them down on software",
                level3Desc1: "You quickly find your ideas",
                level3Desc2: "You are better organized"
            });
            I18n.i18next.addResources("fr", "about", {
                'whatYouDo': 'Que faites vous avec vos pensées et vos idées ?',
                level1Title: "Vous ne les notez pas",
                level1Desc: "Vous vous abandonnez à la vie pour vous rappeller ou pas des choses importantes pour vous.",
                level2Title: 'Vous les écrivez',
                level2Desc1: "Vous aide à mémoriser vos idées",
                level2Desc2: "Facilite votre réflexion",
                level3Title: "Vous les notez sur un logiciel",
                level3Desc1: "Vous retrouvez rapidement vos idées",
                level3Desc2: "Vous êtes mieux organisé"
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
