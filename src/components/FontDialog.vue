<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="dialog" v-if="isFontFlow" width="900" persistent>
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
            <v-card-text class="">
                <v-autocomplete v-model="font"></v-autocomplete>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" class="ml-2" @click="save" :disabled="font.family === center.getFont().family">
                    <v-icon class="mr-2">save</v-icon>
                    {{$t('save')}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                        color="third" dark
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
    import SubGraph from '@/graph/SubGraph'

    export default {
        name: "FontDialog",
        data: function () {
            I18n.i18next.addResources("en", "font", {
                "title": "Font"
            });
            I18n.i18next.addResources("fr", "font", {
                "title": "Police de caractères"
            });
            return {
                dialog: false,
                note: "",
                editorOptions: {}
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsFontFlow", false)
        },
        computed: {
            center: function () {
                return SubGraph.graph.center;
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
                    console.log(process.env.VUE_APP_FONT_API_KEY_GOOGLE)
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsFontFlow", false)
                }
            }
        },
        methods: {
            save: function () {
                this.center.setFont(
                    this.font
                );
                VertexService.saveFont({
                    family: this.font.family
                }).then(() => {
                    this.dialog = false;
                });
            }
        }
    }
</script>

<style scoped>

</style>
