<template>
    <div
            class="in-label-buttons text-xs-center mt-0 unselectable"
            style="height:100%;"
            :class="{
                                                     'in-label-icons-right': !isLeft && !isCenter,
                                                     'in-label-icons-left': isLeft && !isCenter,
                                                     'in-label-buttons-vertex' : bubble.isVertex(),
                                                     'in-label-buttons-edge': bubble.isEdge() || bubble.isGroupRelation()
                                                    }"
            :key="bubble.inLabelMenuKey"
    >
        <v-icon small :color="color" v-if="isCenter">
            filter_center_focus
        </v-icon>
        <v-icon small :color="color" v-if="hasComment">
            note
        </v-icon>
        <v-icon small :color="color" v-if="hasIdentifications">
            label
        </v-icon>
        <v-icon small :color="color" v-if="bubble.isVertex() && bubble.isPrivate()">
            lock
        </v-icon>
        <v-icon small :color="color" v-if="bubble.isVertex() && bubble.isPublic()">
            public
        </v-icon>
        <v-icon small :color="color" v-if="bubble.isVertex() && bubble.isFriendsOnly()">
            people
        </v-icon>
        <small v-if="bubble.isVertex() && bubble.getNbDuplicates() > 0"
               class="body-2 font-weight-bold" style="color:#1A237E;">
            ×{{bubble.getNbDuplicates() + 1}}
        </small>
    </div>
</template>

<script>
    export default {
        name: "InLabelButtons",
        props: ['bubble', 'isCenter', 'isLeft'],
        data: function () {
            return {
                color: null
            }
        },
        mounted: function () {
            this.color = this.bubble.isVertex() ? "secondary" : "white";
        },
        computed: {
            hasIdentifications: function () {
                return this.bubble.hasIdentifications();
            },
            hasComment: function () {
                return this.bubble.hasComment();
            }
        }
    }
</script>

<style>
    .in-label-buttons-vertex {
        top: 20% !important;
    }

    .in-label-buttons-edge {
        margin-top: 15% !important;
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