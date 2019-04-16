<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div
            @mouseover="isHover = true"
            @mouseleave="isHover = false"
    >
        <v-tooltip
                bottom
                allow-overflow
                :attach="attach"
                :nudge-width="400"
                max-width="200"
                :nudge-bottom="nudgeBottom"
                v-for="button in buttons"
                :key="button.action"
        >
            <v-btn flat icon v-if="canDo(button)" slot="activator">
                <v-icon :class="button.iconClass">
                    {{getIcon(button)}}
                </v-icon>
            </v-btn>
            <span>
                {{$t('button:' + button.action)}}
                <span v-if="button.ctrlShortcut">
                    ({{ctrlKey}}+{{button.ctrlShortcut}})
                </span>
            </span>
        </v-tooltip>
    </div>
</template>

<script>
    import SelectionHandler from '@/SelectionHandler'
    import UiUtils from '@/UiUtils'

    export default {
        name: "BubbleButtons",
        data: function () {
            return {
                isHover: false,
                ctrlKey: UiUtils.isMacintosh() ? "⌘" : "ctrl",
                buttons: [
                    {
                        action: "center",
                        icon: "fa-bullseye",
                        ctrlShortcut: "0"
                    },
                    {
                        action: "addChild",
                        icon: function () {
                            return SelectionHandler.getSingle().isToTheLeft() ?
                                "arrow_back" :
                                "arrow_forward"
                        }
                    },
                    {
                        icon: "arrow_downward",
                        action: "addSibling"
                    },
                    {
                        icon: "unfold_more",
                        action: "expand",
                        ctrlShortcut: "E"
                    },
                    {
                        icon: "unfold_less",
                        iconClass: "fa-strike",
                        action: "collapse",
                        ctrlShortcut: "H"
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
                        icon: "local_offer",
                        action: "identify"
                    },
                    {
                        icon: "fa-tags",
                        action: "identifyWhenMany",
                        ctrlShortcut: "G"
                    },
                    {
                        icon: "people",
                        action: "share"
                    },
                    {
                        icon: "lock",
                        action: "makePrivate",
                        ctrlShortcut: "P"
                    },
                    {
                        icon: "lock_open",
                        action: "makePublic",
                        ctrlShortcut: "P"
                    },
                    {
                        icon: "file_copy",
                        action: "copy"
                    },
                    {
                        icon: "fa-cut",
                        action: "cut",
                        ctrlShortcut: "X"
                    },
                    {
                        icon: "fa-paste",
                        action: "paste",
                        ctrlShortcut: "V"
                    },
                    {
                        icon: "fa-share",
                        action: "reverseToRight",
                        ctrlShortcut: "I"
                    },
                    {
                        icon: "fa-reply",
                        action: "reverseToLeft",
                        ctrlShortcut: "I"
                    },
                    {
                        icon: "fa-check",
                        action: "accept"
                    },
                    {
                        icon: "fa-compress",
                        action: "group"
                    },
                    {
                        icon: "fa-expand",
                        action: "subElements"
                    },
                    {
                        icon: "fa-handshake-o",
                        action: "merge",
                        ctrlShortcut: "I"
                    },
                    {
                        icon: "delete",
                        action: "remove"
                    },
                    {
                        icon: "select_all",
                        action: "selectTree",
                        ctrlShortcut: "A"
                    },
                    {
                        icon: "fa-arrows-h",
                        action: "convertToRelation",
                        ctrlShortcut: "O"
                    },
                    {
                        icon: "fa-arrows-h",
                        action: "convertToGroupRelation",
                        ctrlShortcut: "O"
                    },
                    {
                        icon: "fa-lightbulb-o",
                        action: "suggestions"
                    },
                    {
                        icon: "fa-list",
                        action: "list"
                    }
                ]
            }
        },
        props: ['isInMainMenu'],
        computed: {
            attach: function () {
                return this.isInMainMenu ? "body" : false;
            },
            nudgeBottom: function () {
                return this.isInMainMenu ? 35 : 0;
            }
        },
        methods: {
            canDo: function (button) {
                let controller = SelectionHandler.getControllerFromCurrentSelection();
                if (!this.canActionBePossiblyMade(button.action, controller)) {
                    return false;
                }
                var methodToCheckIfActionCanBePerformedForElements = controller[
                button.action + "CanDo"
                    ];
                if (undefined === methodToCheckIfActionCanBePerformedForElements) {
                    return true;
                }
                return methodToCheckIfActionCanBePerformedForElements.call(
                    controller
                );
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

<style scoped>

</style>
