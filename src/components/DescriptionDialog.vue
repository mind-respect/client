<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="dialog" v-if="isDescriptionFlow" width="900" persistent>
        <v-card>
            <v-card-text class="pt-8" style="color:inherit">
                <vue-editor
                        :key="bubble.uiId"
                        v-model="note"
                        ref="editor"
                        :editorOptions="editorOptions"
                ></vue-editor>
            </v-card-text>
            <v-card-actions v-if="!$store.state.isViewOnly">
                <v-btn color="secondary" class="ml-2" @click="save" :disabled="note === bubble.getComment()">
                    <v-icon class="mr-2">save</v-icon>
                    {{$t('save')}}
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
            <v-card-actions v-if="$store.state.isViewOnly">
                <v-spacer></v-spacer>
                <v-btn
                        text
                        class="mr-2"
                        @click="dialog = false"
                >
                    {{$t('close')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import Selection from '@/Selection'
    import I18n from '@/I18n'
    import GraphUi from '@/graph/GraphUi'
    import KeyboardActions from '@/KeyboardActions'

    export default {
        name: "DescriptionDialog",
        components: {
            VueEditor: () => import ('vue2-editor').then((module) => {
                return module.VueEditor
            })
        },
        data: function () {
            I18n.i18next.addResources("en", "desc", {
                "title": "About"
            });
            I18n.i18next.addResources("fr", "desc", {
                "title": "À propos de"
            });
            return {
                dialog: false,
                note: "",
                editorOptions: {},
                bubble: null
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsDescriptionFlow", false)
        },
        computed: {
            isDescriptionFlow: function () {
                return this.$store.state.isDescriptionFlow;
            }
        },
        watch: {
            isDescriptionFlow: function () {
                if (this.$store.state.isDescriptionFlow) {
                    this.bubble = Selection.getSingle();
                    this.dialog = true;
                    this.note = this.bubble.getComment();
                    this.editorOptions.placeholder = this.$t('desc:title') + " \"" + this.bubble.getLabelOrDefault() + "\""
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.$refs.editor.quill.setSelection(
                                this.note.length
                            );
                        }, 300)
                    });

                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsDescriptionFlow", false);
                    GraphUi.enableDragScroll();
                    KeyboardActions.enable();
                } else {
                    GraphUi.disableDragScroll();
                    KeyboardActions.disable();
                }
            }
        },
        methods: {
            save: function () {
                this.bubble.controller().noteDo(this.note).then(() => {
                    this.dialog = false;
                })
            }
        }
    }
</script>

<style scoped>

</style>
