<template>
    <v-menu
            content-class="settings-menu"
            attach="#app"
            nudge-left="240"
            max-width="300"
            offset-y
            v-if="$store.state.user !== undefined"
            :close-on-content-click="$vuetify.breakpoint.mdAndDown"
    >
        <template v-slot:activator="{ on }">
            <v-btn icon light class="mr-2" v-on="on">
                <v-icon>
                    settings
                </v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item @click="expandAll" :disabled="!canExpandAll"
                         v-if="isGraphRoute">
                <v-list-item-action>
                    <v-icon class="">unfold_more</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('button:expandAll')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="selectAllBubbles" v-if="isGraphRoute">
                <v-list-item-action>
                    <v-icon class="">select_all</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('button:selectAllBubbles')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="fontPicker" v-if="isGraphRoute" :disabled="$store.state.isViewOnly">
                <v-list-item-action>
                    <v-icon class="">font_download</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('button:fontPicker')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="changeBackgroundColorMenu" v-if="isGraphRoute"
                         :disabled="!changeBackgroundColorCanDo()">
                <v-list-item-action>
                    <v-icon class="">format_paint</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('button:changeBackgroundColor')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="listAll" v-if="isGraphRoute">
                <v-list-item-action>
                    <v-icon class="">list</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('button:listAll')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="$emit('enterPatternFlow')"
                         v-if="isGraphRoute && !$store.state.isPatternFlow && !$store.state.isViewOnly">
                <v-list-item-action>
                    <v-icon>stars</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('settings:becomePattern')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="removePattern"
                         v-if="isGraphRoute && $store.state.isPatternFlow && !$store.state.isViewOnly">
                <v-list-item-action>
                    <v-icon>stars</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('settings:removePattern')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="$emit('enterDocsFlow')"
                         v-if="isGraphRoute">
                <v-list-item-action>
                    <v-icon>book</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('settings:documentation')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="switchLanguage()">
                <v-list-item-action>
                    <v-icon class="">public</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
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
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item @click="logout()">
                <v-list-item-action>
                    <v-icon>exit_to_app</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('logout')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
        <input
                id="background-color-picker"
                v-show="false"
                type="color"
                v-model="backgroundColor"
                @change="changeBackgroundColor"
        >
    </v-menu>
</template>

<script>
    import AppController from '@/AppController'
    import GraphController from '@/graph/GraphController'
    import AuthenticateService from "@/service/AuthenticateService";
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import GraphElementService from '@/graph-element/GraphElementService'
    import Color from '@/Color'
    import I18n from '@/I18n'

    export default {
        name: "SettingsMenu",
        components: {
        },
        data: function () {
            I18n.i18next.addResources("en", "settings", {
                becomePattern: "Create pattern",
                removePattern: "Remove the pattern",
                documentation: "Documentation"
            });
            I18n.i18next.addResources("fr", "settings", {
                becomePattern: "Créer un pattern",
                removePattern: "Enlever le pattern",
                documentation: "Documentation"
            });
            return {
                backgroundColor: null
            }
        },
        mounted: function () {
        },
        methods: {
            removePattern: function () {
                AppController.removePattern();
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
                GraphElementService.saveColors({
                    background: this.backgroundColor
                });
                Color.refreshBackgroundColor(this.backgroundColor);
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

<style>

    .settings-menu {
        position: fixed !important;
        right: 0;
    }
</style>