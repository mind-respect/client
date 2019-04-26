<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div>
        <span v-for="button in buttons" :key="button.action">
            <Button :button="button" :isInTopMenu="isInTopMenu" v-if="!button.isCustom"></Button>
            <v-tooltip
                    open-delay="0"
                    close-delay="0"
                    v-if="button.isCustom && button.action === 'copy'"
                    bottom
                    allow-overflow
                    :attach="attach"
            >
                <v-btn slot="activator"
                       icon
                       flat
                       v-clipboard:copy="copyContent"
                >
                    <v-icon>{{button.icon}}</v-icon>
                </v-btn>
                <span>
                    {{$t('button:' + button.action)}}
                </span>
            </v-tooltip>
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
                        icon: "label",
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
                        action: "copy",
                        isCustom: true
                    },
                    {
                        icon: "fa-cut",
                        action: "cut",
                        ctrlShortcut: "X"
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
        props: ['isInTopMenu'],
        computed: {
            attach: function () {
                return this.isInTopMenu ? "#drawn_graph" : false;
            },
            copyContent: function () {
                return SelectionHandler.getSingle().getLabel()
            }
        }
    }
</script>

<style scoped>

</style>
