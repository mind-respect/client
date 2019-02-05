<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card flat>
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
                    return-object
            ></v-autocomplete>
        </v-card-text>
    </v-card>
</template>

<script>
    import UserService from '@/service/UserService'
    import Vue from 'vue'
    import I18n from '@/I18n'

    export default {
        name: "Friends",
        data: function () {
            I18n.i18next.addResources("en", "friends", {
                "search": "Users of Mind Respect",
                "addFriend": "Add as friend",
                "waiting": "Friendship request pending",
                "confirmed": "Friend",
                "confirm": "Confirm friendship request",
                "friends": "Friends"
            });
            I18n.i18next.addResources("fr", "friends", {
                "search": "Usagers de Mind Respect",
                "addFriend": "Ajouter comme ami",
                "waiting": "Requête d'amitié en attente",
                "confirmed": "Ami",
                "confirm": "Confirmer la demande d'amitié",
                "friends": "Amis"
            });
            return {
                searchValue: null,
                friendSearch: null,
                isLoading: false,
                users: []
            }
        },
        watch: {
            friendSearch: function () {
                // // Items have already been loaded
                // if (this.items.length > 0) return

                Vue.nextTick(function () {
                    if (this.isLoading) return;
                    if (!this.friendSearch) {
                        return;
                    }
                    if (this.friendSearch.trim() === "") {
                        this.users = [];
                        return;
                    }
                    this.isLoading = true;
                    UserService.search(this.friendSearch).then(function (response) {
                        this.users = response.data;
                    }.bind(this)).finally(() => (
                        this.isLoading = false
                    ))
                }.bind(this))
            }
        }
    }
</script>

<style scoped>

</style>
