<template>
    <v-list-item @click="click" v-show="nbLastResults !== 0 && searchText !== '' && (!noCreateButton || !isAllLoaded)">
        <v-list-item-content v-show="!isAllLoaded && !isLoading">
            <v-list-item-title class="text-center text-uppercase caption">
                {{$t('moreResults')}}
            </v-list-item-title>
        </v-list-item-content>
        <v-list-item-content v-show="isAllLoaded && !noCreateButton && !isLoading">
            <v-list-item-subtitle class="font-weight-bold">
                <span>
                    {{$t('create')}}
                </span>
                "{{searchText}}"
            </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action v-show="isAllLoaded && !noCreateButton && !isLoading">
            <v-icon>add</v-icon>
        </v-list-item-action>
        <v-list-item-content v-show="isLoading">
            <v-progress-circular indeterminate color="third"></v-progress-circular>
        </v-list-item-content>
    </v-list-item>
</template>

<script>
    export default {
        name: "SearchLoadMore",
        props: ['noCreateButton'],
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
                this.isAllLoaded = false;
                this.nbLastResults = nbLastResults;
                this.searchText = searchText;
            },
            loadMore: function () {
                this.isLoading = true;
                this.$emit('loadMore', (nbLastResults) => {
                    this.nbLastResults = nbLastResults;
                    this.isLoading = false;
                });
            },
            click: function () {
                if (this.isLoading) {
                    return;
                }
                this.isAllLoaded ? this.$emit('create') : this.loadMore();
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