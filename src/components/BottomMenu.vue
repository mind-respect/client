<template>
    <div>
        <v-bottom-navigation
                v-if="isShowUsePatternButton || !isOwner"
                class=""
                fixed
                :value="0"
                grow
        >
            <v-btn
                    color="secondary"
                    text
                    large
                    @click="usePatternConfirmFlow = true"
                    v-show="!usePatternConfirmFlow"
                    :disabled="usePatternLoading"
                    class="subtitle-1"
                    v-if="isShowUsePatternButton"
            >
                <span v-if="isOwner">
                    {{$t('bottom:usePattern')}}
                </span>
                <span v-else>
                    {{$t('bottom:usePatternAsNonOwner')}}
                </span>
                <v-icon class="">
                    stars
                </v-icon>
            </v-btn>
            <v-btn text class="subtitle-1" :to="'/user/' + owner" v-if="!isOwner">
                {{owner}}
                <v-icon class="">
                    person
                </v-icon>
            </v-btn>
        </v-bottom-navigation>
        <v-bottom-sheet no-click-animation
                        v-model="usePatternConfirmFlow"
                        :internal-activator="true"
                        :inset="$vuetify.breakpoint.mdAndUp"
                        :content-class="usePatternContentClass">
            <v-sheet class="text-center">
                <v-layout wrap>
                    <v-flex xs12 class="text-center">
                        <v-card flat>
                            <v-card-title class="text-center vh-center">
                                <v-badge icon color="third" class="mt-4">
                                    <template v-slot:badge>
                                        <v-icon>stars</v-icon>
                                    </template>
                                    {{$t('bottom:usePattern')}}
                                </v-badge>
                            </v-card-title>
                            <v-card-text class="subtitle-1 pl-4 pr-4 text-center pb-0 pt-0">
                                <p>
                                    {{$t('bottom:usePatternInfo1')}}
                                </p>
                                <p>
                                    {{$t('bottom:usePatternInfo2')}}
                                </p>
                            </v-card-text>
                            <v-card-actions class="text-center pt-0">
                                <v-spacer></v-spacer>
                                <v-btn
                                        class="mt-5 mb-5"
                                        color="secondary"
                                        @click="usePattern"
                                        :disabled="usePatternLoading"
                                        :loading="usePatternLoading"
                                >
                                    <v-icon class="mr-2">
                                        stars
                                    </v-icon>
                                    {{$t('confirm')}}
                                </v-btn>
                                <v-btn
                                        class="mt-5 mb-5 ml-12"
                                        text
                                        @click="usePatternConfirmFlow = false"
                                        :disabled="usePatternLoading"
                                >
                                    {{$t('cancel')}}
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-sheet>
        </v-bottom-sheet>
    </div>
</template>

<script>
    import I18n from '@/I18n'
    import PatternService from "@/pattern/PatternService";
    import IdUri from '@/IdUri'
    import CurrentSubGraph from '@/graph/CurrentSubGraph'

    export default {
        name: "BottomMenu",
        data: function () {
            I18n.i18next.addResources("en", "bottom", {
                usePattern: "Use pattern",
                usePatternAsNonOwner: "Use to edit",
                usePatternInfo1: "This entire map will be copied to your centers and its bubbles will be made private.",
                usePatternInfo2: "You can use a pattern many times."
            });
            I18n.i18next.addResources("fr", "bottom", {
                usePattern: "Utiliser le pattern",
                usePatternAsNonOwner: "Utiliser pour éditer",
                usePatternInfo1: "Toute cette carte sera copiée dans vos centres et ses bulles seront rendues privées.",
                usePatternInfo2: "Vous pouvez utiliser un pattern à plusieurs reprises."
            });
            return {
                usePatternLoading: false,
                usePatternSheet: null,
                usePatternConfirmFlow: null
            }
        },
        mounted: function () {
            this.usePatternConfirmFlow = false;
            // this.usePatternSheet = this.center.isPattern();
        },
        methods: {
            usePattern: function () {
                this.usePatternLoading = true;
                PatternService.use(
                    CurrentSubGraph.get().center.getUri()
                ).then((response) => {
                    this.$router.push(
                        IdUri.htmlUrlForBubbleUri(response.data.uri)
                    );
                    this.usePatternLoading = false;
                })
            }
        },
        computed: {
            isShowUsePatternButton: function () {
                return this.$store.state.isPatternFlow && !this.usePatternConfirmFlow;
            },
            isPatternFlow: function () {
                return this.$store.state.isPatternFlow;
            },
            usePatternContentClass: function () {
                if (this.$vuetify.breakpoint.smAndDown) {
                    return "";
                }
                return this.$store.state.sideMenuFlow === false ?
                    "use-pattern-bottom-sheet-collapsed" :
                    "use-pattern-bottom-sheet-expanded";
            },
            owner: function () {
                return IdUri.currentUsernameInUrl();
            },
            isOwner: function () {
                if (!this.$store.state.user) {
                    return false;
                }
                return this.$route.params.username === undefined || this.$route.params.username === this.$store.state.user.username;
            },
            failedToEdit: function () {
                return this.$store.state.failedToEdit;
            }
        },
        watch: {
            isPatternFlow: function () {
                this.usePatternSheet = this.$store.state.isPatternFlow;
            },
            failedToEdit: function () {
                this.usePatternConfirmFlow = this.$store.state.isPatternFlow;
            }
        }
    }
</script>

<style scoped>
    .use-pattern-bottom-sheet-collapsed {
        margin-left: 95px;
    }

    .use-pattern-bottom-sheet-expanded {
        margin-left: 385px !important;
    }
</style>