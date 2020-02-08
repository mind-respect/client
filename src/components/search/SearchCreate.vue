<template>
    <v-list-item @click="click" v-show="nbLastResults !== 0 && searchText !== ''">
        <v-list-item-content>
            <v-list-item-subtitle class="font-weight-bold">
                <span>
                    {{$t('create')}}
                </span>
                "{{searchText}}"
            </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
            <v-icon>add</v-icon>
        </v-list-item-action>
    </v-list-item>
</template>

<script>
    export default {
        name: "SearchCreate",
        data: function () {
            return {
                nbLastResults: 0,
                searchText: ""
            }
        },
        methods: {
            reset: function (nbLastResults, searchText) {
                this.nbLastResults = nbLastResults;
                this.searchText = searchText;
            },
            click: function () {
                this.$emit('create');
            }
        }
    }
</script>

<style scoped>

</style>