<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="">
        <v-tabs
                v-model="tabMenu"
                color="secondary"
                dark
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
                        <v-text-field
                                v-model="search"
                                prepend-icon="search"
                                :label="$t('centers')"
                                single-line
                                small
                                hide-details
                                class="ml-3"
                        ></v-text-field>
                        <v-tooltip v-if="$store.state.areCentersInGridView && $vuetify.breakpoint.mdAndUp" left>
                            <v-btn flat icon slot="activator" @click="$store.dispatch('setAreCentersInGridView', false)"
                                   class="mt-3">
                                <v-icon large>
                                    view_list
                                </v-icon>
                            </v-btn>
                            {{$t('userhome:toList')}}
                        </v-tooltip>
                        <v-tooltip v-if="!$store.state.areCentersInGridView && $vuetify.breakpoint.mdAndUp" left>
                            <v-btn flat icon slot="activator" @click="$store.dispatch('setAreCentersInGridView', true)"
                                   class="mt-3">
                                <v-icon large>
                                    view_module
                                </v-icon>
                            </v-btn>
                            {{$t('userhome:toGrid')}}
                        </v-tooltip>
                        <v-spacer></v-spacer>
                        <v-tooltip v-if="isOwner" left>
                            <v-btn icon float color="secondary" fab @click="createCenterVertex()" slot="activator">
                                <v-icon large>add</v-icon>
                            </v-btn>
                            <span>{{$t('userhome:createInfo')}}</span>
                        </v-tooltip>

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
                        <v-chip v-if="!isOwner && isWaitingFriendship" color="secondary" dark class="subheading">
                            {{$t('userhome:waitingFriend')}}
                        </v-chip>
                        <v-chip v-if="!isOwner && isConfirmedFriend" color="secondary" dark class="subheading">
                            {{$t('userhome:confirmedFriend')}}
                        </v-chip>
                    </v-card-title>
                    <v-card flat class="ma-0 pa-0" min-height="200" :class="{
                        'vh-center': !loaded
                    }">
                        <v-card-text class="pt-0">
                            <v-layout row wrap v-if="!loaded">
                                <v-flex xs12 class="vh-center">
                                    <v-progress-circular size="64" indeterminate color="third"></v-progress-circular>
                                </v-flex>
                            </v-layout>
                            <v-layout row wrap class="pt-0" v-if="loaded && centers">
                                <v-flex xs12 md6 v-if="centersFiltered.length === 0">
                                    <h3 class="subheading vh-center font-italic" v-if="centers.length === 0">
                                        {{$t('userhome:noBubbles')}}
                                    </h3>
                                    <v-list-tile slot="no-data" @click="createCenterVertex(search)"
                                                 v-if="centers.length !== 0 && centersFiltered.length === 0">
                                        <v-list-tile-content>
                                            <v-list-tile-title>
                                                {{$t('noSearchResults')}}
                                            </v-list-tile-title>
                                            <v-list-tile-sub-title>
                                                {{$t('create')}} "{{search}}"
                                            </v-list-tile-sub-title>
                                        </v-list-tile-content>
                                        <v-list-tile-action>
                                            <v-icon large>
                                                add
                                            </v-icon>
                                        </v-list-tile-action>
                                    </v-list-tile>
                                </v-flex>
                                <v-flex xs12 :md3="$store.state.areCentersInGridView"
                                        v-for="(center, index) in centersFiltered">
                                    <v-list two-line id="grid-list">
                                        <v-list-tile :href="center.uri().url()">
                                            <v-list-tile-content>
                                                <v-list-tile-title class="subheading font-weight-bold">
                                                    <v-icon class="mr-2" color="secondary">
                                                        {{center.getIcon()}}
                                                    </v-icon>
                                                    {{center.getLabel()}}
                                                    <small class="grey--text font-weight-normal font-italic mr-1 right"
                                                           v-if="$vuetify.breakpoint.mdAndUp">
                                                        {{center.lastVisit()}}
                                                    </small>
                                                </v-list-tile-title>
                                                <v-list-tile-sub-title class="mt-1">
                                                    <div v-for="(value, key) in center.getContext()"
                                                         v-if="center.contextSearch !== ''"
                                                         class="around-list-item">
                                                        {{value}}
                                                    </div>
                                                </v-list-tile-sub-title>
                                                <!--<v-list-tile-sub-title class="text-xs-right" >-->
                                                <!--{{center.lastVisit()}}-->
                                                <!--</v-list-tile-sub-title>-->
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-btn icon small @click.prevent="removeCenter(center, index)">
                                                    <v-icon color="secondary">
                                                        delete
                                                    </v-icon>
                                                </v-btn>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                    </v-list>
                                    <v-data-table
                                            :headers="headers"
                                            :items="centers"
                                            :pagination.sync="pagination"
                                            :search="search"
                                            select-all
                                            v-if="false"
                                            item-key="name"
                                            class="elevation-1"
                                    >
                                        <template slot="items" slot-scope="props">
                                            <td class="select-checkbox">

                                            </td>
                                            <td class="bubble-label subheading font-weight-bold">
                                                {{props.item.getLabel()}}
                                            </td>
                                            <td class="context around-list subheading">
                                                <div v-for="(value, key) in props.item.getContext()"
                                                     v-if="props.item.contextSearch !== ''"
                                                     class="around-list-item">
                                                    {{value}}
                                                </div>
                                            </td>
                                            <td class="px-0 last-visit subheading">
                                                {{props.item.lastVisit()}}
                                            </td>
                                        </template>
                                        <v-alert slot="no-results" :value="true" color="error" icon="warning">
                                            Your search for "{{ search }}" found no results.
                                        </v-alert>
                                    </v-data-table>
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
    import GraphElementType from '@/graph-element/GraphElementType'
    import I18n from '@/I18n'
    import Friends from '@/components/home/Friends.vue'
    import FriendService from '@/friend/FriendService'
    import UserService from '@/service/UserService'
    import AppController from '@/AppController'

    export default {
        name: "CentersList",
        components: {
            Friends
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
                }
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
                }
            });
            return {
                search: '',
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
                        'class': 'subheading'
                    },
                    {
                        text: this.$t('userhome:context'),
                        value: 'contextSearch',
                        'class': 'subheading'
                    },
                    {
                        text: this.$t('userhome:lastVisit'),
                        value: '',
                        'class': 'subheading'
                    }
                ],
                loaded: false,
                tabMenu: null,
                isWaitingFriendship: false,
                isConfirmedFriend: false,
                isWaitingForYourAnswer: false
            }
        },
        methods: {
            createCenterVertex: function (label) {
                AppController.createVertex(null, label);
            },
            removeCenter: function (centerToRemove, index) {
                CenterGraphElementService.removeCentersWithUri(
                    [centerToRemove.getUri()]
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
                let isOwner = this.$store.state.user && this.$store.state.user.username === this.$route.params.username;
                let centersRequest = isOwner ? CenterGraphElementService.getPublicAndPrivate() : CenterGraphElementService.getPublicOnlyForUsername(
                    this.$route.params.username
                );
                if (this.$route.name === "FriendsUserHome") {
                    this.tabMenu = 1;
                } else {
                    this.tabMenu = 0;
                }
                return centersRequest.then(function (response) {
                    this.centers = CenterGraphElement.fromServerFormat(response.data).map(function (center) {
                        center.labelSearch = center.getLabel();
                        center.contextSearch = Object.values(center.getContext()).join(' ');
                        return center;
                    }).sort(function (a, b) {
                        return b.getLastCenterDate() - a.getLastCenterDate();
                    });
                }.bind(this))
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
                if (this.$route.name === 'UserHome') {
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
            this.reload();
        },
        computed: {
            centersFiltered: function () {
                return this.centers.filter(function (center) {
                    let searchContent = center.labelSearch + ' ' + center.contextSearch;
                    return searchContent.toLowerCase().indexOf(this.search.toLowerCase()) > -1
                }.bind(this));
            },
            isOwner: function () {
                if (!this.$store.state.user) {
                    return false;
                }
                return this.$route.params.username === this.$store.state.user.username
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
                this.$router.push({
                    name: pathName,
                    params: {
                        username: this.$route.params.username
                    }
                });
            },
            '$route.name': function () {
                this.reload();
            }
        }
    }
</script>

<style>
    #bubbles-as-list .v-list__tile__title, .v-list__tile__sub-title {

    }

    .last-visit {
        width: 10%;
        white-space: normal;
    }

    .bubble-label, .context {
        text-overflow: ellipsis;
    }

    .bubble-label {
        width: 30%;
        white-space: normal;
        /*border-left: 1px solid $red;*/
    }

    .context {
        width: 60%;
    }

    #grid-list .v-list__tile--link {
        height: 90px;
    }

</style>
