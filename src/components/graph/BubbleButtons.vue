<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div v-if="selected">
        <span v-for="button in buttons" :key="button.action">
            <Button :button="button" :isInSideMenu="isInSideMenu" v-if="!button.isCustom"></Button>
            <Button :button="button" :isInSideMenu="isInSideMenu" v-if="button.isCustom && button.action === 'copy'">
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
    import SelectionHandler from '@/SelectionHandler'
    import Button from '@/components/graph/Button'

    export default {
        name: "BubbleButtons",
        components: {
            Button
        },
        data: function () {
            return {
                buttons: [
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
                    // {
                    //     icon: "label",
                    //     action: "identify"
                    // },
                    // {
                    //     icon: "label",
                    //     action: "identifyWhenMany",
                    //     ctrlShortcut: "G"
                    // },
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
                        icon: "fa-expand",
                        action: "subElements"
                    },
                    // {
                    //     icon: "merge_type",
                    //     action: "merge",
                    //     ctrlShortcut: "I"
                    // },
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
                        icon: "list",
                        action: "list"
                    }
                ]
            }
        },
        props: ['isInSideMenu'],
        computed: {
            copyContent: function () {
                return SelectionHandler.getSingle().getLabel()
            },
            selected: function(){
                return SelectionHandler.getSingle();
            }
        }
    }
</script>

<style scoped>

</style>
