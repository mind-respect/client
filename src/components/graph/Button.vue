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
            attach="#app"
            max-width="400"
            :content-class="contentClass"
    >
        <template v-slot:activator="{ on }">
            <span v-on="on">
                <slot name="button" v-if="$slots.button"></slot>
                <v-btn
                        v-else
                        icon
                        large
                        class="ma-1"
                        :color="color"
                        @click="performAction(button, $event)"
                        :disabled="button.disableNotHide && !canDo(button)"
                >
                    <v-icon :class="button.iconClass" :large="hightlight">
                        {{getIcon(button)}}
                    </v-icon>
                </v-btn>
            </span>
        </template>
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

    export default {
        name: "Button",
        props: ['button', 'hightlight', 'isInTopMenu', 'isInSideMenu', 'buttonIndex', 'controller'],
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
            isInMainMenu: function () {
                return this.isInTopMenu || this.isInSideMenu;
            }
        },
        methods: {
            performAction: function (button, event) {
                let controller = this.getController(button);
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
                let controller = this.getController(button);
                if (!this.canActionBePossiblyMade(button.action, controller)) {
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
</style>
