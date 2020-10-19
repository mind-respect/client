<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <span v-if="button.disableNotHide || canDo(button)">
      <v-menu
          offset-y
          v-model="menu"
          :attach="attach"
          rounded="xl"
          :top="!isInSideMenu"
          :nudge-top="menuNudgeTop"
          :content-class="menuContentClass"
      >
        <template v-slot:activator="{ menu, menuAttrs }">
          <v-tooltip
              open-delay="0"
              close-delay="0"
              bottom
              allow-overflow
              :attach="attach"
              max-width="400"
              :content-class="contentClass"
          >
              <template v-slot:activator="{ on }">
                  <span v-on="on"
                        v-bind="on">
                      <v-badge
                          color="third" class="button-menu-badge ma-1" overlap
                          :value="button.badge !== undefined || button.badgeIcon !== undefined || button.badgeImage !== undefined"
                      >
                          <template v-slot:badge>
                              <span v-html="getBadge()" v-if="button.badge"></span>
                              <v-icon dark v-if="button.badgeIcon">{{ button.badgeIcon }}</v-icon>
                              <img v-if="button.badgeImage" :src="button.badgeImage" width="15">
                          </template>
                          <slot name="button" v-if="$slots.button"></slot>
                          <v-btn
                              v-else
                              icon
                              large
                              :color="color"
                              @click="performAction(button, $event)"
                              :disabled="button.disableNotHide && !canDo(button)"
                              :class="button.class"
                          >
                              <v-icon :class="button.iconClass" :large="hightlight" v-if="button.icon">
                                  {{ getIcon(button) }}
                              </v-icon>
                              <img v-if="button.image" :src="button.image" width="30">
                              <span v-if="button.text">
                                {{ button.text(controller.model()) }}
                              </span>
                          </v-btn>
                      </v-badge>
                  </span>
              </template>
              <slot name="tooltipContent" v-if="$slots.tooltipContent"></slot>
              <span v-else>
                      {{ $t('button:' + button.action) }}
                      <span v-if="button.ctrlShortcut">
                          ({{ ctrlKey }}+<span v-html="button.ctrlShortcut"></span>)
                      </span>
                      <span v-if="button.shortcut">
                          (<span v-text="button.shortcut"></span>)
                      </span>
                  </span>
          </v-tooltip>
        </template>
        <ButtonMenu v-if="button.menu" :menu="button.menu" @performed="$emit('performed')" :isInSideMenu="isInSideMenu"
                    :controller="controller"></ButtonMenu>
      </v-menu>
    </span>
</template>

<script>
import UiUtils from '@/UiUtils'

let isExecutingFeature = false;
export default {
  name: "Button",
  props: ['button', 'hightlight', 'isInTopMenu', 'isInSideMenu', 'buttonIndex', 'controller'],
  components: {
    ButtonMenu: () => import('@/components/graph/ButtonMenu')
  },
  data: function () {
    return {
      ctrlKey: UiUtils.isMacintosh() ? "⌘" : "ctrl",
      color: "primary",
      menu: false,
      menuNudgeTop: this.isInSideMenu ? 0 : 20
    };
  },
  mounted: function () {
    if (this.hightlight) {
      this.color = "third";
    }
    if (this.button.color) {
      this.color = this.button.color;
    }

  },
  computed: {
    contentClass: function () {
      if (this.isInSideMenu) {
        let contentClass = "bubble-menu-tooltip side-button-tooltip ";
        contentClass += this.$store.state.sideMenuFlow === false ?
            "side-button-collapsed-margin" :
            "side-button-expanded-margin";
        return contentClass;
      }
      return "bubble-menu-tooltip"
    },
    menuContentClass: function () {
      let menuContentClass = this.contentClass;
      if (this.isInSideMenu) {
        menuContentClass += " button-menu";
      }
      return menuContentClass;
    },
    isInMainMenu: function () {
      return this.isInTopMenu || this.isInSideMenu;
    },
    attach: function () {
      return this.isInMainMenu ? "#app" : false;
    }
  },
  methods: {
    getBadge: function () {
      return typeof this.button.badge === "function" ?
          this.button.badge(
              this.controller.model()
          ) : this.button.badge;
    },
    performAction: function (button) {
      if (button.menu) {
        this.menu = true;
        return;
      }
      if (isExecutingFeature) {
        return Promise.resolve();
      }
      isExecutingFeature = true;
      let controller = this.getController(button);
      let promise = controller[
          button.action
          ]();
      if (!promise || !promise.then) {
        promise = Promise.resolve()
      }
      promise.then(() => {
        this.$emit("performed");
        isExecutingFeature = false;
      });
    },
    canDo: function (button) {
      let controller = this.getController(button);
      if (!button.menu && !this.canActionBePossiblyMade(button.action, controller)) {
        return false;
      }
      let methodToCheckIfActionCanBePerformedForElements = controller[
      button.action + "CanDo"
          ];
      if (undefined === methodToCheckIfActionCanBePerformedForElements) {
        return true;
      }
      return methodToCheckIfActionCanBePerformedForElements.call(
          controller
      );
    },
    getController: function (button) {
      if (button.controller) {
        return button.controller;
      }
      return this.controller;
    },
    canActionBePossiblyMade: function (action, controller) {
      return controller[
          action
          ] !== undefined;
    },
    getIcon: function (button) {
      return typeof button.icon === "function" ?
          button.icon() :
          button.icon;
    }
  }
}
</script>

<style>
.side-button-tooltip {
  white-space: nowrap;
}

.side-button-expanded-margin {
  margin-left: 385px;
}

.side-button-collapsed-margin {
  margin-left: 95px;
}

.bubble-menu-tooltip {
  white-space: nowrap;
  margin-top: 10px;
}

.button-menu {
  position: fixed;
}

</style>
