<template>
    <div>
        <v-btn icon v-if="$store.state.user && $vuetify.breakpoint.smAndDown" @click="enterSearchFlow"
               v-show="!isSearchFlow">
            <v-icon color="primary">search</v-icon>
        </v-btn>
        <!--        <v-btn icon @click="$refs.docsFlow.enter()" v-if="isGraphRoute">-->
        <!--            <v-icon>help</v-icon>-->
        <!--        </v-btn>-->
        <v-btn :to="'/user/' + $store.state.user.username"
               v-if="$store.state.user" text exact
               :icon="$vuetify.breakpoint.mdAndDown" :isInTopMenu="true" v-show="!isSearchFlow">
            <v-icon :class="{
                    'mr-2' : $vuetify.breakpoint.lgAndUp
                }" color="primary">
                filter_center_focus
            </v-icon>
            <span v-if="$vuetify.breakpoint.lgAndUp">
                    {{$t('centers')}}
                </span>
        </v-btn>
        <Button :button="zoomOutButton" v-if="isGraphRoute" :isInTopMenu="true" v-show="!isSearchFlow"></Button>
        <Button :button="zoomInButton" v-if="isGraphRoute" :isInTopMenu="true" v-show="!isSearchFlow"></Button>
        <Button :button="createVertexButton" :hightlight="true"
                v-if="$store.state.user" :isInTopMenu="true" v-show="!isSearchFlow"></Button>
        <SettingsMenu v-show="!isSearchFlow"></SettingsMenu>
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
                isSearchFlow: false,
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
        methods: {
            enterSearchFlow: function () {
                this.isSearchFlow = true;
                this.$emit('enterSearchFlow');
            },
            leaveSearchFlow: function () {
                this.isSearchFlow = false;
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