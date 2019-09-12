<template>
    <div
            class="in-label-buttons text-center unselectable"
            style="height:100%;"
            :class="{
                                                     'in-label-icons-right': !isLeft && !isCenter,
                                                     'in-label-buttons-vertex' : bubble.isVertexType(),
                                                     'in-label-icons-left': isLeft && !isCenter
                                                    }"
    >
        <v-icon small :color="color" v-if="isCenter">
            filter_center_focus
        </v-icon>
        <v-icon small :color="color" v-if="hasComment">
            note
        </v-icon>
        <v-icon small :color="color" v-if="!bubble.isMeta() && hasIdentifications">
            label
        </v-icon>
        <v-icon small :color="color" v-if="bubble.isVertex()">
            {{shareIcon}}
        </v-icon>
        <small v-if="bubble.isVertex() && bubble.getNbDuplicates() > 0"
               class="body-2 font-weight-bold" style="color:#1A237E;">
            ×{{bubble.getNbDuplicates() + 1}}
        </small>
    </div>
</template>

<script>
    import ShareLevel from '@/vertex/ShareLevel'

    export default {
        name: "InLabelButtons",
        props: ['bubble', 'isCenter', 'isLeft'],
        data: function () {
            return {
                color: null
            }
        },
        mounted: function () {
            this.color = this.bubble.isVertexType() ? "secondary" : "white";
        },
        computed: {
            hasIdentifications: function () {
                return this.bubble.hasIdentifications();
            },
            hasComment: function () {
                return this.bubble.hasComment();
            },
            shareIcon: function () {
                return ShareLevel.getIcon(this.bubble.getShareLevel());
            }
        }
    }
</script>

<style>

    .in-label-buttons-vertex{
        margin-top:-5px;
    }

    .in-label-buttons-left {
        right: 4px;
    }

    .in-label-icons-left i, .in-label-icons-left small {
        margin-left: 5px;
    }

    .in-label-icons-right i, .in-label-icons-right small {
        margin-right: 5px;
    }
</style>