<template>
    <v-menu
            lazy
            :nudge-width="250"
            offset-y
            content-class="settings-menu"
            v-if="$store.state.user !== undefined"
            :close-on-content-click="$vuetify.breakpoint.mdAndDown"
    >
        <v-btn icon light slot="activator" class="mr-2">
            <v-icon>
                settings
            </v-icon>
        </v-btn>
        <v-card>
            <v-list>
                <v-list-tile v-if="$store.state.user && $vuetify.breakpoint.mdAndDown" :to="'/user/' + $store.state.user.username" :disabled="$route.name === 'UserHome'">
                    <v-list-tile-action>
                        <v-icon>
                            filter_center_focus
                        </v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{$t('centers')}}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-if="$store.state.user && isGraphRoute && $vuetify.breakpoint.mdAndDown" @click="createVertex">
                    <v-list-tile-action>
                        <v-icon>add</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{$t('button:createVertex')}}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="expandAll" :disabled="!canExpandAll"
                             v-if="isGraphRoute && $store.state.dragged === null">
                    <v-list-tile-action>
                        <v-icon class="">unfold_more</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{$t('button:expandAll')}}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="selectAllBubbles" v-if="isGraphRoute">
                    <v-list-tile-action>
                        <v-icon class="">select_all</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{$t('button:selectAllBubbles')}}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="fontPicker" v-if="isGraphRoute">
                    <v-list-tile-action>
                        <v-icon class="">font_download</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{$t('button:fontPicker')}}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="changeBackgroundColorMenu" v-if="isGraphRoute"
                             :disabled="!changeBackgroundColorCanDo()">
                    <v-list-tile-action>
                        <v-icon class="">format_paint</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{$t('button:changeBackgroundColor')}}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="listAll" v-if="isGraphRoute">
                    <v-list-tile-action>
                        <v-icon class="">list</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{$t('button:listAll')}}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="switchLanguage()">
                    <v-list-tile-action>
                        <v-icon class="">public</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
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
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile @click="logout()">
                    <v-list-tile-action>
                        <v-icon>exit_to_app</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>
                            {{$t('logout')}}
                        </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
            <input
                    id="background-color-picker"
                    v-show="false"
                    type="color"
                    v-model="backgroundColor"
                    @change="changeBackgroundColor"
            >
        </v-card>
    </v-menu>
</template>

<script>
    import AppController from '@/AppController'
    import GraphController from '@/graph/GraphController'
    import AuthenticateService from "@/service/AuthenticateService";
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import VertexService from '@/vertex/VertexService'
    import Color from '@/Color'

    export default {
        name: "SettingsMenu",
        data: function () {
            return {
                backgroundColor: null
            }
        },
        mounted: function () {
        },
        methods: {
            createVertex:function(){
                AppController.createVertex();
            },
            expandAll: function () {
                GraphController.expandAll();
            },
            selectAllBubbles: function () {
                GraphController.selectAllBubbles();
            },
            fontPicker: function () {
                AppController.fontPicker();
            },
            changeBackgroundColorMenu: function () {
                this.backgroundColor = CurrentSubGraph.get().center.getBackgroundColor();
                this.$nextTick(() => {
                    document.getElementById(
                        "background-color-picker"
                    ).click();
                });
            },
            changeBackgroundColorCanDo: function () {
                return AppController.changeBackgroundColorCanDo();
            },
            changeBackgroundColor: function () {
                CurrentSubGraph.get().center.setBackgroundColor(this.backgroundColor);
                VertexService.saveColors({
                    background: this.backgroundColor
                });
                Color.refreshBackgroundColor();
            },
            listAll: function () {
                AppController.listAll();
            },
            switchLanguage: function () {
                let newLocale = this.$store.state.locale === "en" ? "fr" : "en";
                this.$store.dispatch('setLocale', newLocale);
            },
            logout: function () {
                Promise.all([
                    AuthenticateService.logout(),
                    this.$store.dispatch('setUser', undefined)
                ]).then(function () {
                    this.$router.push("/")
                }.bind(this));
            }
        },
        computed: {
            isGraphRoute: function () {
                return this.$route.name === "Center"
            },
            canExpandAll: function () {
                return GraphController.expandAllCanDo();
            }
        }
    }
</script>

<style scoped>

</style>