<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
  <div :key="menuKey"
       v-if="menuKey && $store.state.selected.length > 0"
  >
        <span v-for="button in buttons" :key="button.action" :class="{
            'h-center': isInSideMenu
        }">
            <Button :button="button" :controller="controller" :isInSideMenu="isInSideMenu"
                    :hightlight="button.hightlight" :large="button.large" v-show="!button.isCustom"
                    @performed="forceRefresh"></Button>
            <Button :button="button" :isInSideMenu="isInSideMenu" :controller="controller"
                    v-show="button.isCustom && button.action === 'copy'" class="">
                <v-btn
                    slot="button"
                    icon
                    :color="isInSideMenu ? 'white' : 'primary'"
                    text
                    @click="copyLabel"
                    large
                >
                    <v-icon>{{ button.icon }}</v-icon>
                </v-btn>

                <span slot="tooltipContent">
                    {{ $t('button:' + button.action) }}
                </span>
            </Button>
        </span>
  </div>
</template>

<script>
import Selection from '@/Selection'
import Button from '@/components/graph/Button'
import IdUri from '@/IdUri'

export default {
  name: "BubbleButtons",
  components: {
    Button
  },
  data: function () {
    return {
      menuKey: null,
      single: null,
      buttons: [
        {
          icon: "delete",
          badgeIcon: "label",
          action: "removeTagFlow"
        },
        {
          icon: "link",
          action: "goToLink",
          hightlight: true,
          large: false
        },
        {
          action: "enterDuplicateMenu",
          color: "secondary",
          class: "font-weight-bold",
          text: function (bubbles) {
            if (bubbles[0] === undefined) {
              return "";
            }
            return "× " + (bubbles[0].getNbDuplicates() + 1);
          }
        },
        {
          action: "addBubbleMenu",
          icon: "add_circle_outline",
          menu: [
            {
              action: "addChild",
              disableNotHide: true,
              icon: function (bubbles) {
                let single = bubbles[0]
                if (!single) {
                  return "";
                }
                if (single.isCenter) {
                  return single.leftBubbles.length < single.rightBubbles.length ?
                      "arrow_back" :
                      "arrow_forward";
                } else {
                  return single.isToTheLeft() ?
                      "arrow_back" :
                      "arrow_forward"
                }
              }
            },
            {
              icon: "arrow_upward",
              action: "addSiblingUp",
              ctrlShortcut: "enter",
            },
            {
              icon: "arrow_downward",
              action: "addSibling",
            },
            {
              action: "addParent",
              icon: function (bubbles) {
                let single = bubbles[0];
                if (!single || single.isCenter) {
                  return "arrow_back";
                }

                return single.isToTheLeft() ?
                    "arrow_forward" :
                    "arrow_back";
              }
            }, {
              icon: "scatter_plot",
              action: "addExistingToParentFlow"
            }
          ]
        },
        {
          icon: "link",
          badgeImage: "/wikipedia-white.svg",
          action: "openWikipediaLink"
        },
        {
          icon: "edit",
          action: "focusDirectly"
        },
        {
          icon: "edit",
          action: "editMenu",
          menu: [
            {
              icon: "short_text",
              action: "focus"
            },
            {
              icon: "arrow_right_alt",
              action: "focusRelation",
              ctrlShortcut: "I"
            },
          ]
        },
        {
          icon: "unfold_more",
          action: "expand",
          ctrlShortcut: "E",
          disableNotHide: true
        },
        {
          icon: "unfold_less",
          action: "collapse",
          ctrlShortcut: "H",
          disableNotHide: true
        },
        {
          action: "moveBubbleMenu",
          icon: "open_with",
          menu: [
            {
              icon: "double_arrow",
              iconClass: "rotate-270",
              action: "moveCompletelyUp",
              shortcut: "pg up"
            },
            {
              icon: "expand_less",
              action: "moveUpOneStep",
              ctrlShortcut: "↑"
            },
            {
              icon: "expand_more",
              action: "moveDownOneStep",
              ctrlShortcut: "↓"
            },
            {
              icon: "double_arrow",
              iconClass: "rotate-90",
              action: "moveCompletelyDown",
              shortcut: "pg down"
            }
          ]
        },
        {
          icon: "note",
          action: "note",
          ctrlShortcut: "D"
        },
        {
          icon: "all_out",
          action: "collapseOthers"
        },
        {
          action: "center",
          icon: "filter_center_focus",
          ctrlShortcut: "0"
        },
        {
          icon: "photo",
          action: "images"
        },
        {
          icon: "label",
          action: "addTag",
          badgeIcon: "add"
        },
        {
          icon: "label",
          action: "tagTogether"
        },
        {
          icon: "label",
          action: "showTags",
          ctrlShortcut: "G",
          badge: function (bubbles) {
            return bubbles[0].getNbTagChildren();
          }
        },
        {
          icon: "label_off",
          action: "hideTags",
          ctrlShortcut: "G"
        },
        {
          icon: "merge_type",
          action: "merge",
          ctrlShortcut: "M"
        },
        {
          icon: "share",
          action: "setShareLevel"
        },
        {
          icon: "select_all",
          action: "selectTree",
          ctrlShortcut: "A"
        },
        {
          icon: "content_copy",
          action: "copyMenuBtn",
          menu: [
            {
              icon: "short_text",
              action: "copy",
              isCustom: true,
            },
            {
              icon: "device_hub",
              action: "copyTree",
              iconClass: function (bubbles) {
                return bubbles[0].isToTheLeft() ? "rotate-90" : "rotate-270"
              }
            }
          ]
        },
        {
          icon: "content_cut",
          action: "cut",
          badgeIcon: "device_hub",
          badgeIconClass: "rotate-270",
          ctrlShortcut: "X"
        },
        {
          icon: "content_paste",
          action: "pasteText",
          ctrlShortcut: "V",
          badgeIcon: "short_text"
        },
        {
          icon: "content_paste",
          action: "paste",
          badgeIcon: "device_hub",
          badgeIconClass: "rotate-270"
        },
        {
          icon: "navigate_next",
          action: "reverseToRight",
          ctrlShortcut: "I"
        },
        {
          icon: "navigate_before",
          action: "reverseToLeft",
          ctrlShortcut: "I"
        },
        {
          icon: "fa-check",
          action: "accept"
        },
        {
          icon: "fa-expand",
          action: "subElements"
        },
        {
          icon: "list",
          action: "viewAsList"
        },
        {
          icon: "arrow_right_alt",
          action: "convertToRelation",
          ctrlShortcut: "O"
        },
        {
          icon: "arrow_right_alt",
          action: "convertToGroupRelation",
          ctrlShortcut: "O"
        },
        {
          icon: "call_split",
          action: "leaveContext"
        },
        {
          icon: "color_lens",
          action: "setColor"
        },
        {
          icon: "delete",
          action: "remove"
        },
        {
          icon: "delete",
          badgeIcon: "arrow_right_alt",
          action: "removeRelation"
        },
        {
          icon: "fa-lightbulb-o",
          action: "suggestions"
        }
      ]
    }
  },
  props: ['isInSideMenu'],
  methods: {
    forceRefresh: function () {
      this.menuKey = IdUri.uuid();
      this.$emit("refresh")
    },
    copyLabel: function () {
      this.$copyText(
          Selection.getSingle().getLabelHtml().textContent
      )
    }
  },
  mounted: function () {
    this.menuKey = IdUri.uuid();
  },
  computed: {
    controller: function () {
      return Selection.controller();
    }
  }
}
</script>

<style scoped>

</style>
