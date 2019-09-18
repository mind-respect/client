<template>
    <v-dialog v-model="dialog" v-if="dialog" width="900">
        <v-card>
            <v-card-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="dialog=false">
                    <v-icon>
                        close
                    </v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="vh-center">
                {{$t('docs:toCome')}}
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import I18n from '@/I18n'

    export default {
        name: "DocsDialog",
        data: function () {
            I18n.i18next.addResources("en", "docs", {
                toCome: "Coming soon"
            });
            I18n.i18next.addResources("fr", "docs", {
                toCome: "Section à venir"
            });
            return {
                dialog: false
            }
        },
        methods: {
            enter: function () {
                this.dialog = true;
            }
        }
    }
</script>

<style scoped>

</style>