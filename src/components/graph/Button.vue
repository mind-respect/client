<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <span v-if="button.disableNotHide || canDo(button)">
    <v-tooltip
            open-delay="0"
            close-delay="0"
            bottom
            allow-overflow
            :attach="attach"
            max-width="400"
            :content-class="contentClass"
    >
        <slot name="button" v-if="$slots.button" slot="activator"></slot>
        <v-btn
                v-else
                flat
                icon
                :color="color"
                slot="activator"
                @click="performAction(button, $event)"
                :disabled="button.disableNotHide && !canDo(button)"
        >
            <v-icon :class="button.iconClass" :large="hightlight">
                {{getIcon(button)}}
            </v-icon>
        </v-btn>
        <slot name="tooltipContent" v-if="$slots.tooltipContent"></slot>
        <span v-else>
                {{$t('button:' + button.action)}}
                <span v-if="button.ctrlShortcut">
                    ({{ctrlKey}}+<span v-html="button.ctrlShortcut"></span>)
                </span>
            </span>
    </v-tooltip>
        </span>
</template>

<script>
    import UiUtils from '@/UiUtils'
    import Selection from '@/Selection'

    export default {
        name: "Button",
        props: ['button', 'hightlight', 'isInTopMenu', 'isInSideMenu', 'buttonIndex'],
        data: function () {
            return {
                ctrlKey: UiUtils.isMacintosh() ? "⌘" : "ctrl",
                color: "primary"
            };
        },
        mounted: function () {
            if (this.hightlight) {
                this.color = "third";
            }
        },
        computed: {
            attach: function () {
                return this.isInMainMenu ? "#mind_map" : false;
            },
            contentClass: function () {
                if (this.isInSideMenu) {
                    let contentClass = "side-button-tooltip ";
                    contentClass += this.$store.state.isSideMenuCollapsed ?
                        "side-button-collapsed-margin" :
                        "side-button-expanded-margin";
                    return contentClass;
                }
                return "bubble-menu-tooltip"
            },
            isInMainMenu: function () {
                return this.isInTopMenu || this.isInSideMenu;
            },
            bubble: function () {
                return Selection.isSingle() ? Selection.getSingle() : {};
            }
        },
        methods: {
            performAction: function (button, event) {
                let controller = this.controller(button);
                let promise = controller[
                    button.action
                    ](event);
                if (!promise || !promise.then) {
                    promise = Promise.resolve();
                }
                promise.then(() => {
                    this.$emit("performed")
                });
            },
            canDo: function (button) {
                if (this.bubble.loading) {
                    return false;
                }
                let controller = this.controller(button);
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
            controller: function (button) {
                if (button.controller) {
                    return button.controller;
                }
                return Selection.controller();
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
        position:fixed;
    }

    .side-button-expanded-margin {
        margin-left: 385px;
    }

    .side-button-collapsed-margin {
        margin-left: 95px;
    }

    .bubble-menu-tooltip {
        white-space: nowrap;
    }
</style>
