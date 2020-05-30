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
                            v-for="tagRelation in tagRelations"
                            :key="tagRelation.uiId"
                    >
                        <v-list-item-content>
                            <v-list-item-title>
                                <v-icon class="mr-2">
                                    label
                                </v-icon>
                                "{{tagRelation._tagVertex.getOriginalMeta().getLabelOrDefault()}}"
                                {{$t('toTheBubble')}}
                                "{{tagRelation._taggedBubble.getLabelOrDefault()}}"
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
    import TagRelationController from '@/tag/TagRelationController'
    import KeyboardActions from '@/KeyboardActions'
    import GraphElementType from "../graph-element/GraphElementType";
    import CurrentSubGraph from "../graph/CurrentSubGraph";

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
                tagRelations: []
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
                return this.tagRelations.length > 1;
            }
        },
        watch: {
            isRemoveTagFlow: function () {
                if (this.$store.state.isRemoveTagFlow === false) {
                    this.removeTagDialog = false;
                } else {
                    this.tagRelations = this.$store.state.isRemoveTagFlow === true ?
                        Selection.getSelectedElements() :
                        this.$store.state.isRemoveTagFlow.map((tagRelationUri) => {
                            return CurrentSubGraph.get().getHavingUri(tagRelationUri);
                        });
                    let tagRelationsUnderGroupVertex = [];
                    let l = this.tagRelations.length;
                    while (l--) {
                        let tagRelation = this.tagRelations[l];
                        let nextBubble = tagRelation.getNextBubble();
                        tagRelation._tagVertex = tagRelation.getTagVertex();
                        tagRelation._taggedBubble = tagRelation.getTaggedBubble();
                        if (nextBubble.isMetaGroupVertex()) {
                            nextBubble.expand();
                            tagRelationsUnderGroupVertex = tagRelationsUnderGroupVertex.concat(nextBubble.getNextChildren());
                            this.tagRelations.splice(l, 1);
                        }
                    }
                    this.tagRelations = this.tagRelations.concat(tagRelationsUnderGroupVertex);
                    this.removeTagDialog = true;
                    this.$nextTick(() => {
                        const element = this.$refs.enterRemoveInput;
                        this.$nextTick(() => {
                            element.focus()
                        });
                    })
                }
            },
            removeTagDialog: function () {
                if (this.removeTagDialog === false) {
                    KeyboardActions.enable();
                    this.$store.dispatch("setIsRemoveTagFlow", false)
                } else {
                    KeyboardActions.disable();
                }
            }
        },
        methods: {
            remove: async function () {
                let controller = new TagRelationController.MetaRelationController(
                    this.tagRelations
                );
                await controller.removeDo();
                this.removeTagDialog = false;
            }
        }
    }
</script>

<style scoped>

</style>
