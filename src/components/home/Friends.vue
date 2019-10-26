<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        <v-card min-height="200">
            <v-card-text>
                <!--<v-icon>-->
                <!--people-->
                <!--</v-icon>-->
                <v-autocomplete
                        v-model="searchValue"
                        :items="users"
                        :loading="isLoading"
                        :search-input.sync="friendSearch"
                        color="secondary"
                        item-text="username"
                        item-value="username"
                        :placeholder="$t('friends:search')"
                        prepend-icon="people"
                        @change="visitUser()"
                        return-object
                        :no-data-text="$t('noSearchResults')"
                        v-if="isOwner"
                ></v-autocomplete>
                <v-card flat v-if="!loaded">
                    <v-card-text class="vh-center">
                        <v-layout wrap class="vh-center">
                            <v-flex xs12 class="vh-center">
                                <v-progress-circular size="64" indeterminate color="third"></v-progress-circular>
                            </v-flex>
                        </v-layout>
                    </v-card-text>
                </v-card>
                <v-card-text v-if="loaded && Object.keys(friends).length === 0" class="text-center headline grey--text">
                    {{$t('friends:noFriends')}}
                </v-card-text>
                <v-list v-if="loaded && Object.keys(friends).length > 0">
                    <v-list-item v-for="friend in friends" :to="'/user/' + friend.username">
                        <v-list-item-action>
                            <v-avatar class="text-uppercase teal white--text">{{friend.username.substring(0,2)}}
                            </v-avatar>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>
                                {{friend.username}}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-text>

            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import UserService from '@/service/UserService'
    import Vue from 'vue'
    import I18n from '@/I18n'
    import FriendService from "../../friend/FriendService";

    export default {
        name: "Friends",
        props: ['isOwner'],
        data: function () {
            I18n.i18next.addResources("en", "friends", {
                "search": "Users of Mind Respect",
                "addFriend": "Add as friend",
                "waiting": "Friendship request pending",
                "confirmed": "Friend",
                "confirm": "Confirm friendship request",
                "friends": "Friends",
                "noFriends": "No friends yet"
            });
            I18n.i18next.addResources("fr", "friends", {
                "search": "Usagers de Mind Respect",
                "addFriend": "Ajouter comme ami",
                "waiting": "Requête d'amitié en attente",
                "confirmed": "Ami",
                "confirm": "Confirmer la demande d'amitié",
                "friends": "Amis",
                "noFriends": "Pas encore d'amis"
            });
            return {
                searchValue: null,
                friendSearch: null,
                friends: null,
                isLoading: false,
                users: [],
                loaded: false
            }
        },
        watch: {
            friendSearch: function () {
                // // Items have already been loaded
                // if (this.items.length > 0) return
                Vue.nextTick(() => {
                    if (this.isLoading) return;
                    if (!this.friendSearch) {
                        return;
                    }
                    if (this.friendSearch.trim() === "") {
                        this.users = [];
                        return;
                    }
                    this.isLoading = true;
                    UserService.search(this.friendSearch).then((response) => {
                        this.users = response.data.map((user) => {
                            if (this.$store.state.user.username === user.username) {
                                user.disabled = true;
                            }
                            return user;
                        });
                    }).finally(() => (
                        this.isLoading = false
                    ))
                })
            }
        },
        methods: {
            visitUser: function () {
                Vue.nextTick(() => {
                    this.$router.push({
                        name: "UserHome",
                        params: {
                            username: this.searchValue.username
                        }
                    })
                });
            }
        },
        mounted: function () {
            FriendService.listForUser(this.$route.params.username).then((response) => {
                this.friends = response.data;
                this.loaded = true;
            });
        }
    }
</script>

<style scoped>

</style>
