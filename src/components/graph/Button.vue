<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <span v-if="canDo(button)">
    <v-tooltip
            open-delay="0"
            close-delay="0"
            bottom
            :right="isInSideMenu"
            allow-overflow
            :attach="attach"
            max-width="400"
            :content-class="contentClass"
    >
        <v-btn flat icon slot="activator" @click="performAction(button)" :small="!isInMainMenu" color="primary">
            <v-icon :class="button.iconClass">
                {{getIcon(button)}}
            </v-icon>
        </v-btn>
        <span>
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
        props: ['button', 'isInTopMenu', 'isInSideMenu', 'buttonIndex'],
        data: function () {
            return {
                ctrlKey: UiUtils.isMacintosh() ? "⌘" : "ctrl"
            };
        },
        computed: {
            attach: function () {
                return this.isInMainMenu ? "#drawn_graph": false;
            },
            contentClass: function () {
                return this.isInSideMenu ? "ml-5" : "";
            },
            isInMainMenu: function () {
                return this.isInTopMenu || this.isInSideMenu;
            }
        },
        methods: {
            performAction: function (button) {
                let controller = this.getController(button);
                controller[
                    button.action
                    ]();
            },
            canDo: function (button) {
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

<style scoped>

</style>
