<template>
    <v-app id="app">
        <div id="nav" class="pa-0">
            <v-toolbar
                    app
                    dark
                    color="white"
                    :clipped-left="clipped"
                    :class="{
                        'no-padding' : $vuetify.breakpoint.smAndDown
                    }"
            >
                <v-toolbar-title>
                    <router-link to="/welcome" class="no-style-link vh-center">
                        <v-img
                                :src="require('@/assets/logo-horizontal-black-small.png')"
                                height="44"
                                width="223"
                                alt="mindrespect.com"
                                v-if="$vuetify.breakpoint.mdAndUp"
                        ></v-img>
                        <v-img
                                :src="require('@/assets/MR.png')"
                                height="35"
                                width="51"
                                alt="MR"
                                class="mt-1 ml-3"
                                v-if="$vuetify.breakpoint.smAndDown"
                        ></v-img>
                    </router-link>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <!--<v-text-field-->
                <!--light-->
                <!--:placeholder="$t('search')"-->
                <!--append-icon="search"-->
                <!--v-if="$vuetify.breakpoint.mdAndUp"-->
                <!--&gt;</v-text-field>-->
                <v-btn flat light :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }">
                    {{$t('login')}}
                </v-btn>
                <v-btn flat light :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }">
                    {{$t('register')}}
                </v-btn>
                <v-btn light flat @click="switchLanguage()" :class="{
                    'ma-1 pa-1' : $vuetify.breakpoint.smAndDown
                }">
                    <v-icon class="mr-2 pa-0">public</v-icon>
                    <span v-if="$store.state.locale.toLowerCase() === 'fr' && $vuetify.breakpoint.smAndDown">
                        EN
                    </span>
                    <span v-if="$store.state.locale.toLowerCase() === 'fr' && $vuetify.breakpoint.mdAndUp">
                        English
                    </span>
                    <span v-if="$store.state.locale.toLowerCase() === 'en' && $vuetify.breakpoint.smAndDown">
                        FR
                    </span>
                    <span v-if="$store.state.locale.toLowerCase() === 'en' && $vuetify.breakpoint.mdAndUp">
                        Français
                    </span>
                </v-btn>
            </v-toolbar>
            <!--<router-link to="/">Home</router-link>-->
            <!--<router-link to="/about">About</router-link>-->
        </div>
        <router-view></router-view>
    </v-app>
</template>

<script>
    export default {
        data: () => ({
            clipped: false
        }),
        methods: {
            switchLanguage: function () {
                let newLocale = this.$store.state.locale === "en" ? "fr" : "en";
                this.$store.dispatch('setLocale', newLocale);
            }
        }
    }
</script>

<style>
    .mr-title {
        font-family: 'Dancing Script', cursive !important;
        font-size: 35px;
        font-weight: bold;
    }

    a.no-style-link {
        color: white;
        text-decoration: none;
    }

    .vh-center {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .no-padding > .v-toolbar__content {
        padding: 0 !important;
    }
</style>
