<template>
    <div v-if="loaded">
        <v-overlay :value="shouldShowOfflineDialog" z-index="9999">
            <div class="text">
                <v-alert type="warning">
                    {{$t('offline:offline')}}
                </v-alert>
            </div>
        </v-overlay>
        <v-overlay :value="$store.state.isServerNotResponding" z-index="9999" v-if="$store.state.user !== undefined">
            <div class="text">
                <v-alert type="warning">
                    {{$t('offline:serverConnection')}}
                    {{$t('offline:serverConnectionCheckingAgain')}}
                    {{connectivityCountDown}}
                    <v-btn @click="checkConnectivity" color="secondary" small class="ml-4">
                        {{$t('offline:checkConnectivityNow')}}
                    </v-btn>
                </v-alert>
            </div>
        </v-overlay>
    </div>
</template>

<script>
    import Service from "../Service";
    import I18n from '@/I18n'
    import KeyboardActions from '@/KeyboardActions'
    import GraphUi from '@/graph/GraphUi'

    let checkConnectivityTimeout;
    let showOffLineMessageTimeout = null;

    export default {
        name: "OfflineOverlay",
        data: function () {
            I18n.i18next.addResources("en", "offline", {
                offline: "You're offline. Mindrespect.com only works when you are connected to the internet.",
                serverConnection: "Connection problem with the server",
                serverConnectionCheckingAgain: "Check again in",
                checkConnectivityNow: "Check now"
            });
            I18n.i18next.addResources("fr", "offline", {
                offline: "Vous êtes hors ligne. Mindrespect.com ne fonctionne que lorsque vous êtes connecté à internet.",
                serverConnection: "Problème de connection avec le serveur",
                serverConnectionCheckingAgain: "Vérifier de nouveau dans",
                checkConnectivityNow: "Vérifier maintenant"
            });
            return {
                isOnline: navigator.onLine,
                nbConnectivityAttempts: 0,
                connectivityCountDown: 5,
                isCheckingConnectivity: false,
                loaded: false
            }
        },
        computed: {
            shouldShowOfflineDialog: function () {
                return !this.isOnline && this.$store.state.user !== undefined;
            },
            isServerNotResponding: function () {
                return this.$store.state.isServerNotResponding;
            }
        },
        watch: {
            isServerNotResponding: function () {
                if (this.$store.state.isServerNotResponding) {
                    this.nbConnectivityAttempts = 0;
                    this.connectivityCountDown = 5;
                    this.connectivityCountDownTimer();
                }
            }
        },
        methods: {
            checkConnectivity: function () {
                if (checkConnectivityTimeout) {
                    clearTimeout(checkConnectivityTimeout);
                }
                this.isCheckingConnectivity = true;
                return Service.api().get(
                    "/connectivity"
                ).then(async () => {
                    this.loaded = true;
                    this.nbConnectivityAttempts = 0;
                    if (this.$store.state.isServerNotResponding) {
                        KeyboardActions.enable();
                        GraphUi.enableDragScroll();
                    }
                    await this.$store.dispatch("setIsServerNotResponding", false);
                    this.isCheckingConnectivity = false;
                    this.connectivityCountDownTimer();
                }).catch(() => {
                    this.loaded = true;
                    this.nbConnectivityAttempts++;
                    this.connectivityCountDown = 5 + (this.nbConnectivityAttempts + 1) * 4;
                    this.isCheckingConnectivity = false;
                    this.connectivityCountDownTimer();
                });
            },
            connectivityCountDownTimer() {
                if (this.isCheckingConnectivity || !this.$store.state.isServerNotResponding) {
                    return;
                }
                if (this.connectivityCountDown > 0) {
                    checkConnectivityTimeout = setTimeout(() => {
                        this.connectivityCountDown -= 1;
                        this.connectivityCountDownTimer();
                    }, 1000)
                } else {
                    this.checkConnectivity();
                }
            },
            restoreActions: function () {
                KeyboardActions.enable();
                GraphUi.enableDragScroll();
            },
            disableActions: function () {
                KeyboardActions.disable();
                GraphUi.disableDragScroll();
            }
        },
        mounted: function () {
            if (this.$store.state.isServerNotResponding) {
                this.checkConnectivity()
            } else {
                this.loaded = true;
            }
        },
        created: function () {
            window.addEventListener('online', () => {
                if (showOffLineMessageTimeout !== null) {
                    clearTimeout(showOffLineMessageTimeout);
                }
                this.restoreActions();
                this.isOnline = true;
            });
            window.addEventListener('offline', () => {
                showOffLineMessageTimeout = setTimeout(() => {
                    showOffLineMessageTimeout = null;
                    this.disableActions();
                    this.isOnline = false;
                }, 1000);
            });
        }
    }
</script>

<style scoped>

</style>