<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div :key="menuKey"
         v-if="menuKey && $store.state.selected.length > 0 && ($store.state.selected.length > 1 || !single.loading)">
        <span v-for="button in buttons" :key="button.action">
            <Button :button="button" :controller="controller" :isInSideMenu="isInSideMenu" v-if="!button.isCustom"
                    @performed="forceRefresh"></Button>
            <Button :button="button" :isInSideMenu="isInSideMenu" :controller="controller"
                    v-if="button.isCustom && button.action === 'copy'">
                <v-btn slot="button"
                       icon
                       flat
                       v-clipboard:copy="copyContent"
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
                            return Selection.getSingle().isToTheLeft() ?
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
                        action: "identify",
                        ctrlShortcut: "G"
                    },
                    // {
                    //     icon: "label",
                    //     action: "identifyWhenMany",
                    //     ctrlShortcut: "G"
                    // },
                    {
                        icon: "lock",
                        action: "makePrivate",
                        ctrlShortcut: "P"
                    },
                    {
                        icon: "public",
                        action: "makePublic",
                        ctrlShortcut: "P"
                    },
                    {
                        icon: "share",
                        action: "setShareLevel"
                    },
                    {
                        icon: "file_copy",
                        action: "copy",
                        isCustom: true
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
                        icon: "merge_type",
                        action: "merge",
                        ctrlShortcut: "M"
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
            }
        },
        mounted: function () {
            this.single = Selection.getSingle();
            if (!this.single) {
                this.single = {
                    loading: true
                }
            }
            this.menuKey = IdUri.uuid();
        },
        computed: {
            copyContent: function () {
                return this.single.getLabel()
            },
            controller: function () {
                return Selection.controller();
            }
        }
    }
</script>

<style scoped>

</style>
