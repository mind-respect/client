<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-dialog v-model="dialog" v-if="isDescriptionFlow" width="900" persistent>
        <v-card>
            <v-card-text class="">
                <vue-editor
                        :key="bubble.uiId"
                        v-model="note"
                        ref="editor"
                        :editorOptions="editorOptions"
                ></vue-editor>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" class="ml-2" @click="save" :disabled="note === bubble.getComment()">
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
                "title": "About"
            });
            I18n.i18next.addResources("fr", "desc", {
                "title": "À propos de"
            });
            return {
                dialog: false,
                note: "",
                editorOptions: {}
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
                    this.dialog = true;
                    this.note = this.bubble.getComment();
                    this.editorOptions.placeholder = this.$t('desc:title') + " \"" + this.bubble.getLabelOrDefault() + "\""
                    this.$nextTick(function () {
                        setTimeout(function () {
                            this.$refs.editor.quill.setSelection(
                                this.note.length
                            );
                        }.bind(this), 300)
                    }.bind(this))

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
                this.bubble.setComment(
                    this.note
                );
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