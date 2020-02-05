<template>
    <v-dialog v-model="dialog" v-if="isNewContextFlow && dialog" width="900" id="removeDialog">
        <v-card :class="{
            'pl-0': $vuetify.breakpoint.smAndDown,
            'pr-0': $vuetify.breakpoint.smAndDown,
        }">
            <v-card-title class="title">
                {{$t('newContext:title')}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >close
                </v-icon>
            </v-card-title>
            <v-card-text class="pt-0 pb-0 body-1" :class="{
            'pl-0': $vuetify.breakpoint.smAndDown,
            'pr-0': $vuetify.breakpoint.smAndDown,
        }">
                <v-card flat>
                    <v-card-title class="title font-weight-light pb-0">
                        {{$t('newContext:now')}}
                    </v-card-title>
                    <v-card-text>
                        <v-card>
                            <v-card-title class="body-1 h-center">
                                {{$t('newContext:actualMap')}}
                            </v-card-title>
                            <v-card-subtitle class="body-2 pb-0 text-center">
                                {{$t('newContext:where')}}
                                "{{relation.getParentVertex().getLabelOrDefault()}}"
                                {{$t('newContext:isTheParent')}}
                            </v-card-subtitle>
                            <v-card-text>
                                <v-card flat>
                                    <v-card-text class="body-1 text-center">
                                        {{leftVertex.getLabelOrDefault()}}
                                        <NewContextDialogRelation :relation="relation"></NewContextDialogRelation>
                                        {{rightVertex.getLabelOrDefault()}}
                                    </v-card-text>
                                </v-card>
                            </v-card-text>
                        </v-card>
                        <v-divider></v-divider>
                        <v-card>
                            <v-card-title class="body-1 h-center">
                                {{$t('newContext:mirrorMap')}}
                            </v-card-title>
                            <v-card-subtitle class="body-2 pb-0 text-center">
                                {{$t('newContext:where')}}
                                "{{relation.getNextBubble().getLabelOrDefault()}}"
                                {{$t('newContext:isTheParent')}}
                            </v-card-subtitle>
                            <v-card-text>
                                <v-card flat>
                                    <v-card-text class="body-1 text-center">
                                        {{rightVertex.getLabelOrDefault()}}
                                        <NewContextDialogRelation :relation="relation"
                                                                  :mirror="true"></NewContextDialogRelation>
                                        {{leftVertex.getLabelOrDefault()}}
                                    </v-card-text>
                                </v-card>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                </v-card>
                <v-card flat>
                    <v-card-title class="title font-weight-light pb-0">
                        {{$t('newContext:resultAfterConfirmation')}}
                    </v-card-title>
                    <v-card-text>
                        <v-card>
                            <v-card-title class="body-1 h-center">
                                {{$t('newContext:actualMap')}}
                            </v-card-title>
                            <v-card-subtitle class="body-2 pb-0 text-center">
                                {{$t('newContext:where')}}
                                "{{relation.getParentVertex().getLabelOrDefault()}}"
                                {{$t('newContext:isTheParent')}}
                            </v-card-subtitle>
                            <v-card-text>
                                <v-card flat>
                                    <v-card-text class="body-1 text-center">
                                        <v-icon class="ml-2" v-if="isDestinationVertex(leftVertex)" small>
                                            label
                                        </v-icon>
                                        <span :class="{
                                            'line-through' : shouldLineThroughVertex(leftVertex)
                                        }">
                                            {{leftVertex.getLabelOrDefault()}}
                                        </span>
                                        <NewContextDialogRelation :relation="relation"
                                                                  :lineThrough="shouldLineThroughVertex(leftVertex) || shouldLineThroughVertex(rightVertex)"
                                        ></NewContextDialogRelation>
                                        <v-icon class="ml-2" v-if="isDestinationVertex(rightVertex)" small>
                                            label
                                        </v-icon>
                                        <span class="ml-1" :class="{
                                            'line-through' : shouldLineThroughVertex(rightVertex)
                                        }">
                                            {{rightVertex.getLabelOrDefault()}}
                                        </span>
                                    </v-card-text>
                                </v-card>
                            </v-card-text>
                        </v-card>
                        <v-divider></v-divider>
                        <v-card>
                            <v-card-title class="body-1 h-center">
                                {{$t('newContext:mirrorMap')}}
                            </v-card-title>
                            <v-card-subtitle class="body-2 pb-0 text-center">
                                {{$t('newContext:where')}}
                                "{{relation.getNextBubble().getLabelOrDefault()}}"
                                {{$t('newContext:isTheParent')}}
                            </v-card-subtitle>
                            <v-card-text>
                                <v-card flat>
                                    <v-card-text class="body-1 text-center">
                                        <v-icon class="mr-1" v-if="isDestinationVertex(rightVertex)" small>label
                                        </v-icon>
                                        <span :class="{
                                            'line-through' : shouldLineThroughVertexInMirror(rightVertex)
                                        }">
                                            {{rightVertex.getLabelOrDefault()}}
                                        </span>
                                        <NewContextDialogRelation :relation="relation"
                                                                  :mirror="true"
                                                                  :lineThrough="shouldLineThroughVertexInMirror(leftVertex) || shouldLineThroughVertexInMirror(rightVertex)"
                                        ></NewContextDialogRelation>
                                        <v-icon class="mr-1" v-if="isDestinationVertex(leftVertex)" small>label</v-icon>
                                        <span :class="{
                                            'line-through' : shouldLineThroughVertexInMirror(leftVertex)
                                        }">
                                            {{leftVertex.getLabelOrDefault()}}
                                        </span>
                                    </v-card-text>
                                </v-card>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                </v-card>
            </v-card-text>
            <v-card-actions>
                <v-btn color="secondary" class="ml-4" @click="confirm"
                       :loading="actionLoading"
                       :disabled="actionLoading">
                    {{$t('confirm')}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="dialog = false" text class="mr-4">
                    {{$t('cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import Selection from '@/Selection'
    import NewContextDialogRelation from '@/components/NewContextDialogRelation'
    import I18n from '@/I18n'
    import KeyboardActions from '@/KeyboardActions'

    export default {
        name: "NewContextDialog",
        components: {
            NewContextDialogRelation
        },
        data: function () {
            I18n.i18next.addResources("en", "newContext", {
                title: "Split into 2 cards that share a tag",
                now: "Now",
                actualMap: "Current map",
                where: "where",
                isTheParent: "is the parent",
                mirrorMap: "Mirror map",
                resultAfterConfirmation: "Result after confirmation"
            });
            I18n.i18next.addResources("fr", "newContext", {
                title: "Séparer en 2 cartes qui partagent un étiquette",
                replace1: "La bulle choisie, sera copiée, étiquetée à son originale et remplacée dans la relation",
                ifParent1: "Cette action fera disparaître la bulle enfant",
                ifParent2: "et son arbre de cette carte.",
                ifParent3: "Toutefois, le lien sera conservé grâce à un étiquette sur",
                ifParent4: "De plus, les bulles peuvent toujours être retrouvés à partir de la recherche.",
                objective: "L'objectif est d'alléger et améliorer la clareté de cette carte.",
                ifChildren1: "Cette action fera disparaître l'arbre de",
                ifChildren2: "de cette carte. Toutefois, le lien sera conservé grâce à un étiquette sur",
                ifChildren3: "De plus, les bulles peuvent toujours être retrouvés à partir de la recherche.",
                now: "Maintenant",
                actualMap: "Carte actuelle",
                where: "où",
                isTheParent: "est le parent",
                mirrorMap: "Carte miroir",
                resultAfterConfirmation: "Résultat après confirmation"
            });
            return {
                dialog: false,
                relation: null,
                actionLoading: false
            };
        },
        mounted: function () {
            this.$store.dispatch("isNewContextFlow", false);
        },
        methods: {
            confirm: async function () {
                this.actionLoading = true;
                await this.relation.controller().leaveContextDo();
                this.actionLoading = false;
                this.dialog = false;
            },
            isDestinationVertex: function (vertex) {
                return this.relation.getDestinationVertex().getUri() === vertex.getUri();
            },
            isChildVertex: function (vertex) {
                return this.relation.getNextBubble().getUri() === vertex.getUri();
            },
            isParentVertex: function (vertex) {
                return this.relation.getParentVertex().getUri() === vertex.getUri();
            },
            shouldLineThroughVertex: function (vertex) {
                return this.isChildVertex(vertex) && !this.isDestinationVertex(vertex)
            },
            shouldLineThroughVertexInMirror: function (vertex) {
                return this.isParentVertex(vertex) && !this.isDestinationVertex(vertex)
            }
        },
        computed: {
            isNewContextFlow: function () {
                return this.$store.state.isNewContextFlow;
            },
            leftVertex: function () {
                return this.relation.isToTheLeft() ?
                    this.relation.getNextBubble() :
                    this.relation.getParentVertex()
            },
            rightVertex: function () {
                return this.relation.isToTheLeft() ?
                    this.relation.getParentVertex() :
                    this.relation.getNextBubble()
            }
        },
        watch: {
            isNewContextFlow: async function () {
                if (this.$store.state.isNewContextFlow) {
                    this.relation = Selection.getSingle();
                    this.actionLoading = false;
                    this.dialog = true;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.actionLoading = false;
                    KeyboardActions.enable();
                    this.$store.dispatch("isNewContextFlow", false)
                }else{
                    KeyboardActions.disable();
                }
            }
        }
    }
</script>

<style scoped>

</style>