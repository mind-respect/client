<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="removeTagDialog" v-if="isRemoveTagFlow" width="600" id="removeTagDialog">
        <v-card>
            <v-card-title class="title">
                {{$t('removeTag:title_prefix')}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="removeTagDialog = false"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0">
                <v-list>
                    <v-subheader v-if="isMultipleFlow && false">
                        {{$t('removeTag:multiple')}}
                    </v-subheader>
                    <v-list-item
                            v-for="bubble in bubbles"
                            :key="bubble.uiId"
                    >
                        <v-list-item-action>
                            <v-icon>
                                label
                            </v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>
                                {{bubble.getLabelOrDefault()}}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <form>
                    <input type="text" ref="enterRemoveInput" autofocus style="width:0">
                    <v-btn color="secondary" class="ml-2" @click="remove">
                        <v-icon class="mr-2">delete</v-icon>
                        {{$t('removeTag:confirm')}}
                        <span v-if="isMultipleFlow" class="ml-2">
                            {{$t('removeTag:multiple_confirm_suffix')}}
                        </span>
                    </v-btn>
                </form>
                <v-spacer></v-spacer>
                <v-btn
                        text
                        class="mr-2"
                        @click="removeTagDialog = false"
                >
                    {{$t('removeTag:cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import Selection from '@/Selection'
    import I18n from '@/I18n'
    import CurrentSubGraph from "@/graph/CurrentSubGraph";
    import Store from '@/store'
    import TagService from '@/identifier/TagService'

    export default {
        name: "RemoveTagDialog",
        data: function () {
            I18n.i18next.addResources("en", "removeTag", {
                "title_prefix": "Pull off tag",
                "multiple": "All these bubbles",
                "desc1": "Do you really want to remove this?",
                "desc2": "The relations around an erased bubble are also removed.",
                "desc3": "If you choose to remove this and it seems like related bubbles have disapeared, try to look for them in the search bar.",
                "confirm": "Remove",
                "multiple_confirm_suffix": "for all",
                "cancel": "Cancel"
            });
            I18n.i18next.addResources("fr", "removeTag", {
                "title_prefix": "Enlever l'étiquette",
                "multiple": "Toutes ces bulles",
                "desc1": "Voulez-vous vraiment effacer ça?",
                "desc2": "Les relations autour des bulles seront également effacées.",
                "desc3": "Si des bulles semblent avoir disparues, retrouvez les dans la barre de recherche.",
                "confirm": "Enlever",
                "multiple_confirm_suffix": "pour tout",
                "cancel": "Annuler"
            });
            return {
                removeTagDialog: false,
                bubbles: []
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsRemoveTagFlow", false)
        },
        computed: {
            isRemoveTagFlow: function () {
                return this.$store.state.isRemoveTagFlow;
            },
            isMultipleFlow: function () {
                return this.bubbles.length > 1;
            }
        },
        watch: {
            isRemoveTagFlow: function () {
                if (this.$store.state.isRemoveTagFlow) {
                    this.bubbles = [];
                    Selection.getSelectedElements().forEach((metaRelation) => {
                        let nextBubble = metaRelation.getNextBubble();
                        if (nextBubble.isMetaGroupVertex()) {
                            nextBubble.expand();
                            this.bubbles = this.bubbles.concat(nextBubble.getClosestChildVertices());
                        } else {
                            this.bubbles.push(nextBubble);
                        }
                    });

                    this.removeTagDialog = true;
                    this.$nextTick(() => {
                        const element = this.$refs.enterRemoveInput;
                        this.$nextTick(() => {
                            element.focus()
                        });
                    })
                } else {
                    this.removeTagDialog = false;
                }
            },
            removeTagDialog: function () {
                if (this.removeTagDialog === false) {
                    this.$store.dispatch("setIsRemoveTagFlow", false)
                }
            }
        },
        methods: {
            remove: async function () {
                let tag = CurrentSubGraph.get().center.getOriginalMeta();
                await Promise.all(this.bubbles.map((bubble) => {
                    let parentVertex = bubble.getParentVertex();
                    if (parentVertex.isMetaGroupVertex()) {
                        let promise = TagService.remove(bubble.getParentBubble().getEdgeUri(), tag);
                        if (parentVertex.getNumberOfChild() === 1) {
                            parentVertex.remove();
                        } else {
                            bubble.remove();
                        }
                        return promise;
                    } else {
                        bubble.remove();
                        return bubble.controller().removeIdentifier(tag);
                    }
                }));
                Store.dispatch("redraw");
                this.removeTagDialog = false;
            }
        }
    }
</script>

<style scoped>

</style>
