<template>
    <v-list-item @click="click" v-show="nbLastResults !== 0 && searchText !== '' && !isAllLoaded">
        <v-list-item-content v-show="!isAllLoaded && !isLoading">
            <v-list-item-title class="text-center text-uppercase text-caption">
                {{$t('moreResults')}}
            </v-list-item-title>
        </v-list-item-content>
        <v-list-item-content v-show="isLoading">
            <v-progress-circular indeterminate color="third"></v-progress-circular>
        </v-list-item-content>
    </v-list-item>
</template>

<script>
    export default {
        name: "SearchLoadMore",
        props: [],
        data: function () {
            return {
                nbLastResults: 0,
                isAllLoaded: false,
                searchText: "",
                isLoading: false
            }
        },
        methods: {
            reset: function (nbLastResults, searchText) {
                this.nbLastResults = nbLastResults;
                this.searchText = searchText;
            },
            loadMore: function () {
                this.isLoading = true;
                this.$emit('loadMore', (nbLastResults, searchComponent) => {
                    if (searchComponent) {
                        /*
                            changing scroll top of menu because in main search notably, to
                            force display of new elements. I dont know why.
                        */
                        let menuElement = searchComponent.$refs.menu.$children[0].$el;
                        menuElement.scrollTop = menuElement.scrollTop - 1;
                    }
                    this.nbLastResults = nbLastResults;
                    this.isLoading = false;
                });
            },
            click: function () {
                if (this.isLoading) {
                    return;
                }
                this.loadMore();
            }
        },
        watch: {
            nbLastResults: function () {
                this.isAllLoaded = this.nbLastResults < 10;
            }
        }
    }
</script>

<style scoped>

</style>