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
            <v-list-item v-if="$store.state.user && $vuetify.breakpoint.mdAndDown"
                         :to="'/user/' + $store.state.user.username" :disabled="$route.name === 'UserHome'">
                <v-list-item-action>
                    <v-icon>
                        filter_center_focus
                    </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('centers')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="isGraphRoute && $vuetify.breakpoint.mdAndDown" @click="zoomOut">
                <v-list-item-action>
                    <v-icon>zoom_out</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('button:zoomOut')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="isGraphRoute && $vuetify.breakpoint.mdAndDown" @click="zoomIn">
                <v-list-item-action>
                    <v-icon>zoom_in</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('button:zoomIn')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="$store.state.user && $vuetify.breakpoint.mdAndDown" @click="createVertex">
                <v-list-item-action>
                    <v-icon color="third">add</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('button:createVertex')}}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
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
            <v-list-item @click="enterPatternFlow"
                         v-if="isGraphRoute && !$store.state.isPatternFlow && !$store.state.isViewOnly">
                <v-list-item-action>
                    <v-icon>stars</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{$t('side:becomePattern')}}
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
                        {{$t('side:removePattern')}}
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
        <v-dialog v-model="patternDialog" width="600">
            <v-card>
                <v-card-title>
                    {{$t('areYouSure')}}
                    <v-spacer></v-spacer>
                    <v-btn @click="patternDialog=false" icon>
                        <v-icon>
                            close
                        </v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="body-1">
                    <p>
                        {{$t('side:patternInfo')}}
                    </p>
                    <p>
                        {{$t('side:patternInfo2')}}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="becomeAPattern" :loading="makePatternLoading" :disabled="makePatternLoading"
                           color="secondary">
                        <v-icon class="mr-2">
                            stars
                        </v-icon>
                        {{$t('side:makeAPattern')}}
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click="patternDialog=false" text>
                        {{$t('cancel')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-menu>
</template>

<script>
    import AppController from '@/AppController'
    import GraphController from '@/graph/GraphController'
    import AuthenticateService from "@/service/AuthenticateService";
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import VertexService from '@/vertex/VertexService'
    import Color from '@/Color'
    import I18n from '@/I18n'

    export default {
        name: "SettingsMenu",
        component: {
            Button: () => import('@/components/graph/Button')
        },
        data: function () {
            I18n.i18next.addResources("en", "side", {
                becomePattern: "Create pattern",
                removePattern: "Remove the pattern",
                makeAPattern: "Make this map a pattern",
                patternInfo: "Other users will be able to copy this map and use it as a starting point to add their own ideas.",
                patternInfo2: "All bubbles on this card will be public."
            });
            I18n.i18next.addResources("fr", "side", {
                becomePattern: "Créer un pattern",
                removePattern: "Enlever le pattern",
                makeAPattern: "Faire de cette carte un pattern",
                patternInfo: "D'autres usagers pourront copier cette carte et l'utiliser comme point de départ pour y ajouter leurs propres idées.",
                patternInfo2: "Toutes les bulles de cette cartes seront publiques."
            });
            return {
                backgroundColor: null,
                zoomInButton: {
                    action: "zoomIn",
                    icon: "zoom_in",
                    ctrlShortcut: "&plus;",
                    controller: AppController
                },
                zoomOutButton: {
                    action: "zoomOut",
                    icon: "zoom_out",
                    ctrlShortcut: "&minus;",
                    controller: AppController,
                    disableNotHide: true
                },
                patternDialog: false,
                makePatternLoading: false
            }
        },
        mounted: function () {
        },
        methods: {
            becomeAPattern: function () {
                this.makePatternLoading = true;
                AppController.becomeAPattern().then(() => {
                    CurrentSubGraph.get().getVertices().forEach((vertex) => {
                        vertex.makePublic();
                        vertex.refreshButtons();
                    });
                    this.patternDialog = false;
                    this.makePatternLoading = false;
                })
            },
            removePattern: function () {
                AppController.removePattern();
            },
            enterPatternFlow: function () {
                this.patternDialog = true;
            },
            zoomIn: function () {
                AppController.zoomIn();
            },
            zoomOut: function () {
                AppController.zoomOut();
            },
            createVertex: function () {
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
        right:0;
    }
</style>