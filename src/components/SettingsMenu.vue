<template>
    <v-menu
            :nudge-width="250"
            offset-y
            fixed
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
            <v-list-item @click="fontPicker" v-if="isGraphRoute">
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
    import VertexService from '@/vertex/VertexService'
    import Color from '@/Color'

    export default {
        name: "SettingsMenu",
        component: {
            Button: () => import('@/components/graph/Button')
        },
        data: function () {
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
                }
            }
        },
        mounted: function () {
        },
        methods: {
            zoomIn: function () {
                AppController.zoomIn();
            },
            zoomOut: function (event) {
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