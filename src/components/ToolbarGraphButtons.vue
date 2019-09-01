<template>
    <div>
        <v-btn :to="'/user/' + $store.state.user.username"
               v-if="$store.state.user && $vuetify.breakpoint.lgAndUp" text active-class=""
               :icon="$vuetify.breakpoint.mdAndDown">
                <v-icon :class="{
                    'mr-2' : $vuetify.breakpoint.lgAndUp
                }">
                    filter_center_focus
                </v-icon>
                <span v-if="$vuetify.breakpoint.lgAndUp">
                    {{$t('centers')}}
                </span>
        </v-btn>
        <!--                <Button :button="undoButton" v-if="isGraphRoute"></Button>-->
        <!--                <Button :button="redoButton" v-if="isGraphRoute"></Button>-->
                <Button :button="zoomOutButton" v-if="isGraphRoute"></Button>
                <Button :button="zoomInButton" v-if="isGraphRoute"></Button>
                <Button :button="createVertexButton" :hightlight="true"
                        v-if="$store.state.user && $vuetify.breakpoint.lgAndUp"></Button>
                <SettingsMenu></SettingsMenu>
    </div>
</template>

<script>
    import AppController from '@/AppController'

    export default {
        name: "ToolbarGraphButtons",
        components: {
            SettingsMenu: () => import('@/components/SettingsMenu'),
            Button: () => import('@/components/graph/Button')
        },
        data: function () {
            return {
                undoButton: {
                    action: "undo",
                    icon: "undo",
                    ctrlShortcut: "Z",
                    controller: AppController,
                    disableNotHide: true
                },
                redoButton: {
                    action: "redo",
                    icon: "redo",
                    ctrlShortcut: "Y",
                    controller: AppController,
                    disableNotHide: true
                },
                zoomInButton: {
                    action: "zoomIn",
                    icon: "zoom_in",
                    ctrlShortcut: "&plus;",
                    controller: AppController
                },
                zoomOutButton: {
                    action: "zoomOut",
                    icon: "zoom_out",
                    ctrlShortcut: "&minus;",
                    controller: AppController,
                    disableNotHide: true
                },
                createVertexButton: {
                    action: "createVertex",
                    icon: "add",
                    controller: AppController
                }
            }
        },
        computed: {
            isGraphRoute: function () {
                return this.$route.name === "Center"
            }
        }
    }
</script>

<style scoped>

</style>