<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-layout row wrap class="mt-5 pt-5">
        <v-flex xs4 v-for="center in centers">
            <v-card>
                <v-card-title>
                    {{center.getLabel()}}
                </v-card-title>
                <v-card-text>
                    {{center}}
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    import CenterGraphElementService from '@/center/CenterGraphElementService'
    import CenterGraphElement from '@/center/CenterGraphElement'

    export default {
        name: "CentersList",
        data: function () {
            return {
                centers: null
            }
        },
        methods: {
            getIconClassFromEl: function () {

            }
        },
        mounted: function () {
            CenterGraphElementService.getPublicAndPrivate().then(function (response) {
                this.centers = CenterGraphElement.fromServerFormat(response.data);
            }.bind(this))
        }
    }
</script>

<style scoped>

</style>
