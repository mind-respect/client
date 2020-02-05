<template>
    <div v-if="dialog">
        <v-dialog v-model="dialog" width="900">
            <v-card>
                <v-card-title class="pb-0">
                    <v-btn text small color="secondary"
                           @click="copy()">
                        <v-icon class="mr-2">content_copy</v-icon>
                        {{$t('copy')}}
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="dialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="pt-0">
                    <ListView ref="listView"></ListView>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

    import GraphUi from '@/graph/GraphUi'
    import KeyboardActions from '@/KeyboardActions'

    export default {
        name: "ListViewDialog",
        components: {
            ListView: () => import('@/components/ListView'),
        },
        data: function () {
            return {
                dialog: false
            };
        },
        computed: {
            isListViewFlow: function () {
                return this.$store.state.isListViewFlow;
            }
        },
        mounted: function () {
            this.$store.dispatch("setIsListViewFlow", false);
        },
        watch: {
            isListViewFlow: function () {
                if (this.isListViewFlow) {
                    this.dialog = true;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsListViewFlow", false);
                    GraphUi.enableDragScroll();
                    KeyboardActions.enable();
                } else {
                    GraphUi.disableDragScroll();
                    KeyboardActions.disable();
                }

            }
        },
        methods: {
            copy: function () {
                this.$refs.listView.copy();
            }
        }
    }
</script>

<style scoped>

</style>