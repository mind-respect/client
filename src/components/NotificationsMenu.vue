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
      <v-btn icon color="secondary" v-on="on" v-show="!isSearchFlow">
        <v-icon>
          notifications
        </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-for="notification in notifications" :key="notification.uri" :to="notification.rootUrl">
        {{ notification.creator }}
        {{ $t('notification:beforeAction') }}
        {{ notification.actionText }}
        {{ notification.watchLabel }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import I18n from '@/I18n'
import IdUri from "@/IdUri";
import NotificationService from "@/NotificationService";

export default {
  name: "NotificationsMenu",
  components: {},
  props: ['isSearchFlow'],
  data: function () {
    I18n.i18next.addResources("en", "notification", {
      beforeAction: "has",
      labelAction: "modified text of"
    });
    I18n.i18next.addResources("fr", "notification", {
      beforeAction: "a",
      labelAction: "modifier le texte de"
    });
    return {
      notifications: [],
      showNotificationsMenu: false
    }
  },
  mounted: async function () {
    this.notifications = this.formatNotifications(
        await NotificationService.get(0)
    );
  },
  methods: {
    formatNotifications: function (notifications) {
      return notifications.map((notification) => {
        notification.creator = IdUri.getOwnerFromUri(notification.watchUri);
        notification.actionText = this.$t('notification:' + notification.action + "Action");
        notification.rootUrl = IdUri.htmlUrlForBubbleUri(notification.rootUri);
        return notification;
      });
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