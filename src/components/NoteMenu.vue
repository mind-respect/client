<template>
    <v-card flat @click="$store.dispatch('setIsDescriptionFlow', true)" hover>
        <v-card-title class="pt-3 pb-0 subheading">
            <span class="pt-0 grey--text body-1 text-xs-center" v-if="bubble.getComment() === ''">
                {{$t('noteMenu:noNote')}}
            </span>
        </v-card-title>
        <v-card-text v-html="bubble.getComment()" class="pt-0"></v-card-text>
    </v-card>
</template>

<script>
    import I18n from '@/I18n'

    export default {
        name: "NoteMenu",
        props:['bubble'],
        data: function () {
            I18n.i18next.addResources("en", "noteMenu", {
                "noNote": "Empty note"
            });
            I18n.i18next.addResources("fr", "noteMenu", {
                "noNote": "Note vide"
            });
            return {};
        }
    }
</script>

<style scoped>

</style>