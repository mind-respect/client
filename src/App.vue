<template>
    <v-app id="app">
        <div id="nav">
            <v-toolbar
                    app
                    dark
                    color="white"
                    :clipped-left="clipped"
            >
                <v-toolbar-title>
                    <router-link to="/welcome" class="no-style-link vh-center">
                        <v-img
                                :src="require('./assets/logo-horizontal-black-small.png')"
                                height="44"
                                width="223"
                        ></v-img>
                    </router-link>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn flat light>
                    {{$t('login')}}
                </v-btn>
                <v-btn flat light>
                    {{$t('register')}}
                </v-btn>
                <v-btn light flat @click="switchLanguage()">
                    <v-icon class="mr-2">public</v-icon>
                    <span v-if="$store.state.locale.toLowerCase() === 'fr'">
                        English
                    </span>
                    <span v-if="$store.state.locale.toLowerCase() === 'en'">
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
    .mr-title{
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
</style>
