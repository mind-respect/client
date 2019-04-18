<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        <span v-for="button in buttons" :key="button.action">
            <Button :button="button" :isInTopMenu="isInTopMenu"></Button>
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
                        icon: "fa-expand",
                        action: "subElements"
                    },
                    {
                        icon: "merge_type",
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
                        icon: "list",
                        action: "list"
                    }
                ]
            }
        },
        props: ['isInTopMenu']
    }
</script>

<style scoped>

</style>
