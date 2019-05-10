<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <span v-if="canDo(button)">
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
                slot="activator"
                @click="performAction(button, $event)"
                color="primary"
        >
            <v-icon :class="button.iconClass" dark :large="large">
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
    import SelectionHandler from '@/SelectionHandler'

    export default {
        name: "Button",
        props: ['button', 'large', 'isInTopMenu', 'isInSideMenu', 'buttonIndex'],
        data: function () {
            return {
                ctrlKey: UiUtils.isMacintosh() ? "⌘" : "ctrl"
            };
        },
        computed: {
            attach: function () {
                return this.isInMainMenu ? "#mind_map" : false;
            },
            contentClass: function () {
                return this.isInSideMenu ? "side-button-tooltip" : "bubble-menu-tooltip";
            },
            isInMainMenu: function () {
                return this.isInTopMenu || this.isInSideMenu;
            },
            bubble: function () {
                return SelectionHandler.isSingle() ? SelectionHandler.getSingle() : {};
            }
        },
        methods: {
            performAction: function (button, event) {
                let controller = this.getController(button);
                controller[
                    button.action
                    ](event);
            },
            canDo: function (button) {
                if (this.bubble.loading) {
                    return false;
                }
                let controller = this.getController(button);
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
            getController: function (button) {
                if (button.controller) {
                    return button.controller;
                }
                return SelectionHandler.getControllerFromCurrentSelection();
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
        margin-left: 385px;
        margin-top: -40px;
        white-space: nowrap;
    }

    .bubble-menu-tooltip {
        white-space: nowrap;
    }
</style>
