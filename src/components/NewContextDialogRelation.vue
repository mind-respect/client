<template>
    <div class="d-inline-block ml-4 mr-4">
        <div style="margin-bottom:-5px;">
            <small :class="{
                'line-through':lineThrough
            }">
                {{relation.getLabel()}}
            </small>
        </div>
        <div>
            <v-icon :class="{
                'flip-horizontal' : !isArrowToTheRight
            }" v-if="!lineThrough">
                arrow_right_alt
            </v-icon>
        </div>
    </div>
</template>

<script>
    export default {
        name: "NewContextDialogRelation",
        props: ['relation', 'mirror', 'lineThrough'],
        data: function () {
            return {};
        },
        computed: {
            isArrowToTheRight: function () {
                const isArrowToTheRight = (this.relation.isToTheLeft() && this.relation.isInverse()) || (!this.relation.isToTheLeft() && !this.relation.isInverse());
                return this.mirror ? !isArrowToTheRight : isArrowToTheRight;
            }
        }
    }
</script>

<style scoped>

</style>