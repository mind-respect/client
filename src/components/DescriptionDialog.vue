<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="dialog" v-if="isDescriptionFlow" width="600">
        <v-card>
            <v-card-title class="title">
                {{bubble.getLabel()}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0">
                <vue-editor v-model="bubble.getFriendlyJson().comment"></vue-editor>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" class="ml-2" @click="save">
                    <v-icon class="mr-2">delete</v-icon>
                    {{$t('save')}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                        color="third" dark
                        class="mr-2"
                        @click="dialog = false"
                >
                    {{$t('desc:cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import {VueEditor} from 'vue2-editor'
    import SelectionHandler from '@/SelectionHandler'
    import I18n from '@/I18n'
    import GraphElementService from '@/graph-element/GraphElementService'

    export default {
        name: "DescriptionDialog",
        components: {
            VueEditor
        },
        data: function () {
            I18n.i18next.addResources("en", "desc", {
                "title_prefix": "Remove ",
                "multiple": "All these bubbles",
                "desc1": "Do you really want to remove this?",
                "desc2": "The relations around an erased bubble are also removed.",
                "desc3": "If you choose to remove this and it seems like related bubbles have disapeared, try to look for them in the search bar.",
                "confirm": "Remove",
                "multiple_confirm_suffix": "all",
                "cancel": "Cancel"
            });
            I18n.i18next.addResources("fr", "desc", {
                "title_prefix": "Effacer ",
                "multiple": "Toutes ces bulles",
                "desc1": "Voulez-vous vraiment effacer ça?",
                "desc2": "Les relations autour des bulles seront également effacées.",
                "desc3": "Si des bulles semblent avoir disparues, retrouvez les dans la barre de recherche.",
                "confirm": "Effacer",
                "multiple_confirm_suffix": "tout",
                "cancel": "Annuler"
            });
            return {
                dialog: false
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsDescriptionFlow", false)
        },
        computed: {
            bubble: function () {
                return SelectionHandler.getSingle();
            },
            isDescriptionFlow: function () {
                return this.$store.state.isDescriptionFlow;
            }
        },
        watch: {
            isDescriptionFlow: function () {
                if (this.$store.state.isDescriptionFlow) {
                    let selectedIsPristine = SelectionHandler.getSelectedElements().every(function (bubble) {
                        return bubble.isPristine();
                    });
                    if (selectedIsPristine) {
                        this.remove();
                        this.$store.dispatch("setIsDescriptionFlow", false)
                    } else {
                        this.dialog = true;
                    }
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsDescriptionFlow", false)
                }
            }
        },
        methods: {
            save: function () {
                GraphElementService.updateNote(
                    this.bubble
                ).then(function () {
                    this.dialog = false;
                }.bind(this))
            }
        }
    }
</script>

<style scoped>

</style>
