<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="vh-center unselectable" v-if="loaded">
        <div class="hidden-properties-content bubble-size vh-center"
             :class="{
                'reverse' : bubble.direction === 'left'
             }"
             v-if="!loading && !bubble.loading"
        >
            <span>
                <v-tooltip
                        :right="!isLeft"
                        :left="isLeft"
                        min-width="125"
                        :content-class="tooltipContentClass"
                >
                    <template v-slot:activator="{ on }">
                        <div class="vh-center" style="height:100%;" v-on="on">
                            <v-btn icon @click="click">
                                <v-icon color="secondary" class="ma-0 pa-0">unfold_more</v-icon>
                            </v-btn>
                        </div>
                    </template>
                    <div style="white-space: nowrap;" :class="{
                        'reverse': isLeft
                    }">
                        <v-avatar color="secondary" size="18" :left="isLeft" style="height:100%;" :class="{
                            'mr-2' : !isLeft,
                            'ml-2' : isLeft
                        }">
                            <span class="white--text body-2">{{nbChild}}</span>
                        </v-avatar>
                        <span>{{$t('childNotice:' + tooltipKey)}}</span>
                    </div>
                </v-tooltip>
            </span>
        </div>
        <v-progress-circular indeterminate color="third" v-if="loading || bubble.loading"></v-progress-circular>
    </div>
</template>

<script>
    import Selection from '@/Selection'
    import Store from '@/store'
    import UiUtils from '@/UiUtils'

    export default {
        name: "ChildNotice",
        props: ['bubble'],
        data: function () {
            return {
                loaded: false,
                loading: false,
                tooltipKey: UiUtils.isMacintosh() ? "tooltipForMac" : "tooltip",
                isLeft: null,
                nbChild: null
            }
        },
        mounted: function () {
            this.isLeft = this.bubble.isToTheLeft();
            this.tooltipContentClass = this.isLeft ? "mr-4" : "ml-2";
            this.nbChild = this.$store.state.isViewOnly && this.bubble.isVertex() ? this.bubble.getNbPublicNeighbors() - 1 : this.bubble.getNumberOfChild();
            if (this.nbChild > 9) {
                this.nbChild = "9+";
            }
            this.loaded = true;
        },
        methods: {
            click: async function () {
                let expandedDuplicate = this.bubble.getExpandedDuplicates();
                if (expandedDuplicate.length) {
                    Selection.setToSingle(expandedDuplicate[0], true);
                    return;
                }
                this.loading = this.bubble.loading = true;
                Selection.setToSingle(this.bubble, true);
                await this.$nextTick();
                /*
                * waiting Selection.setToSingle(this.bubble); is complete with await this.$nextTick()
                * because setToSingle scrolls to bubble and expand to and sometimes 2 scrolls to bubble would be called
                */
                this.bubble.controller().expand().then(async () => {
                    this.$emit("expanded");
                    await this.$nextTick();
                    Store.dispatch("redraw");
                    await this.$nextTick();
                    this.loading = this.bubble.loading = false;
                });
            }
        }
    }
</script>

<style scoped>

</style>
