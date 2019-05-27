<template>
    <v-card flat>
        <v-card-title class="pt-3 pb-0 subheading">
            <span class="pt-0 grey--text body-1 text-xs-center" v-if="selected.getComment() === ''">
                {{$t('noteMenu:noNote')}}
            </span>
            <v-spacer></v-spacer>
            <v-btn icon @click="$store.dispatch('setIsDescriptionFlow', true)">
                <v-icon color="third">
                    edit
                </v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text v-html="selected.getComment()" class="pt-0"></v-card-text>
    </v-card>
</template>

<script>
    import SelectionHandler from '@/SelectionHandler'
    import I18n from '@/I18n'

    export default {
        name: "NoteMenu",
        data: function () {
            I18n.i18next.addResources("en", "noteMenu", {
                "noNote": "No note"
            });
            I18n.i18next.addResources("fr", "noteMenu", {
                "noNote": "Pas de note"
            });
            return {};
        },
        computed: {
            selected: function () {
                return SelectionHandler.getSingle();
            }
        }
    }
</script>

<style scoped>

</style>