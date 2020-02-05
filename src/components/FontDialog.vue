<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="dialog" width="900">
        <v-card>
            <v-card-title class="title">
                {{$t('font:title')}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0">
                <v-progress-linear v-if="!fonts" :indeterminate="true" color="secondary"></v-progress-linear>
                <v-autocomplete
                        v-if="fonts"
                        v-model="font"
                        :items="fonts"
                        item-text="family"
                        item-value="family"
                        :menu-props="menuProps"
                        @change="save"
                        cache-items
                        :search-input.sync="searchText"
                        ref="fontAutocomplete"
                        @focus="focus"
                >
                    <template v-slot:selection="{ item, selected }">
                        <img
                                height="14"
                                :src="fontImageBaseUrl + item.familyFormatted + '-400.' + item.version +'.png'">
                    </template>
                    <template v-slot:item="{ item }">
                        <img
                                height="14"
                                :src="fontImageBaseUrl + item.familyFormatted + '-400.' + item.version +'.png'">
                    </template>
                </v-autocomplete>
                <!--                <v-menu>-->
                <!--                    <template v-slot:activator="{ on }">-->
                <!--                        <v-btn-->
                <!--                                color="primary"-->
                <!--                                dark-->
                <!--                                v-on="on"-->
                <!--                        >-->
                <!--                            Dropdown-->
                <!--                        </v-btn>-->
                <!--                    </template>-->
                <!--                    <v-list>-->
                <!--                        <v-list-item-->
                <!--                                v-for="(item, index) in fonts"-->
                <!--                                :key="index"-->
                <!--                                @click=""-->
                <!--                        >-->
                <!--                            <v-list-item-title>-->
                <!--                                <img-->
                <!--                                        height="14"-->
                <!--                                        :src="fontImageBaseUrl + item.familyFormatted + '-400.' + item.version +'.png'">-->
                <!--                            </v-list-item-title>-->
                <!--                        </v-list-item>-->
                <!--                    </v-list>-->
                <!--                </v-menu>-->
                <!--</v-layout>-->
            </v-card-text>
            <v-card flat class="pt-0">
                <v-card-text class="pt-0"></v-card-text>
            </v-card>
            <v-card min-height="150" flat class="pt-0">
            </v-card>
            <v-card-actions>
                <v-btn @click="saveDefault" color="secondary">
                    <v-icon class="mr-2">
                        clear
                    </v-icon>
                    {{$t('font:defaultFont')}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                        text
                        class="mr-2"
                        @click="dialog = false"
                >
                    {{$t('cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import I18n from '@/I18n'
    import VertexService from '@/vertex/VertexService'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'
    import GraphElement from '@/graph-element/GraphElement'
    import AppController from '@/AppController'
    import KeyboardActions from '@/KeyboardActions'

    export default {
        name: "FontDialog",
        data: function () {
            I18n.i18next.addResources("en", "font", {
                "title": "Select a font",
                "defaultFont": "Use default font"
            });
            I18n.i18next.addResources("fr", "font", {
                "title": "Sélectionnez une police de caractères",
                "defaultFont": "Utiliser la police par défaut"
            });
            return {
                dialog: false,
                note: "",
                editorOptions: {},
                font: null,
                fonts: null,
                fontImageBaseUrl: "https://raw.githubusercontent.com/getstencil/GoogleWebFonts-FontFamilyPreviewImages/master/48px/compressed/",
                menuProps: {
                    "contentClass": "font-dialog-menu"
                },
                searchText: null
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsFontFlow", false)
        },
        computed: {
            center: function () {
                return CurrentSubGraph.get().center;
            },
            isFontFlow: function () {
                return this.$store.state.isFontFlow;
            }
        },
        watch: {
            isFontFlow: function () {
                if (this.$store.state.isFontFlow) {
                    this.dialog = true;
                    this.font = this.center.getFont();
                    if (this.fonts === null) {
                        VertexService.listFonts().then((response) => {
                            this.fonts = response.data.items.filter((font) => {
                                return font.variants.some((variant) => {
                                    return variant === "regular";
                                })
                            }).map((font) => {
                                font.familyFormatted = font.family.replace(/ /g, '');
                                return font;
                            })
                        });
                    }
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    KeyboardActions.enable();
                    this.$store.dispatch("setIsFontFlow", false)
                }else{
                    KeyboardActions.disable();
                }
            },
            searchText: function () {
                this.setMenuPosition();
            }
        },
        methods: {
            setMenuPosition: function () {
                const menu = document.getElementsByClassName('font-dialog-menu')[0];
                if (!menu) {
                    return;
                }
                const autocompleteRect = this.$refs.fontAutocomplete.$el.getBoundingClientRect();
                menu.style.left = autocompleteRect.x + "px";
                menu.style.top = (autocompleteRect.y + autocompleteRect.height) + "px";
            },
            save: function () {
                let font = {
                    family: this.font
                };
                this.center.setFont(
                    font
                );
                VertexService.saveFont(
                    CurrentSubGraph.get().center.getUri(),
                    font
                ).then(() => {
                    this.dialog = false;
                });
                AppController.refreshFont(true);
            },
            saveDefault: function () {
                this.font = GraphElement.DEFAULT_FONT.family;
                return this.save();
            },
            focus: function () {
                this.$nextTick(async () => {
                    await this.$nextTick();
                    await this.$nextTick();
                    await this.$nextTick();
                    setTimeout(() => {
                        this.setMenuPosition();
                    }, 100)
                });

            }
        }
    }
</script>

<style>
</style>
