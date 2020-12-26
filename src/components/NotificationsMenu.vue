<template>
  <v-menu
      offset-y
      left
      v-if="$store.state.user !== undefined && isUserHomeRoute"
      v-model="showNotificationsMenu"
      :close-on-content-click="false"
      z-index="14"
  >
    <template v-slot:activator="{ on }">
      <v-badge
          :color="notificationsColor"
          :content="nbUnreadNotifications"
          overlap
          offset-x="20" offset-y="22"
      >
        <v-btn icon color="secondary" v-on="on" v-show="!isSearchFlow" @click="updateUserConsultNotificationsDate">
          <v-icon>
            notifications
          </v-icon>
        </v-btn>
      </v-badge>
    </template>
    <v-list>
      <v-list-item v-for="notification in notifications" :key="notification.uri" :to="notification.rootUrl">
        <!--        <v-list-item-action>-->
        <!--          <v-avatar color="secondary" class="text-uppercase white&#45;&#45;text" x-small>-->
        <!--            {{ notification.creator.substring(0, 2) }}-->
        <!--          </v-avatar>-->
        <!--        </v-list-item-action>-->
        <v-list-item-content>
          <v-list-item-title>
            <router-link :to="'/user/' + notification.creator" class="bold-link">
              {{ notification.creator }}
            </router-link>
            {{ $t('notification:beforeAction') }}
            {{ notification.actionText }}
            {{ notification.watchLabel }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import I18n from '@/I18n'
import IdUri from "@/IdUri";
import NotificationService from "@/NotificationService";
import UserService from "@/service/UserService";

export default {
  name: "NotificationsMenu",
  components: {},
  props: ['isSearchFlow'],
  data: function () {
    I18n.i18next.addResources("en", "notification", {
      beforeAction: "has",
      labelAction: "modified text of",
      addVertexAndRelationAction: "added a bubble around",
      descriptionAction: "modified the note of"
    });
    I18n.i18next.addResources("fr", "notification", {
      beforeAction: "a",
      labelAction: "modifier le texte de",
      addVertexAndRelationAction: "ajouté une bulle autour de",
      descriptionAction: "modifié la note de"
    });
    return {
      notifications: [],
      showNotificationsMenu: false,
      notificationsColor: "transparent",
      nbUnreadNotifications: ""
    }
  },
  mounted: async function () {
    this.notifications = this.formatNotifications(
        await NotificationService.get(0)
    );
    this.refreshNbUnreadNotifications(this.$store.state.user.consultNotificationsDate || new Date(0))
  },
  methods: {
    formatNotifications: function (notifications) {
      return notifications.map((notification) => {
        notification.creator = IdUri.getOwnerFromUri(notification.watchUri);
        notification.actionText = this.$t('notification:' + notification.action + "Action");
        notification.rootUrl = IdUri.htmlUrlForBubbleUri(notification.rootUri);
        return notification;
      });
    },
    updateUserConsultNotificationsDate: async function () {
      this.refreshNbUnreadNotifications(
          await UserService.updateConsultNotificationsDate()
      )
    },
    refreshNbUnreadNotifications: function (consultNotificationsDate) {
      this.nbUnreadNotifications = this.notifications.reduce(function (nbUnread, notification) {
        if (new Date(notification.creationDate) > consultNotificationsDate) {
          return nbUnread + 1;
        }
        return nbUnread;
      }, 0);
      this.notificationsColor = this.nbUnreadNotifications === 0 ? "transparent" : "third";
    }
  },
  computed: {
    isUserHomeRoute: function () {
      return this.$route.name === "UserHome"
    }
  }
}
</script>

<style>

</style>