<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="removeDialog" v-if="isRemoveFlow" width="600">
        <v-card>
            <v-card-title class="title">
                {{$t('remove:title_prefix')}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="$store.dispatch('setIsRemoveFlow', false)"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0">
                <v-tooltip right class="mr-2" min-width="300" nudge-bottom="20">
                    <v-icon slot="activator" class="ml-2">
                        info
                    </v-icon>
                    <v-list style="background-color:transparent" dark>
                        <v-list-tile>
                            <v-list-tile-action>
                                <v-icon dark>bubble_chart</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>
                                    {{$t("remove:desc2")}}
                                </v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile>
                            <v-list-tile-action>
                                <v-icon dark>search</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>
                                    {{$t("remove:desc3")}}
                                </v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-tooltip>
                <v-list>
                    <v-subheader v-if="multiple">
                        {{$t('remove:multiple')}}
                    </v-subheader>
                    <v-list-tile
                            v-for="bubble in selected"
                            :key="selected.uiId"
                    >
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{bubble.getLabelOrDefault()}}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" class="ml-2">
                    <v-icon class="mr-2">delete</v-icon>
                    {{$t('remove:confirm')}}
                    <span v-if="multiple" class="ml-2">
                        {{$t('remove:multiple_confirm_suffix')}}
                    </span>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                        color="third" dark
                        class="mr-2"
                        @click="$store.dispatch('setIsRemoveFlow', false)"
                >
                    {{$t('remove:cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import SelectionHandler from '@/SelectionHandler'
    import I18n from '@/I18n'

    export default {
        name: "RemoveDialog",
        data: function () {
            I18n.i18next.addResources("en", "remove", {
                "title_prefix": "Remove ",
                "multiple": "All these bubbles",
                "desc1": "Do you really want to remove this?",
                "desc2": "The relations around an erased bubble are also removed.",
                "desc3": "If you choose to remove this and it seems like related bubbles have disapeared, try to look for them in the search bar.",
                "confirm": "Remove",
                "multiple_confirm_suffix": "all",
                "cancel": "Cancel"
            });
            I18n.i18next.addResources("fr", "remove", {
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
                removeDialog: false
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsRemoveFlow", false)
        },
        computed: {
            selected: function () {
                return SelectionHandler.getSelectedElements();
            },
            isRemoveFlow: function () {
                return this.$store.state.isRemoveFlow;
            },
            multiple: function () {
                return this.selected.length > 1;
            }
        },
        watch: {
            isRemoveFlow: function () {
                this.removeDialog = this.$store.state.isRemoveFlow
            },
            removeDialog: function () {
                if (this.removeDialog === false) {
                    this.$store.dispatch("setIsRemoveFlow", false)
                }
            }
        }
    }
</script>

<style scoped>

</style>
