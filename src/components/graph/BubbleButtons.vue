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
            <Button :button="button" :controller="controller" :isInSideMenu="isInSideMenu" v-show="!button.isCustom"
                    @performed="forceRefresh"></Button>
            <Button :button="button" :isInSideMenu="isInSideMenu" :controller="controller"
                    v-show="button.isCustom && button.action === 'copy'" class="">
                <v-btn slot="button"
                       icon
                       color="primary"
                       text
                       @click="copyLabel"
                >
                    <v-icon>{{button.icon}}</v-icon>
                </v-btn>
                <span slot="tooltipContent">
                    {{$t('button:' + button.action)}}
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
                        action: "addChild",
                        icon: function () {
                            let single = Selection.getSingle();
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
                        icon: "arrow_downward",
                        action: "addSibling"
                    },
                    {
                        icon: "link",
                        badgeImage: "/wikipedia-white.svg",
                        action: "openWikipediaLink"
                    },
                    {
                        icon: "edit",
                        action: "focus"
                    },
                    {
                        icon: "unfold_more",
                        action: "expand",
                        ctrlShortcut: "E"
                    },
                    {
                        icon: "unfold_less",
                        action: "collapse",
                        ctrlShortcut: "H"
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
                        icon: "note",
                        action: "note",
                        ctrlShortcut: "D"
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
                        action: "showTags",
                        ctrlShortcut: "G",
                        badge: function (bubble) {
                            return bubble.getTagsAndSelfIfRelevant().length;
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
                        icon: "content_copy",
                        action: "copy",
                        isCustom: true
                    },
                    {
                        icon: "content_cut",
                        action: "cut",
                        ctrlShortcut: "X"
                    },
                    {
                        icon: "content_paste",
                        action: "paste",
                        ctrlShortcut: "V"
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
                        icon: "select_all",
                        action: "selectTree",
                        ctrlShortcut: "A"
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
