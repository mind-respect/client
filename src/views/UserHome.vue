<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div id="user-home" v-if="!isTesting" class="">
        <v-card flat class="pa-0">
            <v-card-title v-if="$vuetify.breakpoint.mdAndUp || !isOwner" class="pt-0">
                <v-tooltip v-if="$store.state.areCentersInGridView && $vuetify.breakpoint.mdAndUp" right>
                    <template v-slot:activator="{ on }">
                        <v-btn text icon @click="$store.dispatch('setAreCentersInGridView', false)"
                               class="mt-4">
                            <v-icon large>
                                view_list
                            </v-icon>
                        </v-btn>
                    </template>
                    {{$t('userhome:toList')}}
                </v-tooltip>
                <v-tooltip v-if="!$store.state.areCentersInGridView && $vuetify.breakpoint.mdAndUp" right>
                    <template v-slot:activator="{ on }">
                        <v-btn text icon
                               @click="$store.dispatch('setAreCentersInGridView', true)"
                               class="mt-4">
                            <v-icon large>
                                view_module
                            </v-icon>
                        </v-btn>
                    </template>
                    {{$t('userhome:toGrid')}}
                </v-tooltip>
                <v-spacer v-if="$vuetify.breakpoint.mdAndUp"></v-spacer>
                <v-avatar class="text-uppercase teal white--text mt-4 mr-2" small v-if="headUsername">
                    {{headUsername.substring(0,2)}}
                </v-avatar>
                <span class="body-1 mt-4" v-if="headUsername">
                    {{headUsername}}
                </span>
                <v-spacer></v-spacer>
                <v-btn class="mt-4" color="secondary" :disabled="addFriendLoading"
                       v-if="$store.state.user && !isOwner && !isWaitingFriendship && !isConfirmedFriend"
                       float
                       @click="addFriend()">
                    <v-icon class="mr-2">
                        person_add
                    </v-icon>
                    {{$t('userhome:addFriend')}}
                </v-btn>
                <v-btn :disabled="addFriendLoading" class="mt-4" color="secondary"
                       v-if="!isOwner && isWaitingForYourAnswer" float
                       @click="addFriend()">
                    <v-icon class="mr-2">
                        person_add
                    </v-icon>
                    {{$t('userhome:confirmFriend')}}
                </v-btn>
                <v-chip v-if="!isOwner && isWaitingFriendship" color="secondary" dark class="subtitle-1 mt-4">
                    {{$t('userhome:waitingFriend')}}
                </v-chip>
                <v-chip v-if="!isOwner && isConfirmedFriend" color="secondary" dark class="subtitle-1 mt-4">
                    {{$t('userhome:confirmedFriend')}}
                </v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
                <v-tabs
                        v-model="tabMenu"
                        background-color="secondary"
                        slider-color="third"
                        grow
                        dark
                        :icons-and-text="$vuetify.breakpoint.smAndDown"
                        slider-size="4"
                        :key="'userHomeTabs' + $route.params.username"
                >
                    <v-tab :disabled="!headUsername">
                        <span v-if="isOwner">
                            {{$t('userhome:centerTab')}}
                        </span>
                        <span v-else>
                            {{$t('userhome:centerTabNotOwner')}}
                        </span>
                        <v-icon :class="{
                            'mb-2' : $vuetify.breakpoint.smAndDown,
                            'ml-2' : $vuetify.breakpoint.mdAndUp
                        }">
                            filter_center_focus
                        </v-icon>
                    </v-tab>
                    <v-tab :disabled="!headUsername">
                        <span v-if="isOwner">
                            {{$t('userhome:friendTab')}}
                        </span>
                        <span v-else>
                            {{$t('userhome:friendTabNotOwner')}}
                        </span>
                        <v-icon :class="{
                            'mb-2' : $vuetify.breakpoint.smAndDown,
                            'ml-2' : $vuetify.breakpoint.mdAndUp
                        }">
                            people
                        </v-icon>
                    </v-tab>
                    <v-tab v-if="isOwner || !$store.state.user">
                        Patterns
                        <v-icon :class="{
                            'mb-2' : $vuetify.breakpoint.smAndDown,
                            'ml-2' : $vuetify.breakpoint.mdAndUp
                        }">
                            stars
                        </v-icon>
                    </v-tab>
                    <v-tab v-if="isOwner || !$store.state.user">
                        {{$t('userhome:public')}}
                        <v-icon :class="{
                            'mb-2' : $vuetify.breakpoint.smAndDown,
                            'ml-2' : $vuetify.breakpoint.mdAndUp
                        }">
                            public
                        </v-icon>
                    </v-tab>
                    <v-tabs-items v-model="tabMenu" touchless>
                        <v-tab-item>
                            <Centers flow="centers"
                                     @create="createCenterVertex"
                                     :isOwner="isOwner"
                                     v-if="tabMenu === 0 && headUsername"
                                     :isFriend="isConfirmedFriend"
                            ></Centers>
                        </v-tab-item>
                        <v-tab-item>
                            <v-tabs
                                    v-model="friendsTabMenu"
                                    grow
                                    slider-color="secondary"
                                    slider-size="2"
                                    color="secondary"
                                    :icons-and-text="$vuetify.breakpoint.smAndDown"
                                    v-if="isOwner && headUsername"
                            >
                                <v-tab>
                                    {{$t('userhome:centerTab')}}
                                    <v-icon :class="{
                                    'mb-2' : $vuetify.breakpoint.smAndDown,
                                    'ml-2' : $vuetify.breakpoint.mdAndUp
                                }">
                                        filter_center_focus
                                    </v-icon>
                                </v-tab>
                                <v-tab>
                                    {{$t('userhome:friendTab')}}
                                    <v-icon :class="{
                                    'mb-2' : $vuetify.breakpoint.smAndDown,
                                    'ml-2' : $vuetify.breakpoint.mdAndUp
                                }">
                                        people
                                    </v-icon>
                                </v-tab>
                                <v-tab-item>
                                    <Centers flow="friends" @create="createCenterVertex" :isOwner="isOwner"
                                             v-if="friendsTabMenu === 0"
                                    ></Centers>
                                </v-tab-item>
                                <v-tab-item>
                                    <Friends :isOwner="isOwner" v-if="friendsTabMenu === 1"></Friends>
                                </v-tab-item>
                            </v-tabs>
                            <Friends :isOwner="isOwner" v-if="!isOwner"></Friends>
                        </v-tab-item>
                        <v-tab-item v-if="isOwner || !$store.state.user">
                            <Centers flow="patterns" @create="createCenterVertex" :isOwner="isOwner"
                                     v-if="tabMenu === 2"></Centers>
                        </v-tab-item>
                        <v-tab-item v-if="isOwner || !$store.state.user">
                            <Centers flow="publicCenters" @create="createCenterVertex" :isOwner="isOwner"
                                     v-if="tabMenu === 3"
                            ></Centers>
                        </v-tab-item>
                    </v-tabs-items>
                </v-tabs>
            </v-card-text>
        </v-card>
        <v-snackbar
                v-model="friendShipSuccessSnackbar"
                color="success"
                class="vh-center body-1"
        >
            {{$t('userhome:friendshipSuccess')}}
            {{$route.params.username}}
            <v-btn
                    text
                    @click="friendShipSuccessSnackbar = false"
            >
                {{$t('close')}}
            </v-btn>
        </v-snackbar>
        <v-snackbar
                v-model="friendShipErrorSnackbar"
                color="error"
                class="vh-center body-1"
        >
            {{$t('userhome:friendshipError')}}
            <v-btn
                    text
                    @click="friendShipErrorSnackbar = false"
            >
                {{$t('close')}}
            </v-btn>
        </v-snackbar>
    </div>
</template>

<script>
    import I18n from '@/I18n'
    import Friends from '@/components/home/Friends.vue'
    import Centers from '@/components/home/Centers.vue'
    import FriendService from '@/friend/FriendService'
    import UserService from '@/service/UserService'
    import AppController from '@/AppController'

    const WHEN_OWNER_ONLY_TAB_MENUS = [2, 3];

    export default {
        name: "CentersList",
        components: {
            Friends,
            Centers
        },
        data: function () {
            I18n.i18next.addResources("en", "userhome", {
                "center": "Center",
                "context": "Bubbles around",
                "lastVisit": "Visit",
                "nbVisits": "#",
                "createInfo": "Create a new bubble",
                "removeInfo": "Remove from this list (does not remove the bubble)",
                "filter": "Filter",
                "confirmRemove": {
                    "title": "Remove from centers list",
                    "really": "Do you really want to remove that?",
                    "info": "This action does not remove the bubble(s). It will still be accessible throught the main search and by it's relations."
                },
                "reference": "Tag",
                "typeFilter": {
                    "tag": "Tag",
                    "vertex": "Bubble",
                    "relation": "Relation",
                    "bubbleType": "Bubble type",
                    "addAll": "Add All",
                    "removeAll": "Remove All"
                },
                "centerTab": "Centers",
                "centerTabNotOwner": "Centers",
                "friendTab": "Friends",
                "friendTabNotOwner": "Friends",
                "toGrid": "Grid view",
                "toList": "List view",
                "noBubbles": "No centers",
                "addFriend": "Add as friend",
                "waitingFriend": "Friendship request pending",
                "confirmFriend": "Confirm friendship request",
                "confirmedFriend": "Friend",
                "friends": {
                    "search": "Users of Mind Respect",
                    "friends": "Friends"
                },
                remove: "Remove from center's list",
                open: "Open in new tab",
                copy: "Copy link",
                noMoreCenters: "... no more centers",
                addBubble: "Add bubble",
                public: "Public",
                friendshipError: "Please ask for a new friendship request, there's been a mistake",
                friendshipSuccess: "You are now friend with"
            });
            I18n.i18next.addResources("fr", "userhome", {
                "center": "Centre",
                "context": "Bulles autour",
                "lastVisit": "Visite",
                "nbVisits": "#",
                "createInfo": "Créer une nouvelle bulle",
                "removeInfo": "Supprimer de cette liste (n'efface pas la bulle)",
                "filter": "Filtrer",
                "confirmRemove": {
                    "title": "Supprimer de la liste des centres",
                    "really": "Voulez-vous vraiment supprimer ça?",
                    "info": "Cette action ne supprime pas la bulle(s). Elle pourra toujours être trouvée par la recherche principale et par ses relations."
                },
                "typeFilter": {
                    "tag": "Étiquette",
                    "vertex": "Bulle",
                    "relation": "Relation",
                    "bubbleType": "Type de bulle",
                    "addAll": "Ajouter tout",
                    "removeAll": "Enlever tout"
                },
                "centerTab": "Centres",
                "centerTabNotOwner": "Centres",
                "friendTab": "Amis",
                "friendTabNotOwner": "Amis",
                "toGrid": "Vue en grille",
                "toList": "Vue en liste",
                "noBubbles": "Pas de centres",
                "addFriend": "Ajouter comme ami",
                "waitingFriend": "Requête d'amitié en attente",
                "confirmFriend": "Confirmer la demande d'amitié",
                "confirmedFriend": "Ami",
                "friends": {
                    "search": "Usagers de Mind Respect",
                    "friends": "Amis"
                },
                remove: "Retirer de la liste des centres",
                open: "Ouvrir dans un nouvel onglet",
                copy: "Copier le lien",
                noMoreCenters: "... plus de centres",
                addBubble: "Ajouter une bulle",
                public: "Publique",
                friendshipError: "S.V.P demandez une nouvelle demande d'amitié, il y a eu une erreur",
                friendshipSuccess: "Vous êtes maintenant ami avec"
            });
            return {
                isListView: true,
                centers: null,
                pagination: {
                    sortBy: 'name'
                },
                headers: [
                    {
                        text: this.$t('userhome:center'),
                        align: 'left',
                        value: 'labelSearch',
                        'class': 'subtitle-1'
                    },
                    {
                        text: this.$t('userhome:context'),
                        value: 'contextSearch',
                        'class': 'subtitle-1'
                    },
                    {
                        text: this.$t('userhome:lastVisit'),
                        value: '',
                        'class': 'subtitle-1'
                    }
                ],
                loaded: false,
                tabMenu: null,
                friendsTabMenu: null,
                isWaitingFriendship: false,
                isConfirmedFriend: false,
                isWaitingForYourAnswer: false,
                log: "empty log",
                patterns: null,
                publicCenters: null,
                friendShipSuccessSnackbar: false,
                friendShipErrorSnackbar: false,
                addFriendLoading: false
            };
        },
        methods: {
            createCenterVertex: function (label) {
                AppController.createVertex(label);
            },
            createCenterPatternVertex: function (label) {
                AppController.createVertex(label, true);
            },
            createCenterPublicVertex: function (label) {
                AppController.createVertex(label, false, true);
            },
            setupFriendship: function () {
                let promise = Promise.resolve();
                if (this.isOwner) {
                    return promise;
                }
                if (this.$route.params.confirmToken) {
                    if (this.$store.state.user) {
                        promise = FriendService.confirmFriendshipUsingUrlToken(
                            this.$route.params.requestUsername,
                            this.$route.params.destinationUsername,
                            this.$route.params.confirmToken
                        ).then(() => {
                            this.friendShipErrorSnackbar = false;
                            this.friendShipSuccessSnackbar = true;
                        }).catch(() => {
                            this.friendShipSuccessSnackbar = false;
                            this.friendShipErrorSnackbar = true;
                        });
                    } else {
                        return this.$router.push({
                            name: 'LoginFriendshipConfirm',
                            params: {
                                requestUsername: this.$route.params.requestUsername,
                                destinationUsername: this.$route.params.destinationUsername,
                                confirmToken: this.$route.params.confirmToken
                            }
                        });
                    }
                }
                return promise.then(() => {
                    this.isWaitingFriendship = false;
                    this.isWaitingForYourAnswer = false;
                    this.isConfirmedFriend = false;
                    if (!this.$store.state.user) {
                        return;
                    }
                    return FriendService.getStatusWithUser(this.$route.params.username).then((response) => {
                        switch (response.data.status) {
                            case "waiting": {
                                this.isWaitingFriendship = true;
                                return response;
                            }
                            case "waitingForYourAnswer": {
                                this.isWaitingForYourAnswer = true;
                                return response;
                            }
                            case "confirmed": {
                                this.isConfirmedFriend = true;
                                return response;
                            }
                        }
                    });
                });
            },
            addFriend: function () {
                this.addFriendLoading = true;
                FriendService.addFriend(
                    this.$route.params.username
                ).then(() => {
                    if (this.isWaitingForYourAnswer) {
                        this.isWaitingForYourAnswer = false;
                        this.isConfirmedFriend = true;
                    } else {
                        this.isWaitingFriendship = true;
                    }
                    this.addFriendLoading = false;
                });
            }
            ,
            reload: function () {
                this.loaded = false;
                this.reviewTabMenu();
                this.setupFriendship().then(() => {
                    this.loaded = true;
                });
            },
            reviewTabMenu: function () {
                if (this.$route.name === 'UserHome' || this.$route.name === 'home') {
                    this.tabMenu = 0;
                } else if (this.$route.name === 'FriendsUserHome') {
                    this.tabMenu = 1;
                } else if (this.$route.name === 'Patterns') {
                    this.tabMenu = 2;
                } else if (this.$route.name === 'PublicCenters') {
                    this.tabMenu = 3;
                }
            }
        },
        mounted: function () {
            if (this.isTesting) {
                return;
            }
            this.$store.dispatch('userHomeSelectedCenter', null);
            document.scrollingElement.scrollTop = 0;
            this.reload();
        },
        computed: {
            isOwner: function () {
                if (!this.$store.state.user) {
                    return false;
                }
                return this.$route.params.username === undefined || this.$route.params.username === this.$store.state.user.username;
            },
            headUsername: function () {
                if (this.$route.params.username) {
                    return this.$route.params.username;
                }
                if (this.$store.state.user) {
                    return this.$store.state.user.username;
                }
            },
            isTesting: function () {
                return process.env.NODE_ENV === "test";
            },
            userInUrl: function () {
                return this.$route.params.username;
            },
            routeName: function () {
                return this.$route.name;
            }
        }
        ,
        watch: {
            tabMenu: function () {
                this.$store.dispatch('userHomeSelectedCenter', null);
                document.title = "MindRespect.com";
                let pathName;
                if (this.tabMenu === 0) {
                    pathName = "UserHome";
                } else if (this.tabMenu === 1) {
                    pathName = "FriendsUserHome";
                } else if (this.tabMenu === 2) {
                    pathName = "Patterns";
                } else {
                    pathName = "PublicCenters";
                }
                if (this.$route.name !== 'home' && this.$route.name !== pathName) {
                    this.$router.push({
                        name: pathName,
                        params: {
                            username: this.headUsername
                        }
                    });
                }
            },
            userInUrl: function () {
                this.loaded = false;
                this.setupFriendship().then(() => {
                    if (this.tabMenu === 2 || this.tabMenu === 3) {
                        this.tabMenu = 0;
                    }
                    this.loaded = true;
                });
            },
            routeName: function () {
                this.reviewTabMenu();
            }
        }
    }
</script>

<style>
    .add-button-desktop {
        margin-top: -25px;
    }
</style>
