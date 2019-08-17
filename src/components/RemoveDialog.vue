<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="removeDialog" v-if="isRemoveFlow" width="600" id="removeDialog">
        <v-card>
            <v-card-title class="title">
                {{$t('remove:title_prefix')}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="removeDialog = false"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0 pb-0">
                <v-list>
                    <v-subheader v-if="$store.state.selected.length > 1 && false">
                        {{$t('remove:multiple')}}
                    </v-subheader>
                    <v-list-item
                            v-for="bubble in selected"
                            :key="bubble.uiId"
                    >
                        <v-list-item-content>
                            <v-list-item-title :class="{
                                'cannot-remove': !canRemove(bubble)
                            }">
                                {{bubble.getLabelOrDefault()}}
                            </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action v-if="!bubble.canRemove">
                            <v-icon>
                                error
                            </v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-text v-if="someCannotBeRemoved" class="pt-0">
                <v-icon class="mr-2">error</v-icon>
                {{$t('remove:cannotRemove')}}
            </v-card-text>
            <v-card-actions>
                <form @submit.prevent="remove">
                    <input type="text" ref="enterRemoveInput" autofocus style="width:0">
                    <v-btn color="secondary" class="ml-2" @click="remove" type="submit" :disabled="!isThereSomethingToRemove">
                        <v-icon class="mr-2">delete</v-icon>
                        {{$t('remove:confirm')}}
                        <span v-if="$store.state.selected.length > 1" class="ml-2">
                            {{$t('remove:multiple_confirm_suffix')}}
                        </span>
                    </v-btn>
                </form>
                <v-spacer></v-spacer>
                <v-btn
                        text
                        class="mr-2"
                        @click="removeDialog = false"
                >
                    {{$t('remove:cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import Selection from '@/Selection'
    import I18n from '@/I18n'
    import GraphElement from '@/graph-element/GraphElement'

    export default {
        name: "RemoveDialog",
        data: function () {
            I18n.i18next.addResources("en", "remove", {
                title_prefix: "Remove ",
                multiple: "All these bubbles",
                desc1: "Do you really want to remove this?",
                desc2: "The relations around an erased bubble are also removed.",
                desc3: "If you choose to remove this and it seems like related bubbles have disapeared, try to look for them in the search bar.",
                confirm: "Remove",
                multiple_confirm_suffix: "all",
                cancel: "Cancel",
                cannotRemove: "A bubble must no longer have children to be erased. However, you can delete the relationships between the bubbles at any time."
            });
            I18n.i18next.addResources("fr", "remove", {
                title_prefix: "Effacer ",
                multiple: "Toutes ces bulles",
                desc1: "Voulez-vous vraiment effacer ça?",
                desc2: "Les relations autour des bulles seront également effacées.",
                desc3: "Si des bulles semblent avoir disparues, retrouvez les dans la barre de recherche.",
                confirm: "Effacer",
                multiple_confirm_suffix: "tout",
                cancel: "Annuler",
                cannotRemove: "Une bulle ne doit plus avoir d'enfants pour être effacée. Par contre, vous pouvez en tout temps effacer les relations entre les bulles."
            });
            return {
                removeDialog: false,
                selected: null,
                isThereSomethingToRemove:null,
                someCannotBeRemoved:null
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsRemoveFlow", false)
        },
        computed: {
            isRemoveFlow: function () {
                return this.$store.state.isRemoveFlow;
            }
        },
        watch: {
            isRemoveFlow: function () {
                if (this.$store.state.isRemoveFlow) {
                    this.someCannotBeRemoved = false;
                    this.selected = Selection.getSelectedElements().map((selected) => {
                        selected.selectedToRemove = true;
                        return selected;
                    }).map((selected) => {
                        /*
                        * using another "map" to define selected.canRemove
                        * because it needs selectedToRemove needs to be defined on all selection
                        */
                        selected.canRemove = this.canRemove(selected);
                        return selected;
                    });
                    this.isThereSomethingToRemove = this.selected.some((selected)=>{
                        return selected.canRemove;
                    });
                    this.someCannotBeRemoved = this.selected.some((selected)=>{
                        return !selected.canRemove;
                    });
                    this.removeDialog = true;
                    if (this.$vuetify.breakpoint.lgAndUp) {
                        this.$nextTick(() => {
                            const element = this.$refs.enterRemoveInput;
                            this.$nextTick(() => {
                                element.focus()
                            });
                        });
                    }
                } else {
                    if(this.selected){
                        this.selected.forEach((selected) => {
                            selected.selectedToRemove = false;
                        });
                    }
                    this.removeDialog = false;
                }
            },
            removeDialog: function () {
                if (this.removeDialog === false) {
                    this.$store.dispatch("setIsRemoveFlow", false)
                }
            }
        },
        methods: {
            remove: async function () {
                await GraphElement.wrapElementsInController(this.selected.filter((selected) => {
                    return selected.canRemove;
                })).removeDo();
                return this.$store.dispatch("setIsRemoveFlow", false);
            },
            canRemove: function (graphElement) {
                if (graphElement.canExpand()) {
                    return false;
                }
                return graphElement.getDescendants().every((descendant) => {
                    return descendant.selectedToRemove || !descendant.isVertex();
                });
            }
        }
    }
</script>

<style scoped>

    .cannot-remove {
        text-decoration: line-through;
    }

</style>
