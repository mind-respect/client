<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="" id="user-home" v-if="!isTesting">
        <v-tabs
                v-model="tabMenu"
                color="primary"
                dark
                background-color="secondary"
                slider-color="yellow"
                grow
        >
            <v-tab>
                <v-icon small class="mr-2">
                    filter_center_focus
                </v-icon>
                {{$t('userhome:centerTab')}}
            </v-tab>
            <v-tab>
                <v-icon small class="mr-2">
                    people
                </v-icon>
                {{$t('userhome:friendTab')}}
            </v-tab>
            <v-tab-item>
                <v-card>
                    <v-card-title>
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
                        <v-spacer></v-spacer>
                        <v-btn color="secondary" v-if="!isOwner && !isWaitingFriendship && !isConfirmedFriend" float
                               @click="addFriend()">
                            <v-icon class="mr-2">
                                person_add
                            </v-icon>
                            {{$t('userhome:addFriend')}}
                        </v-btn>
                        <v-btn color="secondary" v-if="!isOwner && isWaitingForYourAnswer" float @click="addFriend()">
                            <v-icon class="mr-2">
                                person_add
                            </v-icon>
                            {{$t('userhome:confirmFriend')}}
                        </v-btn>
                        <v-chip v-if="!isOwner && isWaitingFriendship" color="secondary" dark class="subtitle-1">
                            {{$t('userhome:waitingFriend')}}
                        </v-chip>
                        <v-chip v-if="!isOwner && isConfirmedFriend" color="secondary" dark class="subtitle-1">
                            {{$t('userhome:confirmedFriend')}}
                        </v-chip>
                    </v-card-title>
                    <v-card flat class="ma-0 pa-0" min-height="200" :class="{
                        'vh-center': !loaded
                    }">
                        <v-card-text class="pt-0">
                            <v-tooltip v-if="isOwner" left>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon color="third" fab @click="createCenterVertex()" dark top
                                           absolute right class="mr-6 right" style="z-index:0;" :class="{
                                        'add-button-desktop' : $vuetify.breakpoint.mdAndUp
                                       }">
                                        <v-icon large>add</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{$t('userhome:createInfo')}}</span>
                            </v-tooltip>
                            <v-layout wrap v-if="!loaded">
                                <v-flex xs12 class="vh-center">
                                    <v-progress-circular size="64" indeterminate color="third"></v-progress-circular>
                                </v-flex>
                            </v-layout>
                            <v-layout
                                    wrap
                                    class="pt-0"
                                    v-if="loaded && centers"
                                    v-infinite-scroll="addCenters"
                                    :infinite-scroll-disabled="busy"
                                    :infinite-scroll-distance="10"
                                    style="overflow-y:scroll;"
                            >
                                <v-flex xs12 md6 v-if="centers.length === 0">
                                    <h3 class="subtitle-1 vh-center font-italic" v-if="centers.length === 0">
                                        {{$t('userhome:noBubbles')}}
                                    </h3>
                                </v-flex>
                                <v-flex xs12 :md3="$store.state.areCentersInGridView"
                                        v-for="(center, index) in centers">
                                    <v-hover>
                                        <v-list two-line id="grid-list" slot-scope="{ hover }">
                                            <v-list-item @click="go($event, center.uri().url())">
                                                <v-list-item-content>
                                                    <v-list-item-title class="subtitle-1 font-weight-bold">
                                                        {{center.getLabel()}}
                                                        <v-icon class="ml-1 mb-1 float-right" color="grey"
                                                                v-if="center.showIcon()"
                                                                small>
                                                            {{center.getIcon()}}
                                                        </v-icon>
                                                        <v-icon class="ml-4 mb-1 float-right" color="grey" small>
                                                            {{center.getShareIcon()}}
                                                        </v-icon>
                                                        <small class="grey--text font-weight-normal font-italic mr-1 float-right"
                                                               v-if="$vuetify.breakpoint.mdAndUp">
                                                            {{center.lastVisit()}}
                                                        </small>
                                                    </v-list-item-title>
                                                    <v-list-item-subtitle class="mt-1">
                                                        <div v-for="(value, key) in center.getContext()"
                                                             v-if="center.contextSearch !== ''"
                                                             class="around-list-item">
                                                            {{value}}
                                                        </div>
                                                    </v-list-item-subtitle>
                                                    <!--<v-list-item-s  ub-title class="text-xs-right" >-->
                                                    <!--{{center.lastVisit()}}-->
                                                    <!--</v-list-item-subtitle>-->
                                                </v-list-item-content>
                                                <v-list-item-action @click.stop v-if="$vuetify.breakpoint.smAndUp"
                                                                    style="min-width:40px;">
                                                    <v-menu offset-y v-if="isOwner && (hover || center.menu)" left
                                                            v-model="center.menu">
                                                        <template v-slot:activator="{ on }">
                                                            <v-btn icon small v-on="on">
                                                                <v-icon color="third">
                                                                    more_horiz
                                                                </v-icon>
                                                            </v-btn>
                                                        </template>
                                                        <v-list>
                                                            <v-list-item
                                                                    @click.prevent="removeCenter(center, index)">
                                                                <v-list-item-action>
                                                                    <v-icon>visibility_off</v-icon>
                                                                </v-list-item-action>
                                                                <v-list-item-title>
                                                                    {{$t('userhome:remove')}}
                                                                </v-list-item-title>
                                                            </v-list-item>
                                                            <v-list-item :href="center.uri().url()" target="_blank">
                                                                <v-list-item-action>
                                                                    <v-icon>open_in_new</v-icon>
                                                                </v-list-item-action>
                                                                <v-list-item-title>
                                                                    {{$t('userhome:open')}}
                                                                </v-list-item-title>
                                                            </v-list-item>
                                                            <v-list-item @click="copyUrl(center)">
                                                                <v-list-item-action>
                                                                    <v-icon>link</v-icon>
                                                                </v-list-item-action>
                                                                <v-list-item-title>
                                                                    {{$t('userhome:copy')}}
                                                                </v-list-item-title>
                                                            </v-list-item>
                                                        </v-list>
                                                    </v-menu>
                                                </v-list-item-action>
                                            </v-list-item>
                                        </v-list>
                                    </v-hover>
                                </v-flex>
                            </v-layout>
                        </v-card-text>
                    </v-card>
                </v-card>
            </v-tab-item>
            <v-tab-item>
                <Friends></Friends>
            </v-tab-item>
        </v-tabs>
    </div>
</template>

<script>
    import CenterGraphElementService from '@/center/CenterGraphElementService'
    import CenterGraphElement from '@/center/CenterGraphElement'
    import IdUri from '@/IdUri'
    import I18n from '@/I18n'
    import Friends from '@/components/home/Friends.vue'
    import FriendService from '@/friend/FriendService'
    import UserService from '@/service/UserService'
    import AppController from '@/AppController'
    import infiniteScroll from 'vue-infinite-scroll'

    export default {
        name: "CentersList",
        components: {
            Friends
        },
        directives: {infiniteScroll},
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
                "friendTab": "Friends",
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
                copy: "Copy link"
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
                "friendTab": "Amis",
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
                copy: "Copier le lien"
            });
            return {
                isListView: true,
                centers: null,
                IdUri: IdUri,
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
                isWaitingFriendship: false,
                isConfirmedFriend: false,
                isWaitingForYourAnswer: false,
                busy: false
            }
        },
        methods: {
            addCenters() {
                this.busy = true;
                let centersRequest = this.isOwner ? CenterGraphElementService.getPublicAndPrivateWithSkip(this.centers.length) : CenterGraphElementService.getPublicOnlyForUsernameWithSkip(
                    this.$route.params.username,
                    this.centers.length
                );
                centersRequest.then((response) => {
                    CenterGraphElement.fromServerFormat(response.data).map((center) => {
                        center.labelSearch = center.getLabel();
                        center.contextSearch = Object.values(center.getContext()).join(' ');
                        return center;
                    }).sort(function (a, b) {
                        return b.getLastCenterDate() - a.getLastCenterDate();
                    }).forEach((center) => {
                        this.centers.push(center);
                    });
                    this.busy = false;
                });
            },
            go: function ($event, path) {
                this.$router.push(
                    path
                );
            },
            copyUrl: function (center) {
                this.$copyText(
                    center.uri().absoluteUrl()
                );
            },
            createCenterVertex: function (label) {
                AppController.createVertex(null, label);
            },
            removeCenter: function (centerToRemove, index) {
                CenterGraphElementService.removeCenterWithUri(
                    centerToRemove.getUri()
                );
                let l = this.centers.length;
                while (l--) {
                    let center = this.centers[l];
                    if (center.getUri() === centerToRemove.getUri()) {
                        this.centers.splice(l, 1);
                    }
                }
            },
            setupCenters: function () {
                let isOwner = this.$store.state.user && (!this.$route.params.username || this.$store.state.user.username === this.$route.params.username);
                let centersRequest = isOwner ? CenterGraphElementService.getPublicAndPrivate() : CenterGraphElementService.getPublicOnlyForUsername(
                    this.$route.params.username
                );
                if (this.$route.name === "FriendsUserHome") {
                    this.tabMenu = 1;
                } else {
                    this.tabMenu = 0;
                }
                return centersRequest.then((response) => {
                    this.centers = CenterGraphElement.fromServerFormat(response.data).map((center) => {
                        center.labelSearch = center.getLabel();
                        center.contextSearch = Object.values(center.getContext()).join(' ');
                        return center;
                    }).sort(function (a, b) {
                        return b.getLastCenterDate() - a.getLastCenterDate();
                    });
                });
            },
            setupFriendFlow: function () {
                let promise = Promise.resolve();
                if (!this.isOwner && this.$route.params.confirmToken) {
                    promise = FriendService.confirmFriendshipUsingUrlToken(
                        this.$route.params.requestUsername,
                        this.$route.params.destinationUsername,
                        this.$route.params.confirmToken
                    ).then(function (newlyConnectedUser) {
                        // if (!newlyConnectedUser) {
                        //     window.location.href = url.href.replace(url.search, "") + "?flow=confirmFriendError";
                        //     return Promise.reject;
                        // }
                        // if (!UserService.hasCurrentUser()) {
                        //     window.location.href = url.href.replace(url.search, "") + "?flow=newConfirmFriend";
                        //     return $.Deferred().reject();
                        // }
                    });
                }
                if (this.isOwner || !UserService.hasCurrentUser()) {
                    return promise;
                }
                return promise.then(function () {
                    return FriendService.getStatusWithUser(this.$route.params.username).then(function (response) {
                        switch (response.data.status) {
                            case "waiting": {
                                return this.isWaitingFriendship = true;
                            }
                            case "waitingForYourAnswer": {
                                return this.isWaitingForYourAnswer = true;
                            }
                            case "confirmed": {
                                return this.isConfirmedFriend = true;
                            }
                        }
                    }.bind(this));
                }.bind(this));
            },
            addFriend: function () {
                FriendService.addFriend(
                    this.$route.params.username
                ).then(function () {
                    if (this.isWaitingForYourAnswer) {
                        this.isWaitingForYourAnswer = false;
                        this.isConfirmedFriend = true;
                    } else {
                        this.isWaitingFriendship = true;
                    }
                }.bind(this));
            },
            reload: function () {
                this.loaded = false;
                let promise;
                if (this.$route.name === 'UserHome' || this.$route.name === 'home') {
                    this.tabMenu = 0;
                    promise = this.setupCenters();
                } else if (this.$route.name === 'FriendsUserHome') {
                    this.tabMenu = 1;
                    promise = this.setupFriendFlow();
                }
                promise.then(() => {
                    this.loaded = true;
                });
            }
        },
        mounted: function () {
            if (this.isTesting) {
                return;
            }
            this.reload();
        },
        computed: {
            isOwner: function () {
                if (!this.$store.state.user) {
                    return false;
                }
                return this.$route.params.username === undefined || this.$route.params.username === this.$store.state.user.username
            },
            isTesting: function () {
                return process.env.NODE_ENV == "test";
            }
        },
        watch: {
            tabMenu: function () {
                let pathName;
                if (this.tabMenu === 0) {
                    pathName = "UserHome";
                } else {
                    pathName = "FriendsUserHome";
                }
                if (this.$route.name !== 'home' && this.$route.name !== pathName) {
                    this.$router.push({
                        name: pathName,
                        params: {
                            username: this.$route.params.username
                        }
                    });
                }
            },
            '$route.name': function () {
                this.reload();
            }
        }
    }
</script>

<style scoped>
    .add-button-desktop {
        margin-top: -25px;
    }
</style>
